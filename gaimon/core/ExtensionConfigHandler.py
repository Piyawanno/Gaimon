import os, logging, json


class ExtensionConfigHandler:
	def __init__(self, ID: str, name: str, resourcePath: str, configPath: str):
		self.ID = ID
		self.name = name
		self.resourcePath = resourcePath
		self.configPath = configPath
		self.extensionConfig = None
		self.entityConfig = None
		self.userConfig = None
		self.path = ''

	@staticmethod
	def updateConfig(default, existing: dict) -> bool:
		if default is None: return
		if id(default) == id(existing):
			logging.warning(
				"ExtensionConfigHandler.updateConfig default config and updated config are the same."
			)
			logging.warning("Please copy config before modifying config.")
		isUpdated = False
		for k, v in default.items():
			if k not in existing:
				existing[k] = v
				isUpdated = True
			elif isinstance(v, dict):
				isUpdated = isUpdated or ExtensionConfigHandler.updateConfig(
					v,
					existing[k]
				)
			else:
				existing[k] = v
				isUpdated = True
		return isUpdated

	def setExtensionLocalConfig(self):
		source = f"{self.path}/config/global/"
		if not os.path.isdir(source): return
		target = f"{self.configPath}/extension/{self.ID}/"
		if not os.path.isdir(target):
			os.makedirs(target)
		for i in os.listdir(source):
			sourcePath = f"{source}/{i}"
			targetPath = f"{target}/{i}"
			if os.path.isfile(targetPath): continue
			with open(sourcePath, encoding="utf-8") as sfd:
				content = sfd.read()
				with open(targetPath, "wt") as tfd:
					tfd.write(content)

	# NOTE This method will be called by GaimonCloud.ConfigService for preparing
	# configuration on local storage of ConfigService. For regular Gaimon, extension
	# configuration will be stored at /etc/gaimon/NAMESPACE.
	def setExtensionConfig(self):
		config = self.readCoreExtensionConfig()
		if config is None or len(config) == 0: return
		source = f"{self.path}/config/global/"
		target = f"{self.resourcePath}/config/extension/{self.ID}"
		if not os.path.isdir(target): os.makedirs(target)
		for i in os.listdir(source):
			sourcePath = f"{source}/{i}"
			targetPath = f"{target}/{i}"
			logging.info(f">>> Set extension configuration {self.ID} {i}")

			isUpdated = False
			with open(sourcePath, encoding="utf-8") as fd:
				config = json.load(fd)

			if os.path.isfile(targetPath):
				with open(targetPath, "rt", encoding="utf-8") as fd:
					content = fd.read()
					if len(content) == 0: existing = {}
					else: existing = json.loads(content)
					isUpdated = ExtensionConfigHandler.updateConfig(config, existing)
			else:
				existing = config
				isUpdated = True

			if isUpdated:
				with open(targetPath, "wt") as fd:
					json.dump(existing, fd)

	def readCoreExtensionConfig(self):
		if self.extensionConfig is None:
			source = f"{self.path}/config/global/"
			if not os.path.isdir(source): return
			self.extensionConfig = self.readCofigDirectory(source)
		return self.extensionConfig

	def setEntityConfig(self, entity: str) -> dict:
		config = self.readCoreEntityConfig()
		if config is None or len(config) == 0: return
		if len(config) == 0: return
		target = f"{self.resourcePath}/config/entity/{entity}.json"
		if os.path.isfile(target):
			with open(target, encoding="utf-8") as fd:
				entityConfig = json.load(fd)
		else:
			entityConfig = {}
		isUpdated = self.updateEntityConfig(entity, config, entityConfig)
		if isUpdated:
			with open(target, 'wt') as fd:
				json.dump(entityConfig, fd, ensure_ascii=False, indent=4)
		return entityConfig

	def readCoreEntityConfig(self):
		if self.entityConfig is None:
			source = f"{self.path}/config/entity/"
			if not os.path.isdir(source): return
			self.entityConfig = self.readCofigDirectory(source)
		return self.entityConfig

	def updateEntityConfig(self, config: dict, entityConfig: dict) -> bool:
		extensions: dict = entityConfig.get('extension', {})
		if len(extensions) == 0: entityConfig['extension'] = extensions
		extension: dict = extensions.get(self.ID, {})
		return ExtensionConfigHandler.updateConfig(config, extension)

	def setUserConfig(self, uid: int):
		config = self.readCoreUserConfig()
		if config is None or len(config) == 0: return
		target = f"{self.resourcePath}/config/user/user-{uid}.json"
		if os.path.isfile(target):
			with open(target, encoding="utf-8") as fd:
				userConfig = json.load(fd)
		else:
			userConfig = {}
		isUpdated = self.updateUserConfig(config, userConfig)
		if isUpdated:
			with open(target, 'wt') as fd:
				json.dump(userConfig, fd, ensure_ascii=False, indent=4)

	def readCoreUserConfig(self):
		if self.userConfig is None:
			source = f"{self.path}/config/user/"
			if not os.path.isdir(source): return
			self.userConfig = self.readCofigDirectory(source)
		return self.userConfig

	def updateUserConfig(self, config: dict, userConfig: dict) -> bool:
		extensions: dict = userConfig.get('extension', {})
		if len(extensions) == 0: userConfig['extension'] = extensions
		extension: dict = extensions.get(self.ID, {})
		return ExtensionConfigHandler.updateConfig(config, extension)

	def readCofigDirectory(self, source: str) -> dict:
		main = f"{source}/{self.name}.json"
		if os.path.isfile(main):
			with open(main, encoding="utf-8") as fd:
				config = json.load(fd)
		else:
			config = {}
		for i in os.listdir(source):
			if i[-5:] == '.json':
				path = f"{source}/{i}"
				name = i[:-5]
				with open(path, encoding="utf-8") as fd:
					config[name] = json.load(fd)
		return config
