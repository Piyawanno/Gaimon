from gaimon.core.Authentication import Authentication
from gaimon.core.Application import Application
from gaimon.core.ExtensionLoader import ExtensionLoader
from gaimon.core.CommonExtensionInfoHandler import CommonExtensionInfoHandler
from gaimon.core.HTMLPage import HTMLPage
from gaimon.core.PermissionChecker import PermissionChecker
from gaimon.core.DynamicModelHandler import DynamicModelHandler
from gaimon.core.ConfigHandler import ConfigHandler
from gaimon.core.ThemeHandler import ThemeHandler
from gaimon.core.AsyncServiceClient import AsyncServiceClient
from gaimon.core.AsyncPushServiceClient import AsyncPushServiceClient
from gaimon.core.Route import Route
from gaimon.core.LoggerConfig import LOGGING_CONFIG
from gaimon.core.LogFlusher import LogFlusher
from gaimon.core.Logger import Logger
from gaimon.core.WebSocketManagement import WebSocketManagement
from gaimon.core.WebSocketHandler import WebSocketHandler
from gaimon.core.StaticFileHandler import StaticFileHandler
from gaimon.core.CommonDecorator import CommonDecoratorRule
from gaimon.core.ReplaceDecorator import ReplaceRule
from gaimon.util.PathUtil import copy
from gaimon.service.monitor.MonitorClient import MonitorClient
from gaimon.core.UserHandler import UserHandler
from xerial.AsyncDBSessionBase import AsyncDBSessionBase

from xerial.AsyncDBSessionPool import AsyncDBSessionPool
from xerial.Record import Record

from multiprocessing import cpu_count
from typing import List, Dict, Callable
from sanic import Sanic
from sanic_session import Session, RedisSessionInterface
from packaging.version import Version

import os, sys, logging, json, psutil, asyncio, importlib, traceback
import redis.asyncio as redis


Record.enableDefaultBackup()

if sys.platform == 'win32':
	# TODO Define path
	CONFIG_ROOT = ''
else:
	CONFIG_ROOT = '/etc/gaimon'

def processRouteEmpty(route:Route) :
	return route
