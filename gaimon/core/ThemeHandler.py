from gaimon.core.ExtensionLoader import ExtensionLoader
from gaimon.util.PathUtil import conform
import os, aiofiles, pystache, sys


class ThemeHandler:
	def __init__(self, theme: str, resourcePath: str, extension: ExtensionLoader):
		self.theme = theme
		self.resourcePath = resourcePath
		self.extension = extension
		self.template = {}
		self.clientTemplate = {}
		self.icon = {}
		self.extensionClientTemplate = {}
		self.extensionTemplate = {}
		self.css = {}

	def getTemplate(self, path: str):
		return self.template.get(path, None)

	async def load(self):
		self.loadDefaultTemplate()
		if self.theme is not None: self.loadThemeTemplate()

	def loadThemeTemplate(self):
		viewPath = f"{self.resourcePath}/theme/{self.theme}/view/"
		for i in os.listdir(conform(viewPath)):
			path = f"{viewPath}/{i}"
			if i == "client":
				self.loadClient(path, i)
			elif os.path.isdir(conform(path)):
				self.loadExtensionView(path, i)
			elif i[-4:] == ".tpl":
				with open(conform(path), encoding='utf-8') as fd:
					self.template[i] = pystache.parse(fd.read())

	def loadDefaultTemplate(self):
		viewPath = f"{self.resourcePath}/view"
		for i in os.listdir(conform(viewPath)):
			path = f"{viewPath}/{i}"
			if i == "client":
				self.loadClient(path, i)
			elif os.path.isdir(conform(path)):
				self.loadExtensionView(path, i)
			elif i[-4:] == ".tpl":
				with open(conform(path), encoding='utf-8') as fd:
					self.template[i] = pystache.parse(fd.read())

	def loadClient(self, clientPath: str, key: str, checkIcon: bool = True):
		for i in os.listdir(conform(clientPath)):
			path = f"{clientPath}/{i}"
			if checkIcon and i == "icon":
				self.loadIcon(path, f"{key}/{i}")
			elif os.path.isdir(conform(path)):
				self.loadClient(path, f"{key}/{i}", False)
			elif i[-4:] == ".tpl":
				with open(conform(path), encoding='utf-8') as fd:
					self.setClientTemplate(f"{key}/{i}", fd.read())

	def loadIcon(self, iconPath: str, key: str):
		for i in os.listdir(conform(iconPath)):
			path = f"{iconPath}/{i}"
			if os.path.isdir(conform(path)):
				self.loadIcon(path, f"{key}/{i}")
			else:
				with open(conform(path), encoding='utf-8') as fd:
					self.setIcon(f"{key}/{i}", fd.read())

	def loadExtensionView(self, extensionPath: str, extensionName: str):
		for i in os.listdir(conform(extensionPath)):
			path = f"{extensionPath}/{i}"
			if i == "client":
				self.loadExtensionClient(path, f"{extensionName}/{i}")
			elif i[-4:] == ".tpl":
				with open(conform(path), encoding='utf-8') as fd:
					self.template[f"{extensionName}/{i}"] = pystache.parse(fd.read())

	def loadExtensionClient(self, clientPath: str, key: str, checkIcon: bool = True):
		for i in os.listdir(conform(clientPath)):
			path = f"{clientPath}/{i}"
			if checkIcon and i == "icon":
				self.loadExtensionIcon(path, f"{key}/{i}")
			elif os.path.isdir(conform(path)):
				self.loadExtensionClient(path, f"{key}/{i}", False)
			elif i[-4:] == ".tpl":
				with open(conform(path), encoding='utf-8') as fd:
					self.setExtensionClient(f"{key}/{i}", fd.read())

	def loadExtensionIcon(self, iconPath: str, key: str):
		for i in os.listdir(conform(iconPath)):
			path = f"{iconPath}/{i}"
			if os.path.isdir(conform(path)):
				self.loadExtensionIcon(path, f"{key}/{i}")
			else:
				with open(conform(path), encoding='utf-8') as fd:
					self.setExtensionIcon(f"{key}/{i}", fd.read())

	def setClientTemplate(self, key: str, content: str):
		key = conform(key)
		splitted = key.split(os.sep)
		branch = splitted[1]
		name = splitted[-1].split(".")[0]
		if branch not in self.clientTemplate:
			self.clientTemplate[branch] = {}
		splitted = splitted[2:-1]
		template = self.clientTemplate[branch]
		for item in splitted:
			if not item in template:
				template[item] = {}
			template = template[item]
		template[name] = content

	def setIcon(self, key: str, content: str):
		key = conform(key)
		splitted = key.split(os.sep)
		name = splitted[-1].split(".")[0]
		self.icon[name] = content

	def setExtensionClient(self, key: str, content: str):
		key = conform(key)
		splitted = key.split(os.sep)
		extension = splitted[0]
		path = splitted[2:-1]
		name = splitted[-1].split(".")[0]
		if extension not in self.extensionClientTemplate:
			self.extensionClientTemplate[extension] = {}
		current = self.extensionClientTemplate[extension]
		for i in path:
			if i not in current: current[i] = {}
			current = current[i]
		current[name] = content

	def setExtensionIcon(self, key: str, content: str):
		key = conform(key)
		splitted = key.split(os.sep)
		extension = splitted[0]
		path = splitted[3:-1]
		name = splitted[-1].split(".")[0]
		if extension not in self.icon:
			self.icon[extension] = {}
		current = self.icon[extension]
		for i in path:
			if i not in current: current[i] = {}
			current = current[i]
		current[name] = content
