from xerial.AsyncDBSessionBase import AsyncDBSessionBase
from xerial.AsyncDBSessionPool import AsyncDBSessionPool
from gaimon.core.Extension import Extension
from gaimon.core.ExtensionTree import ExtensionTree
from gaimon.core.CommonExtensionInfoHandler import CommonExtensionInfoHandler
from gaimon.util.PathUtil import conform
from gaimon.util.ProcessUtil import getMemory

from sanic import Request
from typing import Dict, List, Set

import importlib, os, json, logging, time, psutil

class ExtensionLoader (CommonExtensionInfoHandler) :
	def __init__(self, application):
		from gaimon.core.Application import Application
		self.application: Application = application
		self.resourcePath = self.application.resourcePath
		self.configPath = self.application.configPath
		self.isCopy = self.application.config.get('isCopyExtension', False)
		self.extensionRole = set()
		self.role: Dict[str, List[str]] = {}
		self.extension: Dict[str, Extension] = {}
		self.script = {}
		self.css = {}
		self.menu = {}
		self.scriptName = {}
		self.pageExtension: Dict[str, Set[str]] = {}
		self.componentComposer: Set[str] = set()
		self.componentCreator: Set[str] = set()
		self.startSubroutine = []
		self.configuration = {}
		self.loadedController = set()
		self.isPrintController = False
		self.tree = ExtensionTree()
		self.tree.append('gaimon')
		self.logger = logging.getLogger("sanic.root")
	
	async def getCSS(self, request: Request) -> Dict:
		return self.css

	async def getJS(self, request: Request) -> Dict:
		return self.script
	
	async def getPageName(self, request: Request) -> Dict:
		return self.scriptName
	
	async def getMenu(self, request: Request) -> Dict:
		return self.menu

	async def getExtension(self, request: Request) -> Dict[str, Extension] :
		return self.extension

	async def getExtensionTree(self, request: Request) -> ExtensionTree :
		return self.tree

	async def getRole(self, request: Request) -> Dict[str, List[str]]:
		return self.role

	async def getExtensionRole(self, request: Request) -> set:
		return self.extensionRole
	
	async def getPageExtension(self, request: Request) -> Dict[str, Set[str]]:
		return self.pageExtension

	async def getModelPageComponent(self, request: Request) -> Set[str]:
		return {
			'composer': list(self.componentComposer),
			'creator': list(self.componentCreator),
		}
	
	def checkPath(self):
		path = [
			f'{self.resourcePath}/share/',
			f'{self.resourcePath}/file/',
			f'{self.resourcePath}/view/',
			f'{self.resourcePath}/document/',
		]
		for i in path:
			i = conform(i)
			continue
			if not os.path.isdir(i):
				if not os.path.exists(i):
					os.makedirs(i)


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
		from gaimon.util.StepFlowUtil import StepFlowUtil
		from gaimon.model.StepFlowItem import StepFlowItem
		stepConfig:Dict[str, List[StepFlowItem]] = {}
		for path in self.extension:
			await self.extension[path].prepare(self.application, session)
			config = self.extension[path].getStepFlowConfig()
			for code in config:
				itemConfig = stepConfig.get(code, [])
				itemConfig.extend(config[code])
				stepConfig[code] = itemConfig
		stepUtil = StepFlowUtil(self.application)
		await stepUtil.registerStepFromConfig(session, stepConfig)

	def checkInitialize(self, extensionPath: str) -> bool:
		from gaimon.util.GaimonInitializer import conform
		splitted = extensionPath.split(".")
		path = conform(f'{self.resourcePath}/extension/{splitted[-1]}/initialized.txt')
		if os.path.isfile(path):
			with open(path, "rt", encoding="utf-8") as fd:
				return fd.read() == "1"
		return False

	def createExtension(self, extensionPath: str, baseConfig: dict) -> Extension:
		name = baseConfig['name']
		path = f'{extensionPath}.{name}Extension'
		module = importlib.import_module(path)
		extensionClass = getattr(module, f'{name}Extension')
		extension: Extension = extensionClass(self.resourcePath, self.configPath)
		extension.baseConfig = baseConfig
		return extension

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

	def loadController(self, extensionPath: str, result: list = None):
		if extensionPath in self.loadedController: return
		configuration = self.loadBaseConfiguration(extensionPath)
		for i in configuration["require"]:
			self.loadController(i)
		module = importlib.import_module(extensionPath)
		path = module.__path__[0]
		app = self.application
		if os.path.isdir(f"{path}/controller"):
			start = time.time()
			startMemory = getMemory()
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
			if result is None: self.application.controller.extend(controllerList)
			else: result.extend(controllerList)
			if self.isPrintController :
				elapsed = round(time.time() - start, 2)
				currentMemory = round(getMemory(), 2)
				usedMemory = round(currentMemory-startMemory, 2)
				n = len(controllerList)
				self.logger.info(f'>>> Load Controller {extensionPath}.controller [{n}] in {elapsed}s {usedMemory}MB/{currentMemory}MB')
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
		modulePath = module.__path__[0]
		developmentPath = f'{modulePath}/Extension.dev.json'
		if self.application.isDevelop and os.path.isfile(developmentPath):
			path = developmentPath
		else:
			path = f'{modulePath}/Extension.json'
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
			
			if 'component' in configuration['backend'] :
				composer = configuration["backend"]['component'].get('composer', None)
				if composer is not None:
					self.componentComposer = self.componentComposer.union(set(composer))
				creator = configuration["backend"]['component'].get('creator', None)
				if creator is not None:
					self.componentCreator = self.componentCreator.union(set(creator))

			self.extensionRole.union(set(configuration['role']))
		else:
			raise EnvironmentError(
				f"Extension base configuration cannot be found {path}."
			)
		return configuration
