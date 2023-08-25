from xerial.AsyncDBSessionPool import AsyncDBSessionPool
from gaimon.util.RESTHandler import RESTHandler

import importlib, json, os, traceback, gaimon.model


class ExtensionInitializer:
	def __init__(self, config: dict, dataPath: str):
		self.config = config
		self.pool = AsyncDBSessionPool(config["DB"])
		self.dataPath = dataPath

	def createHandler(self, user: str, password: str):
		self.handler = RESTHandler(self.config["rootURL"])
		return self.handler.login(user, password)

	async def start(self, operation: str):
		await self.load()
		for i in self.config["extension"]:
			print(f">>> Initialize {i}")
			initializer = self.initializerMap.get(i, None)
			if initializer is None: continue
			if hasattr(initializer, operation):
				operator = getattr(initializer, operation)
				await operator(self.session)

	async def load(self):
		await self.pool.createConnection()
		self.session = await self.pool.getSession()
		self.initializerMap = {}
		await AsyncDBSessionPool.browseModel(self.session, gaimon.model)
		for i in self.config["extension"]:
			if i not in self.initializerMap:
				await self.loadModule(i)
		self.session.checkModelLinking()
		await self.session.createTable()

	async def loadModule(self, moduleName: str):
		print(f">>> Initializing {moduleName}")
		module = importlib.import_module(moduleName)
		await self.loadModel(moduleName)
		for j in module.__path__:
			configPath = f"{j}/Extension.json"
			if not os.path.isfile(configPath): continue
			with open(configPath) as fd:
				extensionConfig = json.load(fd)
			for require in extensionConfig["require"]:
				if require not in self.initializerMap:
					await self.loadModule(require)
			if moduleName in self.initializerMap: break
			name = extensionConfig['name']
			initializerPath = f"{moduleName}.{name}Initializer"
			try:
				initializerModule = importlib.import_module(initializerPath)
			except:
				print(f"*** {moduleName} cannot import {initializerPath}")
				break
			config = self.config.copy()
			config["extensionConfig"] = extensionConfig
			if self.dataPath is None:
				config["dataPath"] = f"{j}/file/initialize/"
			else:
				config["dataPath"] = self.dataPath
			initializerClass = getattr(initializerModule, f"{name}Initializer")
			initializer = initializerClass(config, self.handler)
			self.initializerMap[moduleName] = initializer
			break

	async def loadModel(self, moduleName):
		modelModuleName = f"{moduleName}.model"
		modelModule = importlib.import_module(modelModuleName)
		print(f">>> Load model {modelModuleName}")
		await AsyncDBSessionPool.browseModel(self.session, modelModule)
