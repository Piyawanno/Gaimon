from xerial.Record import Record
from gaimon.core.ServicePermissionChecker import ServicePermissionChecker
from gaimon.core.Application import Application
from gaimon.core.Route import Route
from gaimon.util.PathUtil import getConfigPath, getResourcePath

import os, logging

Record.enableDefaultBackup()
class Service:
	def __init__(self, config: dict, namespace: str = ''):
		Application.BASE_CONFIG = config
		self.config = config
		self.setNamespace(namespace)
		self.config = config
		self.user = config.get('user', None)
		self.password = config.get('password', None)
		self.hashTime = config.get('hashTime', None)
		self.handler = []
		self.handlerClass = {}
		self.handlerPool = {}
		self.isCheckPermission = self.user is not None
		self.createApplication()
		self.mappedRoute = set()

	def setNamespace(self, namespace: str):
		self.namespace = namespace
		if namespace is not None and len(namespace):
			self.configPath = f'{getConfigPath()}/gaimon/namespace/{self.namespace}/'
			self.resourcePath = f"{getResourcePath()}/gaimon/namespace/{self.namespace}/"
		else:
			self.configPath = f'{getConfigPath()}/gaimon/'
			self.resourcePath:str = f'{getResourcePath()}/gaimon'
		if not os.path.isdir(self.configPath):
			os.makedirs(self.configPath)
		if not os.path.isdir(self.resourcePath):
			os.makedirs(self.resourcePath)

	def createApplication(self):
		from flask import Flask
		self.application = Flask(__name__)

	def load(self):
		print("*** Warning : Service.load is not implemented.")
		print(">>> Service.load should define its handler by appending to self.handler.")
		print(">>> Other pre-defined environment can be implemented also in this method.")

	def close(self):
		pass

	def run(self):
		self.load()
		self.map()
		config = self.config
		self.application.run(host=config["host"], port=config["port"])

	def map(self):
		for handler in self.handler:
			for attributeName in dir(handler):
				attribute = getattr(handler, attributeName)
				if not hasattr(attribute, '__ROUTE__'): continue
				route: Route = attribute.__ROUTE__

				if route.rule in self.mappedRoute:
					logging.warning(
						f"*** Route {route.rule}@{handler.__class__} is already mapped."
					)

				endpoint = "%s.%s" % (handler.__class__.__name__, attribute.__name__)
				route.option["methods"] = [route.method]
				if route.method == 'REST':
					if 'POST' not in route.method:
						route.option["methods"].append('POST')
				permission = ServicePermissionChecker(
					self,
					attribute,
					self.isCheckPermission
				)
				self.application.add_url_rule(
					route.rule,
					endpoint,
					permission.run,
					**route.option
				)

	def getHandler(self, name):
		if len(self.handlerPool[name]) == 0:
			return self.handlerClass[name](self)
		else:
			return self.handlerPool[name].pop()

	def prepareHandler(self, handler, request, parameter, hasDBSession):
		pass

	def releaseHandler(self, handler):
		pass

	def appendHandler(self, handler):
		self.handler.append(handler(self))
		name = handler.__name__
		self.handlerPool[name] = [handler(self)]
		self.handlerClass[name] = handler
