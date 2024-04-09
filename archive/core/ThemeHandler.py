from gaimon.core.ExtensionLoader import ExtensionLoader
import os, aiofiles, pystache, sys
from gaimon.util.GaimonInitializer import __conform__

# def __conform__(path) :
# 	if sys.platform == 'win32': return os.sep.join([i for i in path.split("/") if len(i)])
# 	return "/"+("/".join([i for i in path.split("/") if len(i)]))

class ThemeHandler :
	def __init__(self, theme:str, resourcePath:str, extension:ExtensionLoader) :
		self.theme = theme
		self.resourcePath = resourcePath
		self.extension = extension
		self.template = {}
		self.clientTemplate = {}
		self.icon = {}
		self.extensionClientTemplate = {}
		self.extensionTemplate = {}
		self.css = {}
	
	def getTemplate(self, path:str) :
		return self.template.get(path, None)
	
	async def load(self) :
		self.extensionIcon = set()
		self.extensionThemeIcon = set()
		self.extensionPath = set()
		self.extensionThemePath = set()
		for extension in self.extension.extension.values() :
			path = __conform__(f"{self.resourcePath}/view/{extension.ID}/client/icon")
			self.extensionIcon.add(path)
			path = __conform__(f"{self.resourcePath}/view/{extension.ID}/client")
			self.extensionPath.add(path)
		if self.theme is not None :
			for extension in self.extension.extension.values() :
				path = __conform__(f"{self.resourcePath}/theme/{self.theme}/view/{extension.ID}/client/icon")
				self.extensionThemeIcon.add(path)
				path = __conform__(f"{self.resourcePath}/theme/{self.theme}/view/{extension.ID}/client")
				self.extensionThemePath.add(path)
		if self.theme is not None : self.loadThemeTemplate()
		self.loadDefaultTemplate()
	
	def loadDefaultTemplate(self) :
		iconPath = __conform__(f"{self.resourcePath}/view/client/icon")
		clientPath = __conform__(f"{self.resourcePath}/view/client")
		viewPath = __conform__(f"{self.resourcePath}/view")
		for root, directories, files in os.walk(viewPath, followlinks=True) :
			for i in files :
				path = __conform__(f"{root}/{i}")
				key = path.replace(viewPath, "")
				if key[0] == os.sep : key = key[1:]
				if key in self.template : continue
				subKey = __conform__(f"{root.split(f'{os.sep}client')[0]}/client")
				with open(path, 'r', encoding='utf-8') as fd :
					content = fd.read()
					if iconPath in root :
						self.setIcon(key, content)
					elif clientPath in root :
						self.setClientTemplate(key, content)
					elif root in self.extensionIcon :
						self.setExtensionIcon(key, content)
					elif root in self.extensionPath :
						if subKey in self.extensionPath :
							self.setExtensionClient(key, content)
						else :
							self.setExtension(key, content)
					elif root == viewPath :
						self.template[key] = pystache.parse(content)
	
	def loadThemeTemplate(self) :
		clientPath = __conform__(f"{self.resourcePath}/theme/{self.theme}/view/client")
		iconPath = __conform__(f"{self.resourcePath}/theme/{self.theme}/view/client/icon")
		viewPath = __conform__(f"{self.resourcePath}/theme/{self.theme}/view/")
		if not os.path.isfile(viewPath) : return
		for root, directories, files in os.walk(viewPath, followlinks=True) :
			for i in files :
				path = __conform__(f"{root}/{i}")
				key = path.replace(viewPath, "")
				with open(path, encoding='utf-8') as fd :
					content = fd.read()
					if iconPath in root :
						self.setIcon(key, content)
					elif clientPath in root :
						self.setClientTemplate(key, content)
					elif root in self.extensionThemeIcon :
						self.setExtensionIcon(key, content)
					elif root in self.extensionThemePath :
						self.setExtensionClient(key, content)
					else :
						self.template[key] = pystache.parse(content)

	def setClientTemplate(self, key:str, content:str) :
		splitted = key.split(os.sep)
		branch = splitted[1]
		name = splitted[-1].split(".")[0]
		if branch not in self.clientTemplate :
			self.clientTemplate[branch] = {}
		splitted = splitted[2:-1]
		template = self.clientTemplate[branch]
		for item in splitted:
			if not item in template:
				template[item] = {}
			template = template[item]
		template[name] = content
	
	def setIcon(self, key:str, content:str) :
		splitted = key.split(os.sep)
		name = splitted[-1].split(".")[0]
		self.icon[name] = content
	
	def setExtensionClient(self, key:str, content:str) :
		splitted = key.split(os.sep)
		extension = splitted[0]
		path = splitted[2:-1]
		name = splitted[-1].split(".")[0]
		if extension not in self.extensionClientTemplate :
			self.extensionClientTemplate[extension] = {}
		current = self.extensionClientTemplate[extension]
		for i in path :
			if i not in current : current[i] = {}
			current = current[i]
		current[name] = content
	
	def setExtension(self, key:str, content:str) :
		splitted = key.split(os.sep)
		extension = splitted[0]
		path = splitted[2:-1]
		name = splitted[-1].split(".")[0]
		if extension not in self.extensionTemplate :
			self.extensionTemplate[extension] = {}
		current = self.extensionTemplate[extension]
		for i in path :
			if i not in current : current[i] = {}
			current = current[i]
		current[name] = content
	
	def setExtensionIcon(self, key:str, content:str) :
		splitted = key.split(os.sep)
		extension = splitted[0]
		path = splitted[3:-1]
		name = splitted[-1].split(".")[0]
		if extension not in self.icon :
			self.icon[extension] = {}
		current = self.icon[extension]
		for i in path :
			if i not in current : current[i] = {}
			current = current[i]
		current[name] = content