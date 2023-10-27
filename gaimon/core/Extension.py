from gaimon.core.ExtensionConfigHandler import ExtensionConfigHandler
from gaimon.util.PathUtil import conform, copy, link
from xerial.Input import Input
from xerial.AsyncDBSessionBase import AsyncDBSessionBase
from typing import Dict, List

import os, logging, json

# NOTE Model name -> List of Input
InputExtension = Dict[str, List[Input]]

# NOTE JS Page class name -> List of addition Tab -> Tab Information
TabExtension = Dict[str, List[Dict[str, str]]]

class Extension:
	resourcePath: str
	ID: str
	name: str
	path: str
	extensionPath: str
	configHandler: ExtensionConfigHandler

	def __init__(self, resourcePath: str, configPath: str):
		self.resourcePath = resourcePath
		self.configPath = configPath
		self.configHandler = ExtensionConfigHandler(
			self.ID,
			self.name,
			resourcePath,
			configPath
		)
		self.configHandler.path = self.path

	async def initialize(
		self,
		isCopy: bool = True,
		isForce: bool = False,
		isSetLocalConfig: bool = True
	):
		"""
		This method will be called by initializing the extension by running
		the extension for the first time. It prepares configuration path
		and resource path of extension and will be used application wide.

		Parameter
		---------
		isCopy: If True, the configuration will be copied to the destination path.
		isForce: If True, the Extension will be initialized without checking the previous initialization.
		isSetLocalConfig: If True, the configuration will be set to the local
		"""
		if isCopy: self.initializeCopy(isForce)
		else: self.initializeLink(isForce)
		if isSetLocalConfig:
			self.configHandler.setExtensionLocalConfig()

	async def load(self, application):
		"""
		This method will be called by every start of application.
		It should prepare extension state, which will be used from
		start to the termination of application.

		Parameter
		---------
		application: The GaimonApplication to get the application configuration and setup.
		"""
		pass

	async def activate(self, entity:str, application, session:AsyncDBSessionBase):
		"""
		This method will be called by activation of extension for
		the entity. Since Gaimon does not support multiple tenancies
		(multiple entities), this method will never be called.
		The method will be used for GaimonCloud.

		Parameter
		---------
		entity: Name of the entity
		application: The GaimonApplication to get the application configuration and setup.
		session: Database Session
		"""
		if application.isLocalConfig:
			self.configHandler.setEntityConfig(entity)

	async def activateByUserCreation(self, uid:int, application, session:AsyncDBSessionBase):
		"""
		This method will be called by creating an user account.
		Configuration of user should be copied to resource path
		or it can be extended to other purpose.

		Parameter
		---------
		uid: User ID
		application: The GaimonApplication to get the application configuration and setup.
		session: Database Session
		"""
		if application.isLocalConfig:
			self.configHandler.setUserConfig(uid)

	def initializeCopy(self, isForce: bool = False):
		if not self.checkPath() or isForce:
			path = [
				(f"{self.path}/share/*", f"{self.resourcePath}/share/{self.ID}/"),
				(f"{self.path}/file/*", f"{self.resourcePath}/file/{self.ID}/"),
				(f"{self.path}/view/*", f"{self.resourcePath}/view/{self.ID}/"),
				(f"{self.path}/document/*", f"{self.resourcePath}/document/{self.ID}/")
			]
			for source, destination in path:
				copy(source, destination, True)

	def initializeLink(self, isForce: bool = False):
		path = [
			(f"{self.path}/share", f"{self.resourcePath}/share/{self.ID}"),
			(f"{self.path}/view", f"{self.resourcePath}/view/{self.ID}"),
			(f"{self.path}/document", f"{self.resourcePath}/document/{self.ID}"),
		]

		for source, destination in path:
			destination = conform(destination)
			if not os.path.isdir(destination):
				link(source, destination)

		source, destination = (f"{self.path}/file", f"{self.resourcePath}/file/{self.ID}")
		if not os.path.isdir(destination): copy(source, destination, isFolder=True)

	def checkPath(self) -> bool:
		result = True
		path = conform(f"{self.resourcePath}/share/{self.ID}")
		if not os.path.isdir(path):
			os.makedirs(path)
			result = False
		path = conform(f"{self.resourcePath}/file/{self.ID}")
		if not os.path.isdir(path):
			os.makedirs(path)
			result = False
		path = conform(f"{self.resourcePath}/view/{self.ID}")
		if not os.path.isdir(path):
			os.makedirs(path)
			result = False
		path = conform(f"{self.resourcePath}/document/{self.ID}")
		if not os.path.isdir(path):
			os.makedirs(path)
			result = False
		return result

	def getPath(self, file: str) -> str:
		return os.path.dirname(os.path.abspath(file))

	def checkDocument(self):
		documentPath = conform(f"{self.path}/document")
		if not os.path.isdir(documentPath): return
		destinationPath = conform(f"{self.resourcePath}/extension/{self.ID}/document")
		if not os.path.isdir(destinationPath): os.makedirs(destinationPath)

		for root, dirs, files in os.walk(documentPath):
			relativeRoot = root[len(documentPath):]
			destinationRoot = conform(f'{destinationPath}/{relativeRoot}')
			if os.path.isdir(root) and not os.path.isdir(destinationRoot):
				os.makedirs(destinationRoot)
			for dir in dirs:
				destinationDirectory = conform(f'{destinationRoot}/{dir}')
				if not os.path.isdir(destinationDirectory):
					os.makedirs(destinationDirectory)
			for file in files:
				source = conform(f'{root}/{file}')
				destination = conform(f'{destinationRoot}/{file}')
				if not os.path.isfile(destination) or self.checkModifyTime(
					source,
					destination
				):
					copy(source, destination)

	def checkModifyTime(self, source: str, destination: str) -> bool:
		destination = conform(destination)
		source = conform(source)
		if not os.path.isfile(destination):
			# print(destination)
			return True
		sourceTime = os.path.getmtime(source)
		destinationTime = os.path.getmtime(destination)
		return sourceTime > destinationTime

	def getInputExtension(self) -> InputExtension :
		return {}
	
	def getJSPageTabExtension(self) -> TabExtension :
		return {}
	
	async def prepare(self, application, session):
		pass