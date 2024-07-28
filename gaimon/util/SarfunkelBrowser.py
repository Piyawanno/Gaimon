from typing import List
from gaimon.util.PathUtil import conform

import os

__MERGED_SCRIPT__ = None
__BASE__ = [
	'ViewType.js',
	'ComponentComposer.js',
	'InputMetaData.js',
]

__BASE_COMPONENT__ = [
	'Button.js',
	'SideIcon.js'
]

__BASE_VIEW__ = [
	'MenuView.js',
	'DialogView.js'
]

__BASE_INPUT__ = [
	'TextInput.js',
	'TextAreaInput.js',
	'NumberInput.js',
	'SelectInput.js',
	'CheckBoxInput.js',
	'RadioInput.js',
	'ReferenceSelectInput.js',
	'FileInput.js',
	'AutoCompleteInput.js'
]

__BASE_COLUMN__ = [
	'ColumnMetaData.js',
]

__PAGE__ = [
	'InputConfigCreator.js',
	'ViewLoader.js',
	'ModelMetaData.js',
	'ComponentCreator.js',
	'ModelPage.js',
	'ModelTabPage.js',
	'ModelStepPage.js',
	'ModelComponent.js',
]

class SarfunkelBrowser:
	def __init__(self, application):
		from gaimon.core.AsyncApplication import AsyncApplication
		self.application: AsyncApplication = application
		self.resourcePath = self.application.resourcePath
		self.lastModification = None
	
	def getURL(self):
		return f'{self.application.rootURL}sarfunkel'
	
	def getContent(self) -> str:
		if __MERGED_SCRIPT__ is None or self.checkModification():
			self.mergeScript()
		return __MERGED_SCRIPT__
	
	def getScriptList(self) -> List[str]:
		root = f'{self.resourcePath}/share/js/sarfunkel'
		scriptList = self.browseScriptName(f'{root}/util', 'sarfunkel/util/')
		scriptList.extend([f'sarfunkel/{i}' for i in __BASE__])
		scriptList.extend(self.browseScriptName(f'{root}/component', 'sarfunkel/component/', __BASE_COMPONENT__))
		scriptList.extend(self.browseScriptName(f'{root}/view', 'sarfunkel/view/', __BASE_VIEW__))
		scriptList.extend(self.browseScriptName(f'{root}/input', 'sarfunkel/input/', __BASE_INPUT__))
		scriptList.extend([f'sarfunkel/{i}' for i in __BASE_COLUMN__])
		scriptList.extend(self.browseScriptName(f'{root}/column', 'sarfunkel/column/'))
		scriptList.extend([f'sarfunkel/{i}' for i in __PAGE__])
		return scriptList
	
	def checkModification(self):
		if self.lastModification is None:
			self.lastModification = self.getLastModification()
			return True
		else:
			lastModification = self.getLastModification()
			result = lastModification > self.lastModification
			self.lastModification = lastModification
			return result
	
	def getLastModification(self):
		rootPath = self.getRootPath()
		lastModification = None
		for root, dirs, files in os.walk(rootPath) :
			for i in files:
				modifyTime = os.stat(f'{root}/{i}').st_mtime
				if lastModification is None or modifyTime > lastModification:
					lastModification = modifyTime
		return lastModification

	def mergeScript(self):
		global __MERGED_SCRIPT__
		content = self.browseScript('/util/')
		content.extend(self.readFileList(__BASE__))
		content.extend(self.browseScript('/component/', __BASE_COMPONENT__))
		content.extend(self.browseScript('/view/', __BASE_VIEW__))
		content.extend(self.browseScript('/input/', __BASE_INPUT__))
		content.extend(self.readFileList(__BASE_COLUMN__))
		content.extend(self.browseScript('/column/'))
		content.extend(self.readFileList(__PAGE__))
		__MERGED_SCRIPT__ = '\n'.join(content)
	
	def readFileList(self, fileList: List[str]) -> List[str]:
		root = self.getRootPath()
		content = []
		for i in fileList:
			path = f'{root}/{i}'
			with open(conform(path)) as fd :
				content.append(fd.read())
		return content
	
	def browseScriptName(self, root: str, prefix: str, base: List[str]=[]) -> List[str]:
		nameList = []
		for i in base:
			nameList.append(f'{prefix}{i}')
		for i in os.listdir(conform(root)) :
			if i in base: continue
			nameList.append(f'{prefix}{i}')
		return nameList


	def browseScript(self, path: str, base: List[str]=[]) -> List[str]:
		root = self.getRootPath()
		root = f'{root}{path}'
		content = []
		for i in base:
			path = f'{root}{i}'
			with open(conform(path)) as fd :
				content.append(fd.read())
		for i in os.listdir(conform(root)) :
			if i in base: continue
			path = f'{root}{i}'
			with open(conform(path)) as fd :
				content.append(fd.read())
		return content

	def getRootPath(self) -> str:
		return f'{self.resourcePath}/share/js/sarfunkel'
