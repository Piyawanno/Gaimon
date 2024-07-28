from enum import IntEnum
from gaimon.core.Route import GET, POST
from gaimon.core.PermissionChecker import PermissionChecker
from gaimon.core.HTMLPage import HTMLPage
from gaimon.core.RESTResponse import RESTResponse
from gaimon.core.ThemeHandler import ThemeHandler 
from gaimon.model.User import User
from gaimon.model.UserGroup import UserGroup
from gaimon.model.PermissionType import PermissionType
from gaimon.util.SarfunkelBrowser import SarfunkelBrowser
from xerial.ColumnType import ColumnType
from xerial.CurrencyColumn import CurrencyData
from xerial.input.InputType import InputType
from xerial.input.TableDisplayType import TableDisplayType
from gaimon.core.RESTResponse import (
	SuccessRESTResponse as Success
)

from gaimon.util.StepFlowUtil import StepFlowUtil

from typing import List, Dict
from packaging.version import Version
from sanic import response, Request

import os, json, struct, time, pystache

__SALT_TIME_LIMIT__ = 300.0

__BACKEND_JS__: List[str] = [
	'utils/Utils.js',
	'utils/GaimonSocket.js',
	'utils/GaimonSocketRegister.js',
	'utils/DateUtils.js',
	'utils/ColumnValueUtils.js',
	'utils/EventUtils.js',
	'utils/ThaiBaht.js',
	'lib/html5-qrcode.js',
	'lib/Autocomplete.js',
	'lib/InputDOMObject.js',
	'lib/InputGetterState.js',
	'lib/InputSetterState.js',
	'BackendMain.js',
	'Authentication.js',
	'AbstractPage.js',
	'AbstractInputUtil.js',
	'AbstractForm.js',
	'AbstractSearchForm.js',
	'AbstractTable.js',
	'AbstractTableForm.js',
	'AbstractPageInterface.js',
	'AbstractDialog.js',
	'AbstractView.js',
	'AbstractTableView.js',
	'AbstractProtocol.js',
	'ViewCreatorState.js',
	'ViewEventState.js',
	'TablePaginationRenderState.js',
	'TableRecordRenderState.js',
	'PersonalBar.js',
	'Notification.js',
	'MyAccount.js',
	'StatusBar.js',
	'Calendar.js',
	'Handbook.js',
	# NOTE It is not used and conflict with Sarfunkel.
	# 'CurrencyData.js',
	'DynamicLayoutCreator.js',
	'TemplateCreator.js',
	'TemplateLabelCreator.js',
	'TemplateImageCreator.js',
	'TemplateTableCreator.js',
	'DocumentStatusManagement.js',
	'DocumentSimpleStatusManagement.js',
	'VisualBlockCanvas.js',
	'VisualBlockCreator.js',
	'VisualBlockCreatorExtend.js',
	'page/CommonDashboard.js',
	'page/GeneralPage.js',
	'page/UserManagementPage.js',
	'page/PermissionRoleManagementPage.js',
	'page/DashboardManagementPage.js',
	'page/NotificationPage.js',
	'page/TemplatePage.js',
	'page/MyJobPage.js',
	'protocol/UserProtocol.js',
	'protocol/UnitProtocol.js',
	'protocol/UtilityProtocol.js',
	'protocol/PersonalScheduleProtocol.js',
	'protocol/NotificationProtocol.js',
	'protocol/TemplateCreatorProtocol.js',
	'protocol/StepFlowProtocol.js'
]

__BACKEND_CSS__: List[str] = [
	'backend/BackendMain.css',
	'backend/BackendForm.css',
	'backend/BackendInfo.css',
	'backend/BackendMenu.css',
	'backend/BackendContent.css',
	'backend/BackendDashboard.css',
	'backend/BackendSetting.css',
	'backend/BackendAbstract.css',
	'backend/BackendTemplate.css',
	'backend/Calendar.css',
	'backend/LayoutCreator.css',
	'backend/VisualBlockCreator.css',
	'README.css',
	'Step.css',
	'Error.css',
	'Switch.css',
	'AdvanceSwitch.css',
	'Flex.css',
	'Style.css',
	'AlertDialog.css',
	'DefaultTheme.css',
	'FontFamily.css',
]

__INCOMPRESSIBLE_CSS__: List[str] = [
	'FontFamily.css',
]

__CACHED_PAGE__ = {}

class AppPlatform (IntEnum) :
	WEB = 1
	NW = 2

class BackendController:
	def __init__(self, application):
		from gaimon.core.AsyncApplication import AsyncApplication
		self.application: AsyncApplication = application
		self.extension = self.application.getExtensionInfo()
		self.entity: str = None
		self.theme:ThemeHandler = None
		self.title = self.application.title
		self.resourcePath = application.resourcePath
		self.renderer = pystache.Renderer()
		try:
			self.icon = application.icon
			self.fullTitle = application.fullTitle
			self.favicon = application.favicon
			self.horizontalLogo = application.horizontalLogo
		except:
			pass
		self.sarfunkel = SarfunkelBrowser(application)
		self.stepUtil = StepFlowUtil(application)
		setattr(self.application, 'loginURL', self.application.rootURL + 'backend')

	@GET("/", role=['guest'], isHome=True)
	async def index(self, request, *argument, **option):
		if self.application.homeMethod is None:
			return response.text('NOT FOUND', status=404)
		uid = request.ctx.session['uid']
		home = self.application.config['home']
		encoded = home.encode().hex()
		return await self.application.homeMethod(request, *argument, **option)
	
	@GET("/service.js", role=['guest'])
	async def getServiceWorker(self, request, *argument, **option):
		if self.application.serviceWorkerMethod is None:
			return response.text('NOT FOUND', status=404)
		return await self.application.serviceWorkerMethod(request, *argument, **option)

	@GET("/backend", role=['guest'])
	async def renderIndex(self, request):
		entity = request.headers['entity']
		key = f"backend_{entity}"
		cached = __CACHED_PAGE__.get(key, None)
		if cached is not None: return response.html(cached)
		rendered = await self.getBackendPage(request, AppPlatform.WEB)
		__CACHED_PAGE__[key] = rendered
		return response.html(rendered)

	@GET("/backend/nw", role=['guest'])
	async def renderNWIndex(self, request):
		result = await self.getBackendPage(request, AppPlatform.NW)
		return Success(result)

	async def getBackendPage(self, request, platform:AppPlatform = AppPlatform.WEB):
		page = self.application.createPage()
		page.setRequest(request)
		page.reset()
		page.title = self.title + " - BACKEND"
		await self.setIcon(page)
		await self.setFavIcon(page)
		await self.setHorizontalLogo(page)
		await self.setJS(page, request, platform)
		await self.setCSS(page, request)
		await self.setMenu(page, request)
		await self.setJSVar(page, request)	
		page.jsVar['IS_MOBILE_APP'] = False
		template = self.theme.getTemplate('Backend.tpl')
		page.body = self.renderer.render(template, {'rootURI': page.rootURL})
		if platform == AppPlatform.WEB: return page.render(ID='backend')
		elif platform == AppPlatform.NW: return await self.getNWBackendPage(page)
		return

	async def getNWBackendPage(self, page: HTMLPage):
		page.jsVar['IS_MOBILE_APP'] = True
		rendered = page.render()
		result = {}
		keyJS = f'src="{page.rootURL}'
		replaceKeyJS = 'src="./'
		rendered = rendered.replace(keyJS, replaceKeyJS)
		keyCSS: str = f'href="{page.rootURL}'
		replaceKeyCSS = 'href="./'
		rendered = rendered.replace(keyCSS, replaceKeyCSS)
		parameter = page.getRegularRenderParameter()

		jsList = []
		for js in parameter['internalJS']:
			jsList.append(js)
		for js in parameter['extensionJS']:
			jsList.append(f'share/{js["name"]}/js/{js["source"]}')
		cssList = []
		for css in parameter['internalCSS']:
			cssList.append(css)
		for css in parameter['extensionCSS']:
			cssList.append(f'share/{css["name"]}/css/{css["source"]}')

		result['page'] = rendered
		result['js'] = jsList
		result['css'] = cssList
		result['font'] = ["share/font/OpenSans-VariableFont_wdth,wght.ttf"]
		result['view'] = {}
		result['view']['backend'] = self.theme.clientTemplate.get('backend', None)
		result['view']['frontend'] = self.theme.clientTemplate.get('frontend', None)
		result['view']['icon'] = self.theme.icon
		for key in self.theme.extensionClientTemplate:
			result['view'][key] = self.theme.extensionClientTemplate[key]
		return result
	
	async def setIcon(self, page: HTMLPage):
		if len(self.icon) == 0: page.icon = 'share/icon/logo.png'
		else: page.icon = self.icon
	
	async def setFavIcon(self, page: HTMLPage):
		if len(self.favicon) == 0: return
		page.favicon = self.favicon

	async def setHorizontalLogo(self, page: HTMLPage):
		if len(self.horizontalLogo) == 0: page.horizontalLogo = '/share/icon/ximple_dark.png'
		else: page.horizontalLogo = self.horizontalLogo

	async def setJS(self, page: HTMLPage, request: Request, platform: AppPlatform = AppPlatform.WEB):
		page.enableAllAddOns()
		page.enableSarfunkel(self.sarfunkel)
		page.js.extend(__BACKEND_JS__)
		if platform == AppPlatform.NW: page.js.append('utils/Utils_NW.js')
		if not 'TITLE' in page.jsVar:
			page.jsVar['TITLE'] = self.title
		if not 'LOGO' in page.jsVar:
			page.jsVar['LOGO'] = page.icon
		if not 'HORIZONTAL_LOGO' in page.jsVar:
			page.jsVar['HORIZONTAL_LOGO'] = page.horizontalLogo
		if not 'JS_EXTENSION' in page.jsVar:
			page.jsVar['JS_EXTENSION'] = {}
		page.extensionJS.update(await self.extension.getJS(request))
		
		if not 'PAGE_EXTENSION' in page.jsVar:
			page.jsVar['PAGE_EXTENSION'] = {}
		
		pageExtension = page.jsVar['PAGE_EXTENSION']
		pageExtensionConfig = await self.extension.getPageExtension(request)
		for name, extensionSet in pageExtensionConfig.items():
			if name in pageExtension :
				pageExtension[name].union(extensionSet)
			else :
				pageExtension[name] = extensionSet
		page.jsVar['PAGE_EXTENSION'] = {k:list(v) for k,v in pageExtension.items()}

	async def setCSS(self, page: HTMLPage, request: Request):
		page.extendCSS(__BACKEND_CSS__)
		page.extendIncompressibleCSS(__INCOMPRESSIBLE_CSS__)
		extensionCSS = await self.extension.getCSS(request)
		page.extensionCSS.update(extensionCSS)

	async def setMenu(self, page, request: Request):
		await self.setExtensionMenu(page, request)
		menu = self.application.config.get('menu', {})
		disable = menu.get('disable', [])
		entity = await self.application.configHandler.getEntityConfig(self.entity)
		if entity is not None :
			entityMenu = entity.get('menu', {})
			disable.extend(entityMenu.get('disable', []))
		page.jsVar['DISABLE_MENU'] = {i: i for i in disable}
		page.jsVar['DEFAULT_MENU'] = menu.get('default', "")

	async def setExtensionMenu(self, page: HTMLPage, request: Request):
		if not 'MENU' in page.jsVar: page.jsVar['MENU'] = {}
		extensionMenu: Dict[str, List] = {}
		extensionMenuConfig: Dict[str, Dict] = {}
		menuConfig = await self.extension.getMenu(request)
		for extension, menuList in menuConfig.items() :
			page.jsVar['MENU'][extension] = menuList
			if not extension in page.jsVar['JS_EXTENSION']:
				page.jsVar['JS_EXTENSION'][extension] = {}
			for item in menuList :
				if 'group' in item:
					groupExtension = item['group'].get("extension", extension)
					item['group']['extension'] = groupExtension
					try :
						ID = item['group']['ID']
					except :
						continue
					page.jsVar['JS_EXTENSION'][extension][ID] = f"{ID}.js"
					if not 'child' in item: continue
					if not item['group']['ID'] in extensionMenu:
						extensionMenu[item['group']['ID']] = []
						extensionMenuConfig[item['group']['ID']] = item['group']
					groupID = item['group']['ID']
					for subMenu in item['child']:
						subMenu['extension'] = extension
						subMenu['groupExtension'] = groupExtension
						page.jsVar['JS_EXTENSION'][extension][
							subMenu['ID']] = "%s.js" % (subMenu['ID'])
					extensionMenu[item['group']['ID']].extend(item['child'])
				else:
					item['extension'] = extension
					item['hasChild'] = False
					page.jsVar['JS_EXTENSION'][extension][item['ID']
																] = "%s.js" % (item['ID'])
					extensionMenu[item['ID']] = [item]
					extensionMenuConfig[item['ID']] = item
		page.jsVar['EXTENSION_MENU'] = {
			i: self.sortExtensionMenu(extensionMenu[i]) for i in extensionMenu
		}
		page.jsVar['EXTENSION_MENU_CONFIG'] = self.sortExtensionMenu([
			extensionMenuConfig[i] for i in extensionMenuConfig
		])

		if not 'EXTENSION' in page.jsVar: page.jsVar['EXTENSION'] = {}
		pageName = await self.extension.getPageName(request)
		page.jsVar['EXTENSION'].update(pageName)

	async def setJSVar(self, page, request: Request):
		page.jsVar['PermissionType'] = {
			i: PermissionType.__members__[i].value for i in PermissionType.__members__
		}
		page.jsVar['PermissionTypeMap'] = {
			page.jsVar['PermissionType'][i]: i
			for i in page.jsVar['PermissionType']
		}
		page.jsVar['ColumnType'] = {
			key: value.value for key,
			value in ColumnType.__members__.items()
		}
		page.jsVar['ColumnTypeMap'] = {
			page.jsVar['ColumnType'][i]: i for i in page.jsVar['ColumnType']
		}
		page.jsVar['InputType'] = {
			key: value.value for key,
			value in InputType.__members__.items()
		}
		page.jsVar['InputTypeMap'] = {
			page.jsVar['InputType'][i]: i for i in page.jsVar['InputType']
		}
		page.jsVar['ColumnTypeStringMap'] = {}
		page.jsVar["isWebSocket"] = self.application.isWebSocket
		for key, value in ColumnType.mapped.items():
			page.jsVar['ColumnTypeStringMap'][value.__name__] = key

		config = await self.application.configHandler.getEntityConfig(self.entity)
		page.jsVar["EntityConfig"] = config

		page.jsVar['CURRENCY_DATA_ORIGINAL'] = CurrencyData().toDict()
		component = await self.extension.getModelPageComponent(request)
		page.jsVar['COMPONENT'] = component
		page.jsVar['STEP_FLOW'] = await self.stepUtil.getAll(self.session)

	def sortExtensionMenu(self, extensionMenuConfig: List):
		for item in extensionMenuConfig:
			item['parsedOrder'] = Version(item['order'])
		extensionMenuConfig.sort(key=lambda x: x['parsedOrder'])
		for item in extensionMenuConfig:
			del item['parsedOrder']
		return extensionMenuConfig

	@GET("/backend/extension/enabled/get", role=['guest'])
	async def getEnabledExtension(self, request: Request):
		results = [{
			'label': extension,
			'value': extension
		} for extension in await self.extension.getJS(request)]
		return RESTResponse({'isSuccess': True, 'results': results}, ensure_ascii=False)

	@GET("/backend/role/by/extension/get/<extension>", role=['guest'])
	async def getRoleByExtension(self, request: Request, extension):
		roleMap = await self.extension.getRole(request)
		if not extension in roleMap :
			return RESTResponse({
				'isSuccess': False,
				'message': 'Extension is not exist.'
			})
		role = roleMap[extension]
		results = [{'label': item, 'value': item} for item in role]
		return RESTResponse({'isSuccess': True, 'results': results}, ensure_ascii=False)

	@GET('/backend/get/initial', role=['user'])
	async def getInitial(self, request):
		result = {}
		return RESTResponse({'isSuccess': True, 'result': result}, ensure_ascii=False)

	@GET("/backend/content/<main>", role=['guest'])
	async def renderContent(self, request, main):
		return response.text("Ok")

	@GET("/backend/get/user", role=['guest'])
	async def getUserData(self, request):
		uid = request.ctx.session.get('uid', None)
		if uid is None: json.dumps({'isSuccess': False, 'message': 'No UID found.'})
		userList = await self.session.select(User, 'WHERE id=?', parameter=[uid], limit=1)
		user = userList[0]
		rawUser = user.toTransportDict()
		if user.isRoot:
			rawUser['userType'] = {}
		else:
			userTypeList = await self.session.select(
				UserGroup,
				'WHERE id=?',
				parameter=[user['userTypeID']],
				limit=1
			)
			if len(userTypeList):
				rawUser['userType'] = userTypeList[0].toDict()
			else:
				rawUser['userType'] = {}
		user['userType']['role'] = await self.getUserRole(request)
		return RESTResponse({'isSuccess': True, 'result': user}, ensure_ascii=False)

	@GET("/backend/login", role=['guest'], hasDBSession=False)
	async def login(self, request):
		request.ctx.session['uid'] = -1
		request.ctx.session['role'] = ['guest']
		entity = request.headers['entity']
		key = f"login_{entity}"
		cached = __CACHED_PAGE__.get(key, None)
		if cached is not None: return response.html(cached)
		await self.initRoot()
		page = self.application.createPage()
		page.setRequest(request)
		page.reset()
		page.title = "Gaimon - LOGIN"
		page.enableCrypto()
		page.js.append('utils/Utils.js')
		page.js.append('backend/BackendLogin.js')
		page.css.append('backend/BackendLogin.css')
		template = self.theme.getTemplate('Login.tpl')
		data = {
			'rootURL': page.rootURL,
			'title': self.title,
			'icon': '',
			'fullTitle': ''
		}
		try:
			data['icon'] = self.icon
		except:
			pass
		try:
			data['fullTitle'] = self.fullTitle
		except:
			data['fullTitle'] = self.title
		page.body = self.renderer.render(template, data)
		rendered = page.render(ID="backend.login")
		__CACHED_PAGE__[key] = rendered
		return response.html(rendered)

	@GET("/backend/logout", role=['guest'], hasDBSession=False)
	async def logout(self, request):
		request.ctx.session['uid'] = -1
		request.ctx.session['role'] = ['guest']
		return response.redirect(self.application.loginURL)

	@POST("/backend/login/checkPermission", role=['guest'])
	async def checkPermission(self, request):
		data = request.json
		username = data['username']
		clause = "WHERE username=?"
		parameter = [username]
		userList = await self.session.select(User, clause, parameter=parameter, limit=1)
		if len(userList):
			user = userList[0]
			if user.username == username:
				hashed = bytes.fromhex(data['hashed'])
				salt = bytes.fromhex(data['salt'])
				encodedTime = bytes.fromhex(data['encodedTime'])
				hashTime, = struct.unpack('<d', encodedTime)
				now = time.time()
				if (now - hashTime) > __SALT_TIME_LIMIT__:
					return RESTResponse({
						"isSuccess": False,
						"message": "Password time expired."
					})
				elif user.checkPassword(hashed, salt, encodedTime):
					request.ctx.session['uid'] = user.id
					role = await PermissionChecker.processRole(self.session, user)
					request.ctx.session['role'] = list(role)
					request.ctx.session['role'].append('user')
					return RESTResponse({"isSuccess": True})
				else:
					return RESTResponse({
						"isSuccess": False,
						"message": "Password not correct."
					})
		return RESTResponse({
			"isSuccess": False,
			"message": "User %s cannot be found." % (username)
		})

	async def loadModule(self, request, page):
		userRole = await self.getUserRole(request).keys()
		for role in userRole :
			path = f"{self.resourcePath}share/js/backend/Backend{role}.js"
			if os.path.isfile(path):
				file = f'backend/Backend{role}.js'
				if (file not in page.js): page.js.append(file)
			path = f"{self.resourcePath}share/cs/backend/Backend{role}.css"
			if os.path.isfile(path):
				file = f'backend/Backend{role}.css'
				if (file not in page.css): page.css.append(file)

	async def getUserRole(self, request: Request):
		result = {}
		if 'role' not in request.ctx.session:
			return result
		if 'root' in request.ctx.session['role']:
			extensionRole = await self.extension.getExtensionRole(request)
			for k in extensionRole :
				result[k] = ['Create', 'Read', 'Update', 'Delete']
			return result
		for role in request.ctx.session['role']:
			if role not in ['root', 'user']:
				splitted = role.split('.')
				result[splitted[0]] = splitted[1]
		return result

	async def initRoot(self):
		userList = await self.session.select(User, "WHERE username='root'", limit=1)
		if len(userList):
			return
		else:
			salt = User.getSalt()
			user = User()
			user.username = 'root'
			user.passwordHash = User.hashPassword(b'password', salt)
			user.salt = salt.hex()
			user.isRoot = 1
			await self.session.insert(user)
	
	@GET("/enum/get", role=['guest'])
	async def getENUM(self, request):
		result = {}
		result['TABLE_DISPLAY_TYPE'] = {i:TableDisplayType.__members__[i].value for i in TableDisplayType.__members__}
		# result['TABLE_DISPLAY_TYPE'] = TableDisplayType.label
		return Success(result)