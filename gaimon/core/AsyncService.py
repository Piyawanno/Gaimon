from gaimon.core.Service import Service
from gaimon.core.AsyncServicePermissionChecker import AsyncServicePermissionChecker
from gaimon.core.Route import Route
# from gaimon.core.DBPoolLoader import DBPoolLoader

import logging, importlib


class AsyncService(Service):
	def __init__(self, config: dict, namespace: str = ''):
		Service.__init__(self, config, namespace)
		# self.poolLoader: DBPoolLoader = None
		self.poolLoader = None

	def createApplication(self):
		from sanic import Sanic
		self.application = Sanic(self.__class__.__name__)
		self.application.config.REQUEST_TIMEOUT = self.config.get("timeOut", 60)
	
	def setDBPoolLoader(self, modulePath: str=None) :
		if modulePath is None :
			self.poolLoader = DBPoolLoader(self.config['DB'])
		else :
			splitted = modulePath.split('.')
			module = importlib.import_module('.'.join(splitted[:-1]))
			poolClass = getattr(module, splitted[-1])
			self.poolLoader = poolClass()

	async def getHandler(self, name):
		return super().getHandler(name)

	async def prepareHandler(self, handler, request, parameter, hasDBSession):
		pass

	async def releaseHandler(self, handler):
		pass

	def initLoop(self, loop):
		pass

	def setHandler(self):
		print("*** Warning : AsyncService.setHandler is not implemented.")

	async def prepare(self):
		print("*** Warning : AsyncService.prepare is not implemented.")
		print(">>> AsyncService.prepare should define attribute for all processes.")
		print(">>> Other pre-defined environment can be implemented also in this method.")
		print(">>> This method will be called before processes are forked")

	async def load(self):
		print("*** Warning : AsyncService.load is not implemented.")
		print(">>> AsyncService.load should define its specific attribute for each process e.g. DB connection.")
		print(">>> This method will be called after processes are forked")

	async def reconnect(self):
		pass

	async def close(self):
		print("*** Warning : AsyncService.close is not implemented.")
		print(">>> AsyncService.close should define its specific attribute for each process e.g. DB close.")
		print(">>> This method will be called by terminating each process")

	def run(self):
		self.setHandler()
		self.map()
		config = self.config
		isDevelop = config.get("isDevelop", True)
		logLevel = config.get("logLevel", logging.INFO)
		isProduction = not isDevelop
		n = 1 if isDevelop else config.get("processNumber", 1)
		if isProduction and False:
			logging.disable()
		else:
			logging.basicConfig(
				level=logLevel,
				format="[%(asctime)s] %(levelname)s %(message)s"
			)

		@self.application.listener('main_process_start')
		async def prepareListener(application, loop):
			self.initLoop(loop)
			await self.prepare()

		@self.application.listener('after_server_start')
		async def loadListener(application, loop):
			await self.load()

		@self.application.listener('after_server_start')
		async def reconnectListener(application, loop):
			await self.reconnect()

		@self.application.listener('after_server_stop')
		async def closeListener(application, loop):
			await self.close()

		self.application.run(
			host=config["host"],
			port=config["port"],
			workers=n,
			dev=logLevel == logging.DEBUG,
			access_log=isDevelop,
		)

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

				if route.method == 'SOCKET':
					self.routeSocket(handler, attributeName, route)
				else:
					self.routeRegular(handler, attributeName, route)

	def routeSocket(self, handler, attributeName: str, route: Route):
		attribute = getattr(handler, attributeName)
		name = f'{handler.__class__.__name__}.{attributeName}'
		permission = AsyncServicePermissionChecker(
			self,
			attribute,
			self.isCheckPermission
		)
		permission.isSocket = True
		self.application.add_websocket_route(
			handler=permission.run,
			uri=route.rule,
			name=name,
			**route.option
		)

	def routeRegular(self, handler, attributeName: str, route: Route):
		attribute = getattr(handler, attributeName)
		route.option["methods"] = [route.method]
		if route.method == 'REST':
			if 'POST' not in route.method:
				route.option["methods"].append('POST')
		name = f'{handler.__class__.__name__}.{attributeName}'
		permission = AsyncServicePermissionChecker(
			self,
			attribute,
			self.isCheckPermission
		)
		self.application.route(route.rule, name=name, **route.option)(permission.run)
