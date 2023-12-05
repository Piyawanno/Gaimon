from gaimon.model.DynamicForm import DynamicForm
from gaimon.model.Day import Day
from gaimon.model.Month import Month
from gaimon.core.HTMLPage import COMPRESSOR
from gaimon.core.StaticCompressor import StaticCompressor, StaticType
from gaimon.core.Route import GET, POST
from gaimon.core.RESTResponse import RESTResponse, SuccessRESTResponse as Success
from xerial.ColumnType import ColumnType
from xerial.input.InputType import InputType
from xerial.Record import Record
from xerial.DateColumn import DATE_FORMAT
from xerial.DateTimeColumn import DATETIME_FORMAT
from packaging.version import Version
from typing import Dict, List
from sanic import response, Request
from datetime import datetime, date

import os, json, markdown, importlib, mimetypes, pystache, copy


class UtilityController:
	def __init__(self, application):
		from gaimon.core.AsyncApplication import AsyncApplication
		self.application: AsyncApplication = application
		self.extension = self.application.getExtensionInfo()
		self.entity: str = None
		self.resourcePath = self.application.resourcePath
		self.mustache = {}
		self.icon = {}
		self.extensionMustache = {}
		self.locale = {}
		self.extensionLocale = {}
		self.document = {}
		self.picture = {}
		with open("%s/country.json" % (self.resourcePath), encoding="utf-8") as fd:
			self.countries = json.loads(fd.read())
		with open("%s/language.json" % (self.resourcePath), encoding="utf-8") as fd:
			self.language = json.loads(fd.read())
		with open("%s/country-by-currency-code.json" % (self.resourcePath), encoding="utf-8") as fd:
			self.currency = json.loads(fd.read())
	
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

	@GET("/tab/extension", role=['guest'])
	async def getJSPageTabExtension(self, request):
		return Success(self.application.pageTabExtension)
	
	@GET("/input/<model>", role=['guest'])
	async def getModelInput(self, request, model: str):
		modelClass = self.session.model.get(model, None)
		if modelClass is None:
			modelClass = await self.application.dynamicHandler.getModel(model)
			if modelClass is None:
				return RESTResponse({
					'isSuccess': False,
					'message': f'Model {model} cannot be found.'
				})
		formList: List[DynamicForm] = await self.session.select(
			DynamicForm,
			"WHERE modelName=? and formType = 0",
			parameter=[model],
			limit=1
		)
		
		if not (hasattr(modelClass,'inputDict') and hasattr(modelClass,'input')) :
			Record.extractInput(modelClass, [])
		input = modelClass.inputDict
		mergedInput = modelClass.input
		if hasattr(modelClass,'__has_callable_default__' ) and modelClass.__has_callable_default__ :
			input = self.processDefault(modelClass)
			mergedInput = self.processMergedDefault(modelClass)
		
		result = {
			'isSuccess': True,
			'inputGroup': getattr(modelClass, 'inputGroup', None),
			'inputPerLine': getattr(modelClass, 'inputPerLine', None),
			'children': [i.toMetaDict() for i in modelClass.children],
			'input': input,
			'avatar': getattr(modelClass, '__avatar__', 'share/icon/logo_padding.png'),
			'isDefaultAvatar': getattr(modelClass, '__avatar__', None) is None,
			'mergedInput': mergedInput,
			'attachedGroup': modelClass.attachedGroup,
		}

		if len(formList) == 0: return RESTResponse(result)
		form = formList[0].toDict()
		self.processInput(form['inputList'], form['groupList'], result)
		return RESTResponse(result, ensure_ascii=False)

	def processDefault(self, modelClass) :
		input = []
		for i in modelClass.inputDict :
			copied:dict = copy.copy(i)
			default = copied.get('default', None)
			default = default() if callable(default) else default
			if hasattr(default, 'toDict') : default = default.toDict()
			elif isinstance(default, date) : default = default.strftime(DATE_FORMAT)
			elif isinstance(default, datetime) : default = default.strftime(DATETIME_FORMAT)
			copied['default'] = default
			input.append(copied)
		return input
	
	def processMergedDefault(self, modelClass) :
		mergedInput = []
		for i in modelClass.input :
			copied:dict = copy.copy(i)
			default = copied.get('default', None)
			default = default() if callable(default) else default
			if hasattr(default, 'toDict') : default = default.toDict()
			copied['default'] = default
			mergedInput.append(copied)
			sub = copied.get('input', None)
			if sub is None : continue
			for j in sub :
				default = j.get('default', None)
				default = default() if callable(default) else default
				if hasattr(default, 'toDict') : default = default.toDict()
				elif isinstance(default, date) : default = default.strftime(DATE_FORMAT)
				elif isinstance(default, datetime) : default = default.strftime(DATETIME_FORMAT)
				j['default'] = default
		return mergedInput

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

	def processInput(self, inputList, groupList, result={}):
		mergedInput = []
		groupMapper = {}
		groupParsedOrder = []
		for index, item in enumerate(groupList):
			parsedOrder = {
				'id': index + 1,
				'label': item['label'],
				'order': str(item['order']),
				'isGroup': True,
				'input': []
			}
			groupMapper[parsedOrder['label']] = parsedOrder
			parsedOrder['parsedOrder'] = Version(parsedOrder['order'])
			groupParsedOrder.append(parsedOrder)
			mergedInput.append(parsedOrder)
		groupParsedOrder.sort(key=lambda x: x['parsedOrder'])
		groupParsedOrder = [{
			'id': i['id'],
			'label': i['label'],
			'order': i['order']
		} for i in groupParsedOrder]
		result['inputGroup'] = groupParsedOrder

		inputs = []
		for item in inputList:
			config: Dict = item['input'].copy()
			del config['type']
			del config['order']
			del config['inputPerLine']
			if 'typeName' in config: del config['typeName']
			input: Dict = InputType.mapped[item['input']['type']](**config).toDict()

			input['parsedOrder'] = Version(str(item['input']['order']))
			input['columnType'] = ColumnType.mapped[item['type']].__name__
			input['columnName'] = item['name']
			input['isGroup'] = False
			input['inputPerLine'] = item['input']['inputPerLine']
			inputs.append(input)
			if 'group' in item['input'] and item['input']['group']['label'] in groupMapper:
				input['group'] = groupMapper[item['input']['group']['label']]['id']
				groupMapper[item['input']['group']['label']]['input'].append(input)
			else:
				mergedInput.append(input)
		mergedInput.sort(key=lambda x: x['parsedOrder'])
		inputs.sort(key=lambda x: x['parsedOrder'])
		result['input'] = []
		result['mergedInput'] = []
		for item in mergedInput:
			if item['isGroup'] and len(item['input']):
				item['input'].sort(key=lambda x: x['parsedOrder'])
				for input in item['input']:
					del input['parsedOrder']
			if 'parsedOrder' in item: del item['parsedOrder']
			result['mergedInput'].append(item)
		result['input'] = inputs
		return result

	@GET("/locale/<language>/<oldLanguage>", role=['guest'], hasDBSession=False)
	async def getLocale(self, request: Request, language, oldLanguage):
		path = f'{importlib.import_module("gaimon").__path__[-1]}/locale/'
		uid = request.ctx.session['uid']
		data = await self.readLocale(language, path, uid)
		return RESTResponse({'isSuccess': True, 'results': data}, ensure_ascii=False)

	async def readLocale(self, language: str, path: str, uid: int):
		if language in self.locale: return self.locale[language]
		for root, directories, files in os.walk(path):
			for i in files:
				with open('%s/%s' % (root, i), 'r', encoding='utf-8') as fd:
					content = fd.read()
					if not i.split('.')[0].split('-')[1] in self.locale: self.locale[i.split('.')[0].split('-')[1]] = {}
					self.locale[i.split('.')[0].split('-')[1]] = json.loads(content)
		await self.readAllExtensionLocale(language, uid)
		if language in self.locale:
			return self.locale[language]
		else:
			return {}

	async def readAllExtensionLocale(self, language: str, uid: int):
		locale = {}
		extensionList = await self.extension.getExtension(self.entity)
		for key in extensionList :
			locale.update(await self.readExtensionLocale(language, key))
		return locale

	async def readExtensionLocale(self, language, extension):
		if not extension in self.extensionLocale: self.extensionLocale[extension] = {}
		if language in self.extensionLocale[extension]:
			return self.extensionLocale[extension][language]
		path = f'{importlib.import_module(extension).__path__[-1]}/locale/'
		if not os.path.isdir(path): return {}
		for root, directories, files in os.walk(path):
			for i in files:
				if i[-5:] != '.json': continue
				with open('%s/%s' % (root, i), 'r', encoding='utf-8') as fd:
					content = fd.read()
					self.extensionLocale[extension][i.split('.')[0].split('-')[1]
													] = json.loads(content)
					if not i.split('.')[0].split('-')[1] in self.locale: self.locale[i.split('.')[0].split('-')[1]] = {}
					self.locale[i.split('.')[0].split('-')[1]].update(json.loads(content))
		if language in self.extensionLocale[extension]:
			return self.extensionLocale[extension][language]
		else:
			return {}

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
		tree = await self.extension.getTree(self.entity)
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
		tree = await self.extension.getTree(self.entity)
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