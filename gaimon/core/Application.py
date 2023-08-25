from gaimon.core.HTMLPage import HTMLPage
from gaimon.core.PermissionChecker import PermissionChecker
from gaimon.core.Authentication import Authentication
from gaimon.core.ExtensionLoader import ExtensionLoader
from gaimon.core.CommonDecorator import CommonDecoratorRule
from gaimon.core.PermissionDecorator import PermissionDecorator
from gaimon.core.PreProcessor import PreProcessDecorator
from gaimon.core.PostProcessor import PostProcessDecorator
from gaimon.core.Route import Route
from gaimon.util.PathUtil import conform
from xerial.DBSessionPool import DBSessionPool
from xerial.Record import Record

from multiprocessing import cpu_count
from typing import List, Any

import importlib, traceback, os, logging, sys, time

__MAX_POOL_SIZE__ = 2 * cpu_count()

Record.enableDefaultBackup()


def createDecoratorBrowser(self, ruleMap, decoratorClass) :
	def browseDecorator(directory, modulePath) :
		decoratorList = []
		for name in self.browseModule(directory):
			try:
				module = importlib.import_module(f"{modulePath}.{name}")
				ruleClass = getattr(module, name)
				if not issubclass(ruleClass, decoratorClass) : continue
				ruleClass.extension = modulePath
				decoratorList.append(ruleClass(self))
			except:
				print(traceback.format_exc())

		for decorator in decoratorList :
			for attributeName in dir(decorator):
				attribute = getattr(decorator, attributeName)
				rule:CommonDecoratorRule = getattr(attribute, '__RULE__', None)
				if rule is None : continue
				rule.setDecoratorClass(decorator.__class__)
				extendDecorator(rule)
		return decoratorList

	def extendDecorator(rule:CommonDecoratorRule) :
		for i in rule.ruleList :
			ruleList = ruleMap.get(i, [])
			if len(ruleList) == 0 :  ruleMap[i] = ruleList
			ruleList.append(rule)
	
	return browseDecorator