class AsyncApplication(Application):
	def __init__(self, config: dict, namespace: str, isEnableShare=True):
		from gaimon.core.Extension import TabExtension
		from gaimon.util.PathUtil import conform
		self.config = config
		self.isDevelop = config.get("isDevelop", True)
		self.isCompress = config.get("isCompress", False)
		self.isWebSocket = config.get("isWebSocket", True)
		self.isPreload = config.get("isPreload", False)
		if self.isPreload and not self.isWebSocket:
			logging.warning(
				"*** Preload is disabled. To enable preload, websocket must be enabled."
			)
			self.isPreload = False
		Application.BASE_CONFIG = config
		self.userConfig = {}
		self.setNamespace(namespace)
		logConfig = self.setLog()
		self.sanicName = self.config.get("sanicName", self.__class__.__name__)
		if logConfig is not None:
			self.application = Sanic(self.sanicName, log_config=logConfig)
		else:
			self.application = Sanic(self.sanicName)
		self.isLocalConfig = True
		self.isEnableShare = isEnableShare
		if isEnableShare:
			self.application.static('/share', conform(f'{self.resourcePath}/share/'))
		self.rootURL = config['rootURL']
		self.websocketURL = config['websocketURL']
		self.rootPath = os.path.dirname(__file__)
		self.homeMethod = None
		self.serviceWorkerMethod = None
		self.modelModule = None
		self.extension = ExtensionLoader(self)
		self.configHandler = ConfigHandler(
			self.resourcePath,
			self.configPath,
			self.extension
		)
		self.theme = ThemeHandler(config['theme'], self.resourcePath, self.extension)
		self.title = config['title']
		self.config['language'] = config.get('language', 'th')
		self.icon = config.get('icon', '/share/icon/logo.png')
		self.favicon = config.get('favicon', '')
		self.horizontalLogo = config.get('horizontalLogo', '/share/icon/ximple_dark.png')
		self.fullTitle = config.get('fullTitle', self.title)
		self.session = None
		self.httpSession = Session()
		self.startSubroutine = []
		self.userConfig = {}
		self.modelVersion = {}
		self.mappedRoute = set()
		self.applicationID: int = None
		self.monitor = None
		self.monitorTask = None
		self.websocket = WebSocketManagement(self)
		self.taskList: List[asyncio.Task] = []
		self.static = StaticFileHandler(self)
		self.userHandler = UserHandler(self)
		self.pageTabExtension:TabExtension = {}
		self.replaceMap: Dict[str, ReplaceRule] = {}
		self.middlewareMap: Dict[str, PermissionChecker] = {}
		if not hasattr(self, 'middlewareClass') : self.middlewareClass = PermissionChecker
		self.initialDecorator()

	def __del__(self):
		pass

	async def getLanguage(self):
		return self.config['country']

	async def getConfig(self):
		return self.config

	async def getExtensionConfig(self, extensionPath: str):
		return self.extension.configuration.get(extensionPath, {})

	async def getUserConfig(self, uid: int):
		return self.userConfig.get(uid, {})

	def getExtensionInfo(self) -> CommonExtensionInfoHandler :
		return self.extension

	def createNotificationClient(self) -> AsyncServiceClient:
		return AsyncServiceClient(self.config['notification'])

	def createPushNotificationClient(self) -> AsyncPushServiceClient:
		return AsyncPushServiceClient(self.config['notification'])

	def loadController(self):
		self.controllerPool = {}
		self.controllerClass = {}
		self.controller = []
		for i in self.config['extension']:
			self.extension.loadController(i)
			self.extension.loadWebSocketHandler(i)
		self.map(self.controller)

	def browseWebSocket(self, directory, modulePath):
		for name in self.browseModule(directory) :
			try:
				module = importlib.import_module(f"{modulePath}.{name}")
				handlerClass = getattr(module, name)
				if handlerClass is None:
					continue
				if issubclass(handlerClass, WebSocketHandler):
					self.websocket.appendHandler(handlerClass(self))
			except:
				print(traceback.format_exc())

	def startMainLoop(self, loop):
		self.loop = loop

	def startWorkerLoop(self, loop: asyncio.BaseEventLoop):
		if self.logFlusher is not None:
			task = loop.create_task(self.logFlusher.startFlushLoop())
			self.taskList.append(task)

		if self.isProduction:
			name = f"GaimonApplication.{self.applicationID}"
			self.monitor = MonitorClient(name, self.config['monitor'])
			task = loop.create_task(self.monitor.startLoop())
			self.taskList.append(task)

	async def load(self, loop):
		self.connectionCount = 0
		await self.connect(loop)
		self.authen = Authentication(self)
		self.extension.checkPath()
		await self.readModelModification()
		for i in self.config['extension']:
			await self.extension.load(i, self.session)

		await self.configHandler.load()
		await self.initORM()
		for i in self.config['extension']:
			await self.extension.prepare(self.session)
		await self.theme.load()
		await self.extendInput()
		self.extendJSPageTab()

		for i in self.startSubroutine:
			await i(self, self.session)
	
	async def extendInput(self) :
		from gaimon.core.Extension import InputExtension
		extended:InputExtension = {}
		for extension in self.extension.extension.values() :
			extendedInput = await extension.getInputExtension(self.session.model)
			for modelName, inputList in extendedInput.items() :
				currentList = extended.get(modelName, [])
				if len(currentList) == 0 : extended[modelName] = currentList
				currentList.extend(inputList)
		
		extendedModel:InputExtension = {}
		for modelClass in self.session.model.values() :
			for _, column in modelClass.meta :
				for parent in column.parentModel :
					currentList = extendedModel.get(parent.__name__, [])
					if len(currentList) == 0 : extendedModel[parent.__name__] = currentList
					currentList.append(column.input)

		for name, modelClass in self.session.model.items() :
			inputList = extended.get(name, [])
			inputList.extend(extendedModel.get(name, []))
			Record.extractInput(modelClass, inputList)
	
	def extendJSPageTab(self) :
		from gaimon.core.Extension import TabExtension
		for extension in self.extension.extension.values() :
			extendedTab = extension.getJSPageTabExtension()
			for pageName, tabList in extendedTab.items() :
				currentList = self.pageTabExtension.get(pageName, [])
				if len(currentList) == 0 : self.pageTabExtension[pageName] = currentList
				currentList.extend(tabList)

	def registerStart(self, subroutine):
		self.startSubroutine.append(subroutine)

	async def connect(self, loop):
		redisConfig = self.config['redis']
		redisURL = f"redis://{redisConfig['host']}:{redisConfig['port']}"
		if 'db' in redisConfig:
			redisURL = f'{redisURL}/{redisConfig["db"]}'
		self.redisPool = redis.ConnectionPool.from_url(redisURL, decode_responses=True)
		self.redis = redis.Redis(connection_pool=self.redisPool, decode_responses=True)
		async def getConnection():
			return redis.Redis(connection_pool=self.redisPool)
		self.httpSession.init_app(
			self.application,
			interface=RedisSessionInterface(getConnection)
		)
		# from sanic_session import AIORedisSessionInterface
		# import aioredis
		# self.redis = aioredis.from_url(redisURL, decode_responses=True)
		# self.httpSession.init_app(
		# 	self.application,
		# 	interface=AIORedisSessionInterface(self.redis)
		# )
		self.sessionPool = AsyncDBSessionPool(self.config["DB"])
		logging.info(">>> Connecting Database")
		await self.sessionPool.createConnection()
		self.session = await self.sessionPool.getSession()

	async def reconnect(self, loop):
		await self.connect(loop)
		self.websocket.startLoop()

	async def initORM(self):
		self.dynamicHandler = DynamicModelHandler(self)
		self.model = self.session.model.copy()
		self.sessionPool.model = self.model.copy()
		await self.checkModelModification(self.session)
		await self.session.createTable()
		dynamicModels = await self.dynamicHandler.checkModel(True, self.session, "main")
		[self.session.appendModel(i) for i in dynamicModels]
		self.sessionPool.model = self.session.model.copy()
		self.session.checkModelLinking()

	async def readModelModification(self):
		path = f'{self.resourcePath}/ModelVersion.json'
		if os.path.isfile(path):
			with open(path, 'rt') as fd:
				raw = fd.read()
			try:
				modelVersion = json.loads(raw)
			except:
				modelVersion = {}
		else:
			modelVersion = {}
		self.modelVersion = modelVersion

	async def checkModelModification(self, session: AsyncDBSessionBase):
		path = f'{self.resourcePath}/ModelVersion.json'
		await session.checkModification(path)

	def createPage(self) -> HTMLPage:
		return HTMLPage(
			self.rootURL, 
			self.websocketURL,
			self.resourcePath,
			self.theme,
			self.isCompress,
			self.isPreload
		)

	# NOTE configReference example : gaimonerp.machine.MachinePMS -> /etc/gaimon/extension/machine/MachinePMS.json
	async def getServiceClient(self, configReference: str) -> AsyncServiceClient:
		splitted = configReference.split('.')
		config = await self.configHandler.getExtensionConfig(
			f"{splitted[0]}.{splitted[1]}"
		)
		client = AsyncServiceClient(config[splitted[2]])
		return client
	
	async def getServiceClientByExtension(self, extension: str, service: str) -> AsyncServiceClient:
		config = await self.configHandler.getExtensionConfig(extension)
		client = AsyncServiceClient(config[service])
		return client

	def map(self, controllerList, processRoute:Callable=processRouteEmpty):
		self.mappedController = {}
		for controller in controllerList:
			# isMapped = getattr(controller.__class__, '__is_mapped__', False)
			isMapped = self.mappedController.get(controller.__class__, False)
			if  isMapped :
				print(f"*** Warning {controller.__class__.__name__} is already mapped.")
				continue
			if not hasattr(controller.__class__, 'extensionPath'):
				controller.__class__.extensionPath = 'gaimon'
			for attributeName in dir(controller):
				attribute = getattr(controller, attributeName)
				if self.checkReplace(attribute): continue
				if not hasattr(attribute, '__ROUTE__'): continue

				route: Route = attribute.__ROUTE__
				route = processRoute(route)
				if route.rule in self.mappedRoute:
					logging.warning(
						f"*** Route {route.rule}@{controller.__class__.__name__} is already mapped."
					)
					continue
				self.mappedRoute.add(route.rule)
				if route.rule[0] != '/':
					logging.warning(
						f"*** Route {route.rule}@{controller.__class__.__name__} is not conformed."
					)
					continue
				if route.method == 'SOCKET':
					self.routeSocket(controller, attributeName, route)
				else:
					self.routeRegular(controller, attributeName, route)
			# controller.__class__.__is_mapped__ = True
			self.mappedController[controller.__class__] = True
		self.replaceRoute()

	def replaceRoute(self) :
		for key, rule in self.replaceMap.items() :
			middleware = self.middlewareMap.get(key, None)
			if middleware is None : continue
			route = middleware.callee.__ROUTE__
			middleware.callee = rule.callee
			rule.callable.__ROUTE__ = route
			middleware.role = rule.role
			middleware.permission = rule.permission
			route.role = rule.role
			route.permission = rule.permission
			middleware.controllerName = rule.callee.__self__.__class__.__name__

	def checkReplace(self, attribute) :
		if not hasattr(attribute, '__RULE__') : return False
		if not isinstance(attribute.__RULE__, ReplaceRule) : return False
		replace = attribute.__RULE__
		replace.callee = attribute
		for i in replace.ruleList :
			current = self.replaceMap.get(i, None)
			if current is None or current.order < replace.order :
				self.replaceMap[i] = replace
		return True

	def routeSocket(self, controller, attributeName: str, route: Route):
		attribute = getattr(controller, attributeName)
		self.routeExtensionMap[route.rule] = controller.extension
		permissionChecker = self.middlewareClass(
			self,
			attribute,
			route.role,
			route.permission
		)
		permissionChecker.route = route.rule
		permissionChecker.isSocket = True
		name = f'{controller.__class__.__name__}.{attributeName}'
		self.application.add_websocket_route(
			handler=permissionChecker.run,
			uri=route.rule,
			name=name,
			**route.option
		)

	def routeRegular(self, controller, attributeName: str, route: Route):
		attribute = getattr(controller, attributeName)
		self.routeExtensionMap[route.rule] = controller.extension
		mainMethod = route.method
		if not isinstance(route.method, list):
			route.method = [route.method]
		if route.method == 'REST':
			if 'POST' not in route.method: route.method.append('POST')
		role = route.role
		if hasattr(controller, 'role'):
			if controller.role != {'guest'}:
				role = controller.role
		if route.role != {'root'} and route.role != {'guest'} and route.role != {'user'}:
			role = route.role
		if route.role == {'guest'}:
			role = {'guest'}
		if route.role == {'user'}:
			role = {'user'}
		route.role = role
		middleware = self.middlewareClass(
			self,
			attribute,
			route.role,
			route.permission
		)
		middleware.route = route.rule
		self.setDecorator(middleware)
		if (route.rule == self.config['home'] or route.rule.replace('/<entity>', '') == self.config['home']) and mainMethod == 'GET':
			self.homeMethod = middleware.run
		isHome = len(self.config['home'])
		isService = route.rule == self.config['home'] + '/service.js'
		isGET = mainMethod == 'GET'
		if isHome and isService and isGET :
			self.serviceWorkerMethod = middleware.run
		name = f'{controller.__class__.__name__}.{attributeName}'
		self.middlewareMap[route.rule] = middleware
		self.application.route(
			route.rule,
			route.method,
			name=name,
			**route.option
		)(middleware.run)

	def setDecorator(self, permissionChecker:PermissionChecker) :
		route = permissionChecker.route
		permissionChecker.additionPermission = self.getDecoratorList(route, self.permissionMap)
		permissionChecker.preProcessor = self.getDecoratorList(route, self.preProcessorMap)
		permissionChecker.postProcessor = self.getDecoratorList(route, self.postProcessorMap)
		permissionChecker.validator = self.getDecoratorList(route, self.validationMap)
	
	def getDecoratorList(self, route, ruleMap) -> List[CommonDecoratorRule]:
		permissionList: List[CommonDecoratorRule] = ruleMap.get(route, None)
		if permissionList is None : return
		for i, permission in enumerate(permissionList) :
			if permission.order is not None : continue
			permission.order = Version(f"{i+1}.0")
		permissionList.sort(key=lambda x: x.order)
		return permissionList

	async def close(self):
		logging.info(">>> Application Close")
		if self.logFlusher is not None:
			await self.logFlusher.flush()
		for task in self.taskList:
			if not task.done():
				task.cancel()
		self.taskList = []
		await self.sessionPool.release(self.session)
		await self.sessionPool.close()

	def setLog(self):
		self.logLevel = self.config.get("logLevel", logging.INFO)
		self.isProduction = not self.isDevelop
		self.logFlusher: LogFlusher = None
		if self.isDevelop:
			logging.basicConfig(
				level=self.logLevel,
				format="[%(asctime)s] %(levelname)s %(message)s"
			)
			return None
		else:
			logFlusherClass = getattr(self, 'logFlusherClass', LogFlusher)
			self.logFlusher = logFlusherClass(self.config, self)
			logConfig = LOGGING_CONFIG.copy()
			path = f'{CONFIG_ROOT}/Log.json'
			if os.path.isfile(path):
				with open(path) as fd:
					logConfig.update(json.load(fd))
			logging.setLoggerClass(Logger)
			logging.basicConfig(
				level=self.logLevel,
				format="[%(asctime)s] %(levelname)s %(message)s"
			)
			formatter = logging.root.handlers[0].formatter
			logging.root = Logger("gaimon", self.logLevel)
			logging.root.handler.formatter = formatter
			self.logger = logging.root
			return logConfig

	async def setSequence(self):
		key = f"GaimonProcessSequence.{self.namespace}"
		while True:
			ID = await self.redis.rpop(key)
			if ID is None: break

		for i in range(self.processNumber):
			await self.redis.rpush(key, i)

	async def getSequence(self):
		key = f"GaimonProcessSequence.{self.namespace}"
		sequence = await self.redis.lpop(key)
		if sequence is not None:
			self.applicationID = int(sequence)
	
	def checkData(self) :
		rootPath = os.path.dirname(os.path.dirname(__file__))
		resourcePath = self.config['resourcePath']
		dataMap = [
			('data/language.json', 'language.json'),
			('data/country-by-currency-code.json', 'country-by-currency-code.json'),
		]

		for source, destination in dataMap :
			sourcePath = f'{rootPath}/{source}'
			destinationPath = f'{resourcePath}/{destination}'
			exist = not os.path.isfile(sourcePath)
			sourceTime = os.stat(sourcePath).st_mtime
			destinationTIme = os.stat(destinationPath).st_mtime
			if exist or sourceTime > destinationTIme :
				copy(sourcePath, destinationPath)

	def prepare(self):
		config = self.config
		if self.isDevelop:
			self.processNumber = 1
		else:
			self.processNumber = config.get("processNumber", -1)
			if self.processNumber < 0 : self.processNumber = cpu_count()
		self.checkData()
		self.loadController()
		self.application.config.REQUEST_TIMEOUT = self.config.get("timeOut", 60)

		@self.application.main_process_start
		async def prepare(application, loop):
			await self.load(loop)
			await self.setSequence()
			self.startMainLoop(loop)
			await self.close()

		@self.application.after_server_start
		async def reconnect(application, loop):
			await self.reconnect(loop)
			await self.getSequence()
			logging.info(
				f"Process {os.getpid()} ID={self.applicationID} memory : {int(psutil.Process().memory_info().rss / (1024 * 1024))}MB"
			)
			self.startWorkerLoop(loop)

		@self.application.after_server_stop
		async def stop(application, loop):
			self.websocket.stopTask()
			await self.close()

		self.sanicHandler = {'prepare': prepare, 'reconnect': reconnect, 'stop': stop}

	def run(self):
		self.prepare()
		self.application.run(
			host=self.config['host'],
			port=self.config['port'],
			workers=self.processNumber,
			dev=self.logLevel == logging.DEBUG,
			access_log=True
		)
