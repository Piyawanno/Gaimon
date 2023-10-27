from xerial.AsyncDBSessionBase import AsyncDBSessionBase
from xerial.AsyncDBSessionPool import AsyncDBSessionPool
from gaimon.core.Extension import Extension
from gaimon.core.ExtensionTree import ExtensionTree
from gaimon.util.PathUtil import conform

from typing import Dict

import importlib, os, json, logging, time


class ExtensionLoader:
	def __init__(self, application):
		from gaimon.core.Application import Application
		self.application: Application = application
		self.resourcePath = self.application.resourcePath
		self.configPath = self.application.configPath
		self.isCopy = self.application.config.get('isCopyExtension', False)
		self.extensionRole = set()
		self.role = {}
		self.extension: Dict[str, Extension] = {}
		self.script = {}
		self.css = {}
		self.menu = {}
		self.scriptName = {}
		self.pageExtension = {}
		self.startSubroutine = []
		self.configuration = {}
		self.loadedController = set()
		self.tree = ExtensionTree()
		self.tree.append('gaimon')

	def checkPath(self):
		path = [
			f'{self.resourcePath}/share/',
			f'{self.resourcePath}/file/',
			f'{self.resourcePath}/view/',
			f'{self.resourcePath}/document/',
		]
		for i in path:
			i = conform(i)
			if not os.path.isdir(i):
				os.makedirs(i)

	def getExtensionRole(self) -> set:
		return self.extensionRole

	async def load(self, extensionPath: str, session: AsyncDBSessionBase) -> Extension:
		if extensionPath in self.extension: return
		self.tree.append(extensionPath)
		configuration = self.loadBaseConfiguration(extensionPath)
		self.configuration[extensionPath] = configuration
		for i in configuration["require"]:
			await self.load(i, session)
		logging.info(f">>> Load extension {extensionPath}")
		extension = self.createExtension(extensionPath, configuration)
		extension.extensionPath = extensionPath
		self.extension[extensionPath] = extension
		if not self.checkInitialize(extensionPath):
			await extension.initialize(
				self.isCopy,
				isSetLocalConfig=self.application.isLocalConfig
			)
			self.storeInitialize(extensionPath)
		await extension.load(self.application)
		# NOTE Use link/copy convention like file, share and view.
		# extension.checkDocument()
		await self.loadModel(extensionPath, session)
		return extension
	
	async def prepare(self, session: AsyncDBSessionBase):
		for path in self.extension:
			await self.extension[path].prepare(self.application, session)

	def checkInitialize(self, extensionPath: str) -> bool:
		from gaimon.util.GaimonInitializer import conform
		splitted = extensionPath.split(".")
		path = conform(f'{self.resourcePath}/extension/{splitted[-1]}/initialized.txt')
		if os.path.isfile(path):
			with open(path, "rt", encoding="utf-8") as fd:
				return fd.read() == "1"
		return False

	def createExtension(self, extensionPath: str, configuration: dict) -> Extension:
		name = configuration['name']
		path = f'{extensionPath}.{name}Extension'
		module = importlib.import_module(path)
		extensionClass = getattr(module, f'{name}Extension')
		return extensionClass(self.resourcePath, self.configPath)

	def storeInitialize(self, extensionPath: str):
		splitted = extensionPath.split(".")
		path = f'{self.resourcePath}/extension/{splitted[-1]}/'
		if not os.path.isdir(path): os.makedirs(path)
		path = f'{self.resourcePath}/extension/{splitted[-1]}/initialized.txt'
		with open(path, "wt") as fd:
			fd.write("1")

	async def loadModel(
		self,
		extensionPath: str,
		session: AsyncDBSessionBase,
		isCreateTable: bool = False
	):
		module = importlib.import_module(extensionPath)
		path = module.__path__[0]
		if os.path.isdir(f"{path}/model"):
			model = importlib.import_module(f'{extensionPath}.model')
			await AsyncDBSessionPool.browseModel(session, model)
			if isCreateTable: await session.createTable()

	def loadController(self, extensionPath: str):
		if extensionPath in self.loadedController: return
		configuration = self.loadBaseConfiguration(extensionPath)
		for i in configuration["require"]:
			self.loadController(i)
		module = importlib.import_module(extensionPath)
		path = module.__path__[0]
		app = self.application
		if os.path.isdir(f"{path}/controller"):
			logging.info(f'>>> Load controller of {extensionPath}')
			controller = importlib.import_module(f'{extensionPath}.controller')
			directory = controller.__path__[0]
			modulePath = f"{extensionPath}.controller"
			controllerList = app.browseController(directory, modulePath)
			for i in controllerList :
				i.__class__.extensionPath = extensionPath
			app.browseWebSocket(directory, modulePath)
			app.browsePermission(directory, modulePath)
			app.browsePreProcessor(directory, modulePath)
			app.browsePostProcessor(directory, modulePath)
			self.application.controller.extend(controllerList)
		self.loadedController.add(extensionPath)

	def loadWebSocketHandler(self, extensionPath: str):
		module = importlib.import_module(extensionPath)
		path = module.__path__[0]
		if os.path.isdir(f"{path}/controller"):
			name = f'{extensionPath}.controller'
			controller = importlib.import_module(name)
			self.application.browseWebSocket(controller.__path__[0], name)

	def loadBaseConfiguration(self, extensionPath: str) -> dict:
		module = importlib.import_module(extensionPath)
		path = f'{module.__path__[0]}/Extension.json'
		if os.path.isfile(path):
			with open(path, 'rt', encoding="utf-8") as fd:
				configuration = json.load(fd)
			ID = configuration['ID']
			self.script[ID] = configuration["backend"]['script'][:]
			if 'externalScript' in configuration['backend']:
				for extension, scriptPath in configuration['backend']['externalScript']:
					if extension not in self.script: self.script[extension] = []
					self.script[extension].append(scriptPath)
			self.scriptName[ID] = []
			for js in self.script[ID]:
				name = js.split('/')[-1]
				self.scriptName[ID].append(name[:-3])
			self.css[ID] = configuration["backend"]['css'][:]
			self.menu[ID] = configuration["backend"]['menu'][:]
			self.role[ID] = list(set(configuration['role']))
			if 'pageExtension' in configuration['backend'] :
				for name, extensionList in configuration["backend"]['pageExtension'].items() :
					if name not in self.pageExtension :
						self.pageExtension[name] = set(extensionList)
					else :
						self.pageExtension[name].union(set(extensionList))
			self.extensionRole.union(set(configuration['role']))
		else:
			raise EnvironmentError(
				f"Extension base configuration cannot be found {path}."
			)
		return configuration