class Application:
	BASE_CONFIG = {}

	def __init__(self, config, namespace: str = ''):
		from flask import Flask
		from gaimon.core.Extension import TabExtension
		import redis
		self.config = config
		Application.BASE_CONFIG = config
		self.setNamespace(namespace)
		self.application = Flask(
			__name__,
			static_folder=conform(f'{self.resourcePath}/share/')
		)
		self.application.config['SECRET_KEY'] = 'RedShip#[2022]'
		self.application.config['SESSION_TYPE'] = 'redis'
		self.application.config['SESSION_PERMANENT'] = False
		self.application.config['SESSION_USE_SIGNER'] = True
		self.application.config['SESSION_REDIS'] = redis.from_url(
			'redis://localhost:6379'
		)
		self.page = HTMLPage(config['rootURL'], config['resourcePath'])
		self.rootURL = config['rootURL']
		self.title = config['title']
		if 'icon' in config: self.icon = config['icon']
		if 'fullTitle' in config: self.fullTitle = config['fullTitle']
		self.rootPath = os.path.dirname(__file__)
		self.homeMethod = None
		self.redis = redis.Redis()
		self.modelModule = None
		self.extension = ExtensionLoader(self)
		self.userConfig = {}
		self.mappedRoute = set()
		self.pageTabExtension:TabExtension = {}
	
	def initialDecorator(self) :
		self.permissionMap = {}
		self.preProcessorMap = {}
		self.postProcessorMap = {}

		self.browsePermission = createDecoratorBrowser(self, self.permissionMap, PermissionDecorator)
		self.browsePreProcessor = createDecoratorBrowser(self, self.preProcessorMap, PreProcessDecorator)
		self.browsePostProcessor = createDecoratorBrowser(self, self.postProcessorMap, PostProcessDecorator)

	def setNamespace(self, namespace: str):
		from gaimon.util.GaimonInitializer import conform
		self.namespace = namespace
		if len(self.namespace):
			self.configPath = conform(f'/etc/gaimon/namespace/{self.namespace}/')
			self.resourcePath = conform(
				f"{self.config['resourcePath']}/namespace/{self.namespace}/"
			)
		else:
			self.configPath = conform('/etc/gaimon/')
			self.resourcePath = self.config['resourcePath']
		if not os.path.isdir(self.configPath):
			os.makedirs(self.configPath)
		if not os.path.isdir(self.resourcePath):
			os.makedirs(self.resourcePath)

	def load(self):
		self.controllerPool = {}
		self.controllerClass = {}
		self.connectionCount = 0
		self.initORM()
		self.authen = Authentication(self.session, self.redis)
		self.controller = self.browseController(
			"%s/controller/" % (self.rootPath),
			self.controllerPath
		)
		self.map(self.controller)

	def initORM(self):
		self.sessionPool = DBSessionPool(self.config["DB"])
		print(">>> Connecting Database")
		self.sessionPool.createConnection()
		self.session = self.sessionPool.getSession()
		if self.modelModule is not None:
			DBSessionPool.browseModel(
				self.session,
				importlib.import_module(self.modelModule)
			)
		self.session.createTable()
		self.model = self.session.model.copy()
		self.sessionPool.model = self.model.copy()

	def __del__(self):
		self.close()

	def close(self):
		print(">>> Application Close")
		self.sessionPool.close()

	def getConfig(self):
		return self.config

	def getExtensionConfig(self, extensionPath: str):
		return self.extension.configuration.get(extensionPath, {})

	def getUserConfig(self, uid: int):
		return self.userConfig.get(uid, {})

	def isStaticShare(self, path: str) -> bool:
		path = f'{self.resourcePath}/share/{path}'
		return os.path.isfile(path)

	def storeStaticShare(self, path: str, data: bytes):
		path = f'{self.resourcePath}/share/{path}'
		with open(path, 'wb') as fd:
			fd.write(data)

	def isStaticFile(self, path: str) -> bool:
		path = f'{self.resourcePath}/file/{path}'
		return os.path.isfile(path)

	def storeStaticFile(self, path: str, data: bytes):
		path = f'{self.resourcePath}/file/{path}'
		with open(path, 'wb') as fd:
			fd.write(data)

	def map(self, controllerList):
		for controller in controllerList:
			for attributeName in dir(controller):
				attribute = getattr(controller, attributeName)
				if not hasattr(attribute, '__ROUTE__'): continue

				route: Route = attribute.__ROUTE__

				if route.rule in self.mappedRoute:
					logging.warning(
						f"*** Route {route.rule}@{controller.__class__} is already mapped."
					)

				self.mappedRoute.add(route.rule)

				if route.rule[0] != '/':
					logging.warning(
						f"*** Route {route.rule}@{controller.__class__} is not conformed."
					)
				mainMethod = route.method
				route.method = [route.method]
				if route.method == 'REST':
					if 'POST' not in route.method: route.method.append('POST')

				method, route, option, role = attribute.__ROUTE__
				endpoint = "%s.%s" % (controller.__class__.__name__, attribute.__name__)
				option["methods"] = [method]
				if method == 'REST': option["methods"] = ['POST']
				permission = PermissionChecker(self, attribute, role)
				if route == self.config['home'] and method == 'GET':
					self.homeMethod = permission.run
				self.application.add_url_rule(route, endpoint, permission.run, **option)

	def browseController(self, directory, modulePath):
		controllerList = []
		for name in self.browseModule(directory):
			if name[-10:] != 'Controller': continue
			try:
				module = importlib.import_module(f"{modulePath}.{name}")
				controllerClass = getattr(module, name)
				controllerClass.extension = modulePath
				controllerList.append(controllerClass(self))
				name = controllerClass.__name__
				self.controllerPool[name] = [controllerClass(self)]
				self.controllerClass[name] = controllerClass
			except:
				print(traceback.format_exc())
		return controllerList		

	def getController(self, name):
		if len(self.controllerPool[name]) == 0:
			return self.controllerClass[name](self)
		else:
			return self.controllerPool[name].pop()

	def releaseController(self, name, controller):
		if len(self.controllerPool[name]) < __MAX_POOL_SIZE__:
			self.controllerPool[name].append(controller)

	def browseModule(self, directory):
		for i in os.listdir(directory):
			if i[-3:] != '.py' or i == "__init__.py" or os.path.isdir(f"{directory}/{i}"): continue
			yield i[:-3]

	def getServiceURL(self, serviceName: str) -> str:
		if serviceName in self.config:
			service = self.config[serviceName]
			return f"http://{service['host']}:{service['port']}/"
		else:
			return None

	def run(self):
		config = self.config
		self.application.run(host=config["host"], port=config["port"])
