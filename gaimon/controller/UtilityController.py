from gaimon.model.Day import Day
from gaimon.model.Month import Month
from gaimon.core.HTMLPage import COMPRESSOR
from gaimon.core.StaticCompressor import StaticCompressor, StaticType
from gaimon.core.Route import GET, POST
from gaimon.core.RESTResponse import (
	RESTResponse,
	SuccessRESTResponse as Success,
	ErrorRESTResponse as Error,
)
from gaimon.util.InputProcessor import InputProcessor
from gaimon.util.ExcelTemplateGenerator import ExcelTemplateGenerator
from gaimon.util.SarfunkelBrowser import SarfunkelBrowser
from gaimon.util.LocaleUtil import readLocale
from xerial.AsyncDBSessionBase import AsyncDBSessionBase
from sanic import response, Request

import os, json, markdown, importlib, mimetypes, logging, io

class UtilityController (InputProcessor) :
	def __init__(self, application):
		from gaimon.core.AsyncApplication import AsyncApplication
		from gaimon.core.ThemeHandler import ThemeHandler
		self.application: AsyncApplication = application
		self.extension = self.application.getExtensionInfo()
		self.session: AsyncDBSessionBase = None
		self.entity: str = None
		self.resourcePath = self.application.resourcePath
		self.mustache = {}
		self.icon = {}
		self.extensionMustache = {}
		self.locale = {}
		self.extensionLocale = {}
		self.document = {}
		self.picture = {}
		self.theme: ThemeHandler = None
		self.readCountryData()
		self.sarfunkel = SarfunkelBrowser(application)
		
	
	def readCountryData(self) :
		import gaimon
		path = None
		for i in gaimon.__path__ :
			if os.path.isdir(i) :
				path = i
				break
		
		if path is None :
			logging.warning('*** No directory for module gaimon.')

		dataPath = f'{path}/data'
		with open("%s/country.json" % (dataPath), encoding="utf-8") as fd:
			self.countries = json.loads(fd.read())
		with open("%s/language.json" % (dataPath), encoding="utf-8") as fd:
			self.language = json.loads(fd.read())
		with open("%s/country-by-currency-code.json" % (dataPath), encoding="utf-8") as fd:
			self.currency = json.loads(fd.read())

	@GET("/sarfunkel", role=['guest'], hasDBSession=False)
	async def getSarfunkel(self, request) :
		content = self.sarfunkel.getContent()
		return response.raw(content, content_type='text/javascript')

	@POST("/log/register", role=['guest'], isLogData=True)
	async def recordLog(self, request) :
		return Success()

	@GET("/country/get/all", role=['guest'], hasDBSession=False)
	async def getAllCountry(self, request):
		return RESTResponse({'isSuccess': True, 'result': self.countries})

	@GET("/language/get/all", role=['guest'], hasDBSession=False)
	async def getAllLanguage(self, request):
		return RESTResponse({'isSuccess': True, 'result': self.language})

	@GET("/currency/get/all", role=['guest'], hasDBSession=False)
	async def getAllCurrency(self, request):
		return RESTResponse({'isSuccess': True, 'result': self.currency})

	@GET("/tab/extension", role=['guest'], hasDBSession=False)
	async def getJSPageTabExtension(self, request):
		return Success(self.application.pageTabExtension)
	
	@GET("/excel/template/<model>", role=['user'])
	async def getExcelTemplate(self, request: Request, model: str):
		modelClass = self.session.model.get(model, None)
		if modelClass is None: return Error(f'Model {model} cannot be found.')
		generator = ExcelTemplateGenerator(modelClass)
		buffer: io.BytesIO = await generator.generate(self.session)
		buffer.seek(0)
		return response.raw(buffer.read(), content_type='application/vnd.ms-excel')
	
	@GET("/input/<model>", role=['guest'])
	async def getModelInput(self, request, model: str):
		modelClass = self.session.model.get(model, None)
		if modelClass is None:
			modelClass = await self.application.dynamicHandler.getModel(model, self.session, self.entity)
			if modelClass is None:
				return RESTResponse({
					'isSuccess': False,
					'message': f'Model {model} cannot be found.'
				})
		result = await self.process(self.session, modelClass, model)
		return RESTResponse(result, ensure_ascii=False)
	
	@GET("/default/<model>", role=['guest'])
	async def getDefaultData(self, request, model: str):
		modelClass = self.session.model.get(model, None)
		if modelClass is None:
			modelClass = await self.application.dynamicHandler.getModel(model, self.session, self.entity)
			if modelClass is None:
				return RESTResponse({
					'isSuccess': False,
					'message': f'Model {model} cannot be found.'
				})
		defaultData = {}
		for name, column in modelClass.meta:
			data = column.default
			if callable(data): defaultData[name] = column.toDict(data())
			else: defaultData[name] = column.toDict(data)
		return Success(defaultData)

	@GET("/compress/css/<pageID>/<sequence>", role=["guest"], hasDBSession=False)
	async def getCSSCompress(self, request, pageID, sequence):
		sequence = int(sequence)
		if pageID in COMPRESSOR:
			cssCompressor, jsCompressor = COMPRESSOR[pageID]
		else:
			cssCompressor = StaticCompressor(
				pageID,
				StaticType.CSS,
				self.application.resourcePath,
				[]
			)
			cssCompressor.readCompressed()
			jsCompressor = StaticCompressor(
				pageID,
				StaticType.JS,
				self.application.resourcePath,
				[]
			)
			jsCompressor.readCompressed()
			COMPRESSOR[pageID] = cssCompressor, jsCompressor
		if sequence < len(cssCompressor.content):
			return response.text(cssCompressor.content[sequence], content_type='text/css')
		else:
			return response.text('Compressed CSS not found', status=404)

	@GET("/compress/js/<pageID>/<sequence>", role=["guest"], hasDBSession=False)
	async def getJSCompress(self, request, pageID, sequence):
		sequence = int(sequence)
		if pageID in COMPRESSOR:
			cssCompressor, jsCompressor = COMPRESSOR[pageID]
		else:
			cssCompressor = StaticCompressor(
				pageID,
				StaticType.CSS,
				self.application.resourcePath,
				[]
			)
			cssCompressor.readCompressed()
			jsCompressor = StaticCompressor(
				pageID,
				StaticType.JS,
				self.application.resourcePath,
				[]
			)
			jsCompressor.readCompressed()
			COMPRESSOR[pageID] = cssCompressor, jsCompressor
		if sequence < len(jsCompressor.content):
			return response.text(
				jsCompressor.content[sequence],
				content_type='application/javascript'
			)
		else:
			return response.text('Compressed CSS not found', status=404)

	@GET("/locale/<language>/<oldLanguage>", role=['guest'], hasDBSession=False)
	async def getLocale(self, request: Request, language, oldLanguage):
		path = f'{importlib.import_module("gaimon").__path__[-1]}/locale/'
		uid = request.ctx.session['uid']
		extensionList = await self.extension.getExtension(request)
		data = await readLocale(language, extensionList)
		return RESTResponse({'isSuccess': True, 'results': data}, ensure_ascii=False)

	@GET("/locale/set/<text>", role=['guest'], hasDBSession=False)
	async def setTextLocale(self, request, text):
		text = bytes.fromhex(text).decode()
		for language in self.locale:
			if not text in self.locale[language]:
				self.locale[language][text] = text
				path = 'locale/locale-%s.json' % (language)
				content = json.dumps(self.locale[language], ensure_ascii=False, indent=4)
				await self.application.static.storeStaticFile(path, content.encode())
		return RESTResponse({'isSuccess': True})

	@POST("/locale/chunk/set", role=['guest'], hasDBSession=False)
	async def setChunkTextLocale(self, request):
		for text in request.json['text']:
			if len(text) == 0: continue
			for language in self.locale:
				if not text in self.locale[language]:
					self.locale[language][text] = text
		for language in self.locale:
			path = 'locale/locale-%s.json' % (language)
			content = json.dumps(self.locale[language], ensure_ascii=False, indent=4)
			await self.application.static.storeStaticFile(path, content.encode())
		return RESTResponse({'isSuccess': True})

	@GET("/mustache/get/<branch>", role=['guest'], hasDBSession=False)
	async def getMustache(self, request, branch):
		template = self.theme.clientTemplate.get(branch, None)
		if template is not None:
			return RESTResponse({'isSuccess': True, 'results': template}, ensure_ascii=False)
		else:
			raise response.text('NOT FOUND', status=404)

	async def readTemplate(self, branch, path):
		template = {}
		for root, directories, files in os.walk(path):
			current = template
			for i in root.replace(path, '').split('/'):
				if len(i):
					if i not in current: current[i] = {}
					current = current[i]
			for i in files:
				with open('%s/%s' % (root, i), 'r', encoding='utf-8') as fd:
					current[i.split('.')[0]] = fd.read()
		self.mustache[branch] = template
		return self.mustache[branch]

	@GET("/mustache/each/get/<name>", role=['guest'], hasDBSession=False)
	async def getEachMustache(self, request, name):
		name = name.split('.')
		extension = name[0]
		name = name[1:]
		template = self.theme.extensionClientTemplate.get(extension, {})
		for item in name:
			if item in template: template = template[item]
			else: break
		if type(template) != str:
			return RESTResponse({
				'isSuccess': False,
				'message': 'Template is not exist.'
			})
		return RESTResponse({'isSuccess': True, 'results': template}, ensure_ascii=False)

	@GET("/mustache/extension/get/<extension>/<branch>", role=['guest'], hasDBSession=False)
	async def getExtensionMustache(self, request, extension, branch):
		if not extension in self.extensionMustache: self.extensionMustache[extension] = {}
		template = self.theme.extensionClientTemplate.get(extension, {})
		template = template.get(branch, {})
		return RESTResponse({'isSuccess': True, 'results': template}, ensure_ascii=False)

	async def readExtensionTemplate(self, extension, branch=None, path=''):
		if not extension in self.extensionMustache: self.extensionMustache[extension] = {}
		template = {}
		for root, directories, files in os.walk(path):
			current = template
			for i in root.replace(path, '').split('/'):
				if len(i):
					if i not in current: current[i] = {}
					current = current[i]
			for i in files:
				with open('%s/%s' % (root, i), 'r', encoding='utf-8') as fd:
					current[i.split('.')[0]] = fd.read()
		self.extensionMustache[extension] = template
		if branch is None: return self.extensionMustache[extension]
		if not branch in self.extensionMustache[extension]: return {}
		return self.extensionMustache[extension][branch]

	@GET("/mustache/icon/get", role=['guest'], hasDBSession=False)
	async def getMustacheIcon(self, request):
		return RESTResponse({'isSuccess': True, 'results': self.theme.icon}, ensure_ascii=False)

	async def readIconTemplate(self, ID, path):
		template = {}
		for root, directories, files in os.walk(path):
			current = template
			for i in root.replace(path, '').split('/'):
				if len(i):
					if i not in current: current[i] = {}
					current = current[i]
			for i in files:
				with open('%s/%s' % (root, i), 'r', encoding='utf-8') as fd:
					current[i.split('.')[0]] = fd.read()
		self.icon[ID] = template
		return self.icon[ID]

	@GET("/document/<locale>/<documentPath>", role=['guest'], hasDBSession=False)
	async def getDocument(self, request: Request, locale: str, documentPath: str):
		if '..' in documentPath : return response.text("Invalid document path", 501)
		if '..' in locale : return response.text("Invalid document path", 501)
		key = f"{locale}.{documentPath}"
		document = self.document.get(key, None)
		# if document is not None: return response.text(document)
		splitted = documentPath.split(".")
		module = '.'.join(splitted[:-1])
		uid = request.ctx.session['uid']
		tree = await self.extension.getExtensionTree(request)
		if not tree.isImported(module) :
			return response.text("Invalid document path", 501)
		path = importlib.import_module(module).__path__[-1]
		path = f'{path}/document/{locale}/{splitted[-1]}.md'
		if not os.path.isfile(path):
			return response.text("Document cannot be found.", status=404)
		with open(path, 'r', encoding='utf-8') as fd:
			raw = fd.read()
		document = markdown.markdown(raw)
		imagePath = f"{self.application.rootURL}document/pictures/{locale}/{module}/"
		document = document.replace("pictures/", imagePath)
		self.document[key] = document
		return response.text(document)

	@GET('/document/pictures/<locale>/<module>/<picturePath>', role=['guest'], hasDBSession=False)
	async def getPicture(self, request: Request, module: str, locale: str, picturePath: str):
		if '..' in module : return response.text("Invalid document path", 501)
		if '..' in locale : return response.text("Invalid document path", 501)
		key = f"{module}.{locale}.{picturePath}"
		raw = self.picture.get(key, None)
		fileType = mimetypes.guess_type(picturePath)
		if raw is not None : return response.raw(raw, content_type=fileType)
		uid = request.ctx.session['uid']
		tree = await self.extension.getExtensionTree(request)
		if not tree.isImported(module) :
			return response.text("Invalid document path", 501)
		path = importlib.import_module(module).__path__[-1]
		path = f'{path}/document/{locale}/pictures/{picturePath}'
		if not os.path.isfile(path):
			return response.text("Picture cannot be found.", status=404)
		with open(path, 'rb') as fd:
			raw = fd.read()
		self.picture[key] = raw
		return response.raw(raw, content_type=fileType)

	@GET('/gaimon/get/extension', role=['guest'], hasDBSession=False)
	async def getExtension(self, request):
		return Success(self.application.config["extension"])

	@GET("/get/day/enum", role=['guest'])
	async def getDayEnum(self, request):
		return response.json(
			{
				'isSuccess' : True,
				'result' : {
					'enum': {i:Day.__members__[i].value for i in Day.__members__},
					'label': Day.label,
				}	
			}
		)

	@GET("/get/month/enum", role=['guest'])
	async def getMonthEnum(self, request):
		return response.json(
			{
				'isSuccess' : True,
				'enum': {i:Month.__members__[i].value for i in Month.__members__},
				'label': Month.label,
			}
		)
	
	@GET('/utilily/health/check', role=['guest'])
	async def ping(self, request):
		return response.text('')