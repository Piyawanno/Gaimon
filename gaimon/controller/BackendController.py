from typing import Dict, List
from gaimon.core.Route import GET, POST
from gaimon.core.PermissionChecker import PermissionChecker
from gaimon.model.User import User
from gaimon.model.UserGroup import UserGroup
from gaimon.model.PermissionType import PermissionType
from xerial.ColumnType import ColumnType
from xerial.input.InputType import InputType

from packaging.version import Version

from sanic import response
from gaimon.core.RESTResponse import RESTResponse 

import os, json, struct, time, pystache

__SALT_TIME_LIMIT__ = 300.0

__BACKEND_JS__ = [
	'utils/Utils.js',
	'utils/GaimonSocket.js',
	'utils/GaimonSocketRegister.js',
	'utils/DateUtils.js',
	'lib/html5-qrcode.js',
	'lib/Autocomplete.js',
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
	'PersonalBar.js',
	'Notification.js',
	'MyAccount.js',
	'StatusBar.js',
	'Calendar.js',
	'Handbook.js',
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
	'protocol/TemplateCreatorProtocol.js'
]

__BACKEND_CSS__ = [
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
	'Switch.css',
	'AdvanceSwitch.css',
	'Flex.css',
	'Style.css',
	'AlertDialog.css',
	'DefaultTheme.css'
]

__INCOMPRESSIBLE_CSS__ = [
	'FontFamily.css',
]

__CACHED_PAGE__ = {}


class BackendController:
	def __init__(self, application):
		from gaimon.core.AsyncApplication import AsyncApplication
		self.application: AsyncApplication = application
		self.extensionLoader = self.application.extension
		self.title = self.application.title
		self.page = self.application.createPage()
		self.resourcePath = application.resourcePath
		self.renderer = pystache.Renderer()
		try:
			self.icon = application.icon
			self.fullTitle = application.fullTitle
		except:
			pass
		setattr(self.application, 'loginURL', self.application.rootURL + 'backend')

	@GET("/", role=['guest'])
	async def index(self, request, *argument, **option):
		if self.application.homeMethod is None:
			raise response.text('NOT FOUND', status=404)
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
		cached = __CACHED_PAGE__.get('backend', None)
		if cached is not None: return response.html(cached)
		self.page.setRequest(request)
		self.page.reset()
		self.page.title = self.title + " - BACKEND"
		self.setJS()
		self.setCSS()
		await self.setMenu()
		await self.setJSVar()
		template = self.theme.getTemplate('Backend.tpl')
		self.page.body = self.renderer.render(template, {'rootURI': self.page.rootURL}, )
		rendered = self.page.render(ID='backend')
		__CACHED_PAGE__['backend'] = rendered
		return response.html(rendered)

	def setJS(self):
		self.page.enableAllAddOns()
		self.page.js.extend(__BACKEND_JS__)
		extension = self.application.extension
		if not 'TITLE' in self.page.jsVar:
			self.page.jsVar['TITLE'] = self.title
		if not 'JS_EXTENSION' in self.page.jsVar:
			self.page.jsVar['JS_EXTENSION'] = {}
		self.page.extensionJS.update(extension.script)
		
		if not 'PAGE_EXTENSION' in self.page.jsVar:
			self.page.jsVar['PAGE_EXTENSION'] = {}
		
		pageExtension = self.page.jsVar['PAGE_EXTENSION']
		for name, extensionSet in extension.pageExtension.items():
			if name in pageExtension :
				pageExtension[name].union(extensionSet)
			else :
				pageExtension[name] = extensionSet
		self.page.jsVar['PAGE_EXTENSION'] = {k:list(v) for k,v in pageExtension.items()}

	def setCSS(self):
		self.page.extendCSS(__BACKEND_CSS__)
		self.page.extendIncompressibleCSS(__INCOMPRESSIBLE_CSS__)
		for extension in self.application.extension.css:
			self.page.extensionCSS[extension] = self.application.extension.css[extension]

	async def setMenu(self):
		self.setExtensionMenu()
		menu = self.application.config.get('menu', {})
		disable = menu.get('disable', [])
		entity = await self.application.configHandler.getEntityConfig(self.entity)
		if entity is not None :
			entityMenu = entity.get('menu', {})
			disable.extend(entityMenu.get('disable', []))
		self.page.jsVar['DISABLE_MENU'] = {i: i for i in disable}
		self.page.jsVar['DEFAULT_MENU'] = menu.get('default', "")

	def setExtensionMenu(self):
		if not 'MENU' in self.page.jsVar: self.page.jsVar['MENU'] = {}
		extensionMenu: Dict[str, List] = {}
		extensionMenuConfig: Dict[str, Dict] = {}
		for extension in self.application.extension.menu:
			self.page.jsVar['MENU'][extension] = self.application.extension.menu[extension
																					]
			if not extension in self.page.jsVar['JS_EXTENSION']:
				self.page.jsVar['JS_EXTENSION'][extension] = {}
			for item in self.application.extension.menu[extension]:
				if 'group' in item:
					item['group']['extension'] = extension
					try :
						ID = item['group']['ID']
					except :
						print(item)
					self.page.jsVar['JS_EXTENSION'][extension][ID] = f"{ID}.js"
					if not 'child' in item: continue
					if not item['group']['ID'] in extensionMenu:
						extensionMenu[item['group']['ID']] = []
						extensionMenuConfig[item['group']['ID']] = item['group']
					groupID = item['group']['ID']
					# if groupID != 'General':
					# 	self.page.extendJS([f"{groupID}.js"], extension)
					for subMenu in item['child']:
						subMenu['extension'] = extension
						self.page.jsVar['JS_EXTENSION'][extension][
							subMenu['ID']] = "%s.js" % (subMenu['ID'])
						# self.page.extendJS(["%s.js" % (subMenu['ID'])], extension)
					extensionMenu[item['group']['ID']].extend(item['child'])
				else:
					item['extension'] = extension
					item['hasChild'] = False
					self.page.jsVar['JS_EXTENSION'][extension][item['ID']
																] = "%s.js" % (item['ID'])
					extensionMenu[item['ID']] = [item]
					extensionMenuConfig[item['ID']] = item
		self.page.jsVar['EXTENSION_MENU'] = {
			i: self.sortExtensionMenu(extensionMenu[i]) for i in extensionMenu
		}
		self.page.jsVar['EXTENSION_MENU_CONFIG'] = self.sortExtensionMenu([
			extensionMenuConfig[i] for i in extensionMenuConfig
		])

		if not 'EXTENSION' in self.page.jsVar: self.page.jsVar['EXTENSION'] = {}
		for extension in self.application.extension.scriptName:
			self.page.jsVar['EXTENSION'][
				extension] = self.application.extension.scriptName[extension]

	async def setJSVar(self):
		self.page.jsVar['PermissionType'] = {
			i: PermissionType.__members__[i].value for i in PermissionType.__members__
		}
		self.page.jsVar['PermissionTypeMap'] = {
			self.page.jsVar['PermissionType'][i]: i
			for i in self.page.jsVar['PermissionType']
		}
		self.page.jsVar['ColumnType'] = {
			key: value.value for key,
			value in ColumnType.__members__.items()
		}
		self.page.jsVar['ColumnTypeMap'] = {
			self.page.jsVar['ColumnType'][i]: i for i in self.page.jsVar['ColumnType']
		}
		self.page.jsVar['InputType'] = {
			key: value.value for key,
			value in InputType.__members__.items()
		}
		self.page.jsVar['InputTypeMap'] = {
			self.page.jsVar['InputType'][i]: i for i in self.page.jsVar['InputType']
		}
		self.page.jsVar['ColumnTypeStringMap'] = {}
		self.page.jsVar["isWebSocket"] = self.application.isWebSocket
		for key, value in ColumnType.mapped.items():
			self.page.jsVar['ColumnTypeStringMap'][value.__name__] = key

		config = await self.application.configHandler.getEntityConfig(self.entity)
		self.page.jsVar["EntityConfig"] = config

	def sortExtensionMenu(self, extensionMenuConfig: List):
		for item in extensionMenuConfig:
			item['parsedOrder'] = Version(item['order'])
		extensionMenuConfig.sort(key=lambda x: x['parsedOrder'])
		for item in extensionMenuConfig:
			del item['parsedOrder']
		return extensionMenuConfig

	@GET("/backend/extension/enabled/get", role=['guest'])
	async def getEnabledExtension(self, request):
		results = [{
			'label': extension,
			'value': extension
		} for extension in self.application.extension.script]
		return RESTResponse({'isSuccess': True, 'results': results}, ensure_ascii=False)

	@GET("/backend/role/by/extension/get/<extension>", role=['guest'])
	async def getRoleByExtension(self, request, extension):
		if not extension in self.application.extension.role:
			return RESTResponse({
				'isSuccess': False,
				'message': 'Extension is not exist.'
			})
		role = self.application.extension.role[extension]
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
		user['userType']['role'] = self.getUserRole(request)
		return RESTResponse({'isSuccess': True, 'result': user}, ensure_ascii=False)

	@GET("/backend/login", role=['guest'], hasDBSession=False)
	async def login(self, request):
		request.ctx.session['uid'] = -1
		request.ctx.session['role'] = ['guest']
		cached = __CACHED_PAGE__.get('login', None)
		if cached is not None: return response.html(cached)
		await self.initRoot()
		self.page.setRequest(request)
		self.page.reset()
		self.page.title = "Gaimon - LOGIN"
		self.page.enableCrypto()
		self.page.js.append('utils/Utils.js')
		self.page.js.append('backend/BackendLogin.js')
		self.page.css.append('backend/BackendLogin.css')
		template = self.theme.getTemplate('Login.tpl')
		data = {
			'rootURL': self.page.rootURL,
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
		self.page.body = self.renderer.render(template, data)
		rendered = self.page.render(ID="backend.login")
		__CACHED_PAGE__['login'] = rendered
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

	def loadModule(self, request):
		for role in self.getUserRole(request).keys():
			path = f"{self.resourcePath}share/js/backend/Backend{role}.js"
			if os.path.isfile(path):
				file = f'backend/Backend{role}.js'
				if (file not in self.page.js): self.page.js.append(file)
			path = f"{self.resourcePath}share/cs/backend/Backend{role}.css"
			if os.path.isfile(path):
				file = f'backend/Backend{role}.css'
				if (file not in self.page.css): self.page.css.append(file)

	def getUserRole(self, request):
		result = {}
		if 'role' not in request.ctx.session:
			return result
		if 'root' in request.ctx.session['role']:
			for k in self.extensionLoader.getExtensionRole():
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