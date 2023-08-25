from gaimon.core.ExtensionLoader import ExtensionLoader
from gaimon.core.ExtensionConfigHandler import ExtensionConfigHandler

from typing import Tuple

import os, json


class ConfigHandler:
	def __init__(
		self,
		resourcePath: str,
		configPath: str,
		extensionLoader: ExtensionLoader
	):
		self.resourcePath = resourcePath
		self.configPath = configPath
		self.extensionLoader = extensionLoader
		self.extension = {}
		self.entity = {}
		self.user = {}
		self.requiredDirectory = [
			f"{self.resourcePath}/config/entity",
			f"{self.resourcePath}/config/user",
		]

	async def load(self):
		self.checkDirectory()
		await self.checkMainEntity()
		await self.loadUserConfig()
		await self.loadEntityConfig()
		await self.loadExtensionConfig()

	def checkDirectory(self):
		for i in self.requiredDirectory:
			if not os.path.isdir(i):
				os.makedirs(i)

	async def checkMainEntity(self):
		path = f"{self.resourcePath}/config/entity/main.json"
		if not os.path.isfile(path):
			await self.initEntityConfig('main')

	async def getUserConfig(self, uid: int) -> dict:
		return self.user.get(uid, {})

	async def getEntityConfig(self, entity: str) -> dict:
		return self.entity.get(entity, {})

	async def getExtensionConfig(self, extension: str) -> dict:
		return self.extension.get(extension, {})

	async def getConfig(self, uid: int, entity: str, extension: str) -> Tuple[dict, dict, dict]:
		userConfig = self.user.get(uid, {})
		entityConfig = self.entity.get(entity, {})
		extensionConfig = self.extension.get(extension, {})
		return (userConfig, entityConfig, extensionConfig)

	async def updateUserConfig(self, uid: int, config: dict):
		userConfig = self.user.get(uid, {})
		isUpdated = ExtensionConfigHandler.updateConfig(config, userConfig)
		if isUpdated:
			path = f"{self.resourcePath}/config/user/user-{uid}.json"
			with open(path, "wt") as fd:
				content = json.dumps(userConfig, ensure_ascii=False, indent=4)
				fd.write(content)

	async def updateExtensionConfig(self, extension: str, config: dict):
		entityConfig = self.extension(extension, {})
		isUpdated = ExtensionConfigHandler.updateConfig(config, entityConfig)
		if isUpdated:
			path = f"{self.configPath}/extension/{extension.ID}"
			with open(path, "wt") as fd:
				content = json.dumps(entityConfig, ensure_ascii=False, indent=4)
				fd.write(content)

	async def updateEntityConfig(self, entity: str, config: dict):
		entityConfig = self.entity.get(entity, {})
		isUpdated = ExtensionConfigHandler.updateConfig(config, entityConfig)
		if isUpdated:
			path = f"{self.resourcePath}/config/entity/{entity}.json"
			with open(path, "wt") as fd:
				content = json.dumps(entityConfig, ensure_ascii=False, indent=4)
				fd.write(content)

	async def initUserConfig(self, uid: int):
		userConfig = {}
		for extension in self.extensionLoader.extension.values():
			coreConfig = extension.configHandler
			config = coreConfig.readCoreEntityConfig()
			coreConfig.updateUserConfig(config, userConfig)
		path = f'{self.resourcePath}/user-{uid}.json'
		content = json.dumps(userConfig, ensure_ascii=False, indent=4)
		with open(path, 'wt') as fd:
			fd.write(content)

	async def initEntityConfig(self, entity: str):
		entityConfig = {}
		for extension in self.extensionLoader.extension.values():
			coreConfig = extension.configHandler
			config = coreConfig.readCoreEntityConfig()
			coreConfig.updateEntityConfig(config, entityConfig)
		path = f'{self.resourcePath}/config/entity/{entity}.json'
		content = json.dumps(entityConfig, ensure_ascii=False, indent=4)
		with open(path, 'wt') as fd:
			fd.write(content)

	async def loadExtensionConfig(self):
		for extensionPath, extension in self.extensionLoader.extension.items():
			source = f"{self.configPath}/extension/{extension.ID}"
			if not os.path.isdir(source): continue
			mainPath = f"{source}/{extension.name}.json"
			if os.path.isfile(mainPath):
				with open(mainPath) as fd:
					content = fd.read()
					self.extension[extensionPath] = json.loads(content)
			else:
				self.extension[extensionPath] = {}
			for i in os.listdir(source):
				if i[-5:] != '.json': continue
				path = f"{source}/{i}"
				if path == mainPath: continue
				name = i[:-5]
				with open(path, encoding="utf-8") as fd:
					content = fd.read()
					self.extension[extensionPath][name] = json.loads(content)

	async def loadEntityConfig(self):
		source = f"{self.resourcePath}/config/entity"
		for i in os.listdir(source):
			if i[-5:] != '.json': continue
			path = f"{source}/{i}"
			name = i[:-5]
			with open(path, encoding="utf-8") as fd:
				content = fd.read()
				self.entity[name] = json.loads(content)

	async def loadUserConfig(self):
		source = f"{self.resourcePath}/config/user"
		for i in os.listdir(source):
			if i[-5:] != '.json': continue
			path = f"{source}/{i}"
			uid = int(i[5:-5])
			with open(path, encoding="utf-8") as fd:
				content = fd.read()
				self.user[uid] = json.loads(content)
