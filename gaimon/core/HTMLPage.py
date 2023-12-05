from gaimon.core.ThemeHandler import ThemeHandler
from gaimon.core.StaticCompressor import StaticCompressor, StaticType
from gaimon.util.PathUtil import conform

from typing import List, Dict, Tuple
from sanic.request import Request

import json, pystache

__PRELOAD__ = [
	'utils/Utils.js',
	'utils/GaimonSocket.js',
	'utils/Preloader.js',
]

__PRELOAD_SET__ = set(__PRELOAD__)
__PRELOAD_CONTENT__ = None

ExtendList = List[Dict[str, str]]
ExtendDict = Dict[str, List[str]]

COMPRESSOR: Dict[str, Tuple[StaticCompressor, StaticCompressor]] = {}


class HTMLPage:
	def __init__(
		self,
		rootURL: str,
		websocketURL: str,
		resourcePath: str,
		theme: ThemeHandler,
		isCompress: bool = True,
		isPreload: bool = True
	):
		self.originalRootURL = rootURL
		self.rootURL = rootURL
		self.websocketURL = websocketURL
		self.resourcePath = resourcePath
		self.theme = theme
		self.renderer = pystache.Renderer()
		self.isCompress = isCompress
		self.isPreload = isPreload
		self.googleAnalyticsCode = ""
		self.reset()

	def reset(self):
		self.css = ['Flex.css', 'Style.css', 'DefaultTheme.css']
		self.incompressibleCSS = []
		self.header = []
		self.js = [
			'utils/Protocol.js',
			'utils/Utils.js',
			'lib/mustache.min.js',
			'lib/DOMObject.js'
		]
		
		self.incompressibleJS = [
		]

		self.extensionJS = {}
		self.extensionCSS = {}
		self.extensionIncompressibleJS = {}
		self.extensionIncompressibleCSS = {}
		self.manifest = None
		self.hasManifest = False
		self.appIcon = None
		self.hasAppIcon = False
		self.favicon = 'share/icon/favicon.png'
		self.meta = []

		self.jsVar = {
			'rootURL': self.rootURL,
			'websocketURL': self.websocketURL,
			'isPreload': self.isPreload,
			'preloaded': None,
		}

		self.title = ''
		self.body = ''
	
	def setRequest(self, request:Request) :
		entity = request.headers.get('entity', None)
		if entity is not None :
			self.rootURL = f'{self.originalRootURL}{entity}/'
		else :
			self.rootURL = self.originalRootURL

	def extendCSS(self, css: List, extensionName: str=None):
		if extensionName is None:
			self.css.extend(css)
		else:
			extensionCSS: List = self.extensionCSS.get(extensionName, None)
			if extensionCSS is None:
				self.extensionCSS[extensionName] = css
			else:
				extensionCSS.extend(css)

	def extendIncompressibleCSS(self, css: List, extensionName: str=None) :
		if extensionName is None:
			self.incompressibleCSS.extend(css)
		else:
			extensionCSS: List = self.extensionIncompressibleCSS.get(
				extensionName,
				None
			)
			if extensionCSS is None:
				self.extensionIncompressibleCSS[extensionName] = css
			else:
				extensionCSS.extend(css)

	def extendJS(self, js: List, extensionName: str = None):
		if extensionName is None:
			self.js.extend(js)
		else:
			extensionJS: List = self.extensionJS.get(extensionName, None)
			if extensionJS is None:
				self.extensionJS[extensionName] = js
			else:
				extensionJS.extend(js)
		
	def extendIncompressibleJS(self, js: List, extensionName: str = None) :
		if extensionName is None:
			self.incompressibleJS.extend(js)
		else:
			extensionJS: List = self.extensionIncompressibleJS.get(
				extensionName,
				None
			)
			if extensionJS is None:
				self.extensionIncompressibleJS[extensionName] = js
			else:
				extensionJS.extend(js)


	def enableAllAddOns(self):
		self.enableFraction()
		self.enableCrypto()
		self.enableIndexedDB()
		self.enableAutocomplete()
		self.enableQuill()
		self.enableLeafLet()
		self.enableChart()
		self.enableZip()
		self.enableXSLX()
		self.enableEPUB()
		self.enableCropper()

	def enableFraction(self) :
		self.incompressibleJS.append('lib/fraction.min.js')

	def enableIndexedDB(self):
		self.js.append('utils/IndexedDBConnector.js')

	def enableAutocomplete(self):
		self.js.append('lib/Autocomplete.js')

	def enableQuill(self):
		self.js.append('lib/quill/quill.min.js')
		self.css.append('lib/quill/quill.core.css')
		self.css.append('lib/quill/quill.snow.css')

	def enableCropper(self):
		self.js.append('lib/cropper/cropper.min.js')
		self.css.append('lib/cropper/cropper.min.css')

	def enableLeafLet(self):
		self.js.append('lib/leaflet/leaflet-src.js')
		self.js.append('lib/leaflet/leaflet.draw.js')
		self.js.append('lib/leaflet/leaflet.toolbar.min.js')
		self.js.append('lib/leaflet/leaflet.draw-toolbar.js')
		# self.js.append('lib/src/control/Control.js')
		self.js.append('lib/leaflet/geosearch.umd.js')
		# self.js.append('lib/leaflet/leaflet.draw-toolbar.min.js')
		self.css.append('lib/leaflet/leaflet.css')
		self.css.append('lib/leaflet/leaflet.draw.css')
		self.css.append('lib/leaflet/leaflet.toolbar.min.css')		
		self.css.append('lib/leaflet/leaflet.draw-toolbar.min.css')
		self.css.append('lib/leaflet/geosearch.css')

	def enableChart(self):
		self.js.append('lib/chart.min.js')
		self.js.append('lib/chartjs-plugin-datalabels.min.js')

	def enableZip(self):
		self.js.append('lib/jszip.js')

	def enableXSLX(self):
		self.js.append('lib/xlsx.js')

	def enableEPUB(self):
		self.js.append('lib/jszip.min.js')
		self.js.append('lib/epub.min.js')

	def enablePDF(self):
		self.js.append('lib/pdf/pdf.min.js')
		self.js.append('lib/pdf/pdf.worker.min.js')
		self.js.append('lib/pdf/viewer.js')
		self.css.append('lib/pdf/viewer.css')
		self.css.append('lib/pdf/pdf_viewer.min.css')

	def enableCrypto(self):
		self.js.append('lib/asmcrypto/errors.js')
		self.js.append('lib/asmcrypto/hash.js')
		self.js.append('lib/asmcrypto/utils.js')
		self.js.append('lib/asmcrypto/sha512.asm.js')
		self.js.append('lib/asmcrypto/sha512.js')
		self.js.append('lib/asmcrypto/pbkdf2-hmac-sha512.js')
		self.js.append('lib/asmcrypto/pbkdf2-core.js')
		self.js.append('lib/asmcrypto/hmac.js')
		self.js.append('lib/asmcrypto/hmac-sha512.js')
		self.js.append('lib/secure-random.js')

	def enableAuthentication(self):
		self.enableCrypto()
		self.js.append('Authentication.js')
		self.js.append('protocol/UserProtocol.js')

	def enableLogIn(self):
		self.enableCrypto()
		self.js.append('LoginPage.js')
		self.css.append('Login.css')
		self.css.append('Flex.css')

	def enableGoogleAnalytics(self, code):
		if code is None or len(code) == 0: return
		self.googleAnalyticsCode = code

	def render(self, ID: str = None):
		self.enableLogIn()
		if self.isCompress and ID is not None:
			return self.renderCompress(ID)
		else:
			return self.renderRegular()

	def renderCompress(self, ID: str = None):
		if self.isPreload:
			template = self.theme.getTemplate('MainPreload.tpl')
		else:
			template = self.theme.getTemplate('Main.tpl')
		absoluteJS = []
		jsPath = []

		for i in self.js:
			if self.isPreload and i in __PRELOAD__:
				continue
			if i[:7] == 'http://' or i[:8] == 'https://':
				absoluteJS.append(i)
			else:
				jsPath.append(f"{self.resourcePath}/share/js/{i}")

		incompressibleAbsolute, incompressibleInternal = self.checkURLOfJS(
			self.incompressibleJS
		)
		absoluteJS.extend(incompressibleAbsolute)
		absoluteJS.extend([f'{self.rootURL}{i}' for i in incompressibleInternal])

		if ID in COMPRESSOR:
			cssCompressor, jsCompressor = COMPRESSOR[ID]
		else:
			cssPath = []
			for i in self.css:
				cssPath.append(f"{self.resourcePath}/share/css/{i}")

			for extension, cssList in self.extensionCSS.items():
				for i in cssList:
					cssPath.append(f"{self.resourcePath}/share/{extension}/css/{i}")

			for extension, jsList in self.extensionJS.items():
				for i in jsList:
					jsPath.append(f"{self.resourcePath}/share/{extension}/js/{i}")

			cssCompressor = StaticCompressor(
				ID,
				StaticType.CSS,
				self.resourcePath,
				cssPath
			)
			jsCompressor = StaticCompressor(ID, StaticType.JS, self.resourcePath, jsPath)
			COMPRESSOR[ID] = cssCompressor, jsCompressor

		css = [i for i in cssCompressor.getContent()]
		print(css)
		css.extend([f"share/css/{i}" for i in self.incompressibleCSS])
		absoluteJS.extend(self.getAbsoluteExtensionJS(self.extensionIncompressibleJS))
		absoluteCSS = self.getAbsoluteExtensionCSS(self.extensionIncompressibleCSS)
		parameter = {
			'title': self.title,
			'rootURL': self.rootURL,
			'body': self.body,
			'meta': self.meta,
			'absoluteCSS': absoluteCSS,
			'internalCSS': css,
			'absoluteJS': absoluteJS,
			'internalJS': [i for i in jsCompressor.getContent()],
			'header': self.header,
			'favicon': self.favicon,
			'extensionJS': [],
			'extensionCSS': [],
			'jsVar': self.getJSVar(),
			'hasManifest': self.hasManifest,
			'manifest': self.manifest,
			'hasAppIcon': self.hasAppIcon,
			'appIcon': self.appIcon,
			'gTagID': self.googleAnalyticsCode
		}
		if self.isPreload:
			parameter['preload'] = self.readPreload()
		return self.renderer.render(template, parameter)

	def renderRegular(self):
		if self.isPreload:
			template = self.theme.getTemplate('MainPreload.tpl')
		else:
			template = self.theme.getTemplate('Main.tpl')
		css = self.css[:]
		css.extend(self.incompressibleCSS)
		js = self.js[:]
		js.extend(self.incompressibleJS)
		absoluteJS, internalJS = self.checkURLOfJS(js)

		if not self.manifest is None: self.hasManifest = True
		if not self.appIcon is None: self.hasAppIcon = True
		extensionJS = self.getExtensionJS(self.extensionJS)
		extensionJS.extend(self.getExtensionJS(self.extensionIncompressibleJS))

		extensionCSS = self.getExtensionCSS(self.extensionCSS)
		extensionCSS.extend(self.getExtensionCSS(self.extensionIncompressibleCSS))
		parameter = {
			'title': self.title,
			'rootURL': self.rootURL,
			'body': self.body,
			'meta': self.meta,
			'absoluteCSS': [],
			'internalCSS': [f'share/css/{i}' for i in css],
			'absoluteJS': absoluteJS,
			'internalJS': internalJS,
			'header': self.header,
			'favicon': self.favicon,
			'extensionJS': extensionJS,
			'extensionCSS': extensionCSS,
			'jsVar': self.getJSVar(),
			'hasManifest': self.hasManifest,
			'manifest': self.manifest,
			'hasAppIcon': self.hasAppIcon,
			'appIcon': self.appIcon,
			'gTagID': self.googleAnalyticsCode
		}
		if self.isPreload:
			parameter['preload'] = self.readPreload()
		return self.renderer.render(template, parameter)

	def readPreload(self):
		global __PRELOAD_CONTENT__
		if __PRELOAD_CONTENT__ is not None: return __PRELOAD_CONTENT__
		content = []
		for i in __PRELOAD__:
			with open(f'{self.resourcePath}share/js/{i}', 'rt') as fd:
				content.append(fd.read())

		__PRELOAD_CONTENT__ = '\n'.join(content)
		return __PRELOAD_CONTENT__

	def checkURLOfJS(self, js):
		added = set()
		checked = []
		for i in js:
			if self.isPreload and i in __PRELOAD_SET__:
				continue
			elif i[:7] == 'http://' or i[:8] == 'https://':
				path = i
			else:
				path = conform(i)
			if path in added: checked.remove(path)
			checked.append(path)
			added.add(path)

		absoluteJS = []
		internalJS = []
		for i in checked:
			if i[:7] == 'http://' or i[:8] == 'https://':
				absoluteJS.append(i)
			else:
				internalJS.append(f'share/js/{i}')
		return absoluteJS, internalJS

	def renderMobile(self):
		template = self.theme.getTemplate('MainMobile.tpl')
		self.jsVar = {k: json.dumps(v, ensure_ascii=False) for k, v in self.jsVar.items()}
		return self.renderer.render(template, {'page': self, 'jsVar': self.jsVar, })

	def renderError(self, errorCode: int, errorMessage: str):
		self.css.append('Error.css')
		template = self.theme.getTemplate('Error.tpl')
		self.body = self.renderer.render(
			template,
			{
				'rootURL': self.rootURL,
				'errorCode': errorCode,
				'errorMessage': errorMessage,
			}
		)
		return self.render()

	def getJSVar(self):
		return [{
			'key': k,
			'value': json.dumps(v,
								ensure_ascii=False)
		} for k,
				v in self.jsVar.items()]

	def getExtensionJS(self, source: ExtendDict) -> ExtendList:
		extensionJS = []
		for name, jsList in source.items():
			checked = []
			added = set()
			for i in jsList:
				path = conform(i)
				if path in added:
					checked.remove(path)
				checked.append(path)
				added.add(path)
			for i in checked:
				extensionJS.append({'name': name, 'source': i})
		return extensionJS

	def getAbsoluteExtensionJS(self, source: ExtendDict) -> List[str]:
		extensionJS = []
		for name, jsList in source.items():
			checked = []
			added = set()
			for i in jsList:
				path = conform(i)
				if path in added:
					checked.remove(path)
				checked.append(path)
				added.add(path)
			for i in checked:
				extensionJS.append(f'{self.rootURL}/share/{name}/js/{i}')
		return extensionJS

	def getExtensionCSS(self, source: ExtendDict) -> ExtendList:
		extensionCSS = []
		for name, cssList in source.items():
			checked = []
			added = set()
			for i in cssList:
				path = conform(i)
				if path in added:
					checked.remove(path)
				checked.append(path)
				added.add(path)

			for i in checked:
				extensionCSS.append({'name': name, 'source': i})
		return extensionCSS

	def getAbsoluteExtensionCSS(self, source: ExtendDict) -> ExtendList:
		extensionCSS = []
		for name, cssList in source.items():
			checked = []
			added = set()
			for i in cssList:
				path = conform(i)
				if path in added:
					checked.remove(path)
				checked.append(path)
				added.add(path)

			for i in checked:
				extensionCSS.append(f'{self.rootURL}/share/{name}/css/{i}')
		return extensionCSS

	def renderPermissionDenied(self):
		return "Permission Denied"
