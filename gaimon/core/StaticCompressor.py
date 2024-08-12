from gaimon.util.PathUtil import conform
from typing import List
from enum import IntEnum
from css_html_js_minify import css_minify

import os, json, rjsmin, traceback, logging

__CACHE__ = {}
__CHUNK_SIZE__ = 256 * 1024


class StaticType(IntEnum):
	CSS = 1
	JS = 2


class StaticCompressor:
	def __init__(self, ID: str, type: StaticType, resourcePath: str, fileList: List[str]):
		self.ID = ID
		self.type = type
		self.resourcePath = resourcePath
		self.fileList = []
		added = set()
		for i in fileList:
			path = conform(i)
			if path in added: self.fileList.remove(path)
			else: added.add(path)
			self.fileList.append(path)
		self.isCompressed = False
		self.content = []
		self.meta = None
		self.path = f"{self.resourcePath}/compress/{self.ID}/{self.type.name}/"

	def getContent(self) -> str:
		if not self.isCompressed:
			isUpdate = self.checkUpdate()
			if isUpdate or not self.checkCompressed():
				self.compress()
				if isUpdate:
					with open(f"{self.path}/Meta.json", "wt") as fd:
						try:
							json.dump(self.meta, fd, indent=4)
						except:
							print(traceback.format_exc())
			else:
				self.readCompressed()
			self.isCompressed = True
		if self.type == StaticType.CSS:
			return [f'compress/css/{self.ID}/{i}' for i in range(self.sequence)]
		else:
			return [f'compress/js/{self.ID}/{i}' for i in range(self.sequence)]

	def checkCompressed(self) -> bool:
		if 'sequence' not in self.meta:
			return False

		for i in range(self.meta['sequence']):
			compressPath = f"{self.path}/Compressed-{i}.txt"
			if not os.path.isfile(compressPath):
				return False
		return True

	def checkUpdate(self):
		self.fileList = [i for i in self.fileList if os.path.isfile(i)]
		if not os.path.isdir(self.path): os.makedirs(self.path)
		if len(self.fileList):
			maxTime = max([os.stat(i).st_mtime for i in self.fileList])
		else:
			maxTime = 0.0
		print(f'>>> Compression {self.ID}({self.type}) Last modification: {maxTime}')
		metaPath = f"{self.path}/Meta.json"
		isUpdate = True
		if os.path.isfile(metaPath):
			isUpdate = False
			with open(metaPath) as fd: 	
				self.meta = json.load(fd)
				self.sequence = self.meta['sequence']
			lastModified = self.meta['lastModified']
			if lastModified < maxTime:
				intersected = set(self.fileList).intersection(set(self.meta['fileList']))
				isUpdate = len(intersected) > 0
		if isUpdate:
			print(f'>>> Update Compression {self.ID}({self.type})')
			self.meta = {'fileList': self.fileList, 'lastModified': maxTime,}
		return isUpdate

	def compress(self):
		content = []
		pathList = []
		contentLength = 0
		self.sequence = 0
		for path in self.fileList:
			cached = __CACHE__.get(path, None)
			if cached is not None:
				content.append(cached)
				continue
			with open(path) as fd:
				raw = fd.read()
				contentLength += len(raw)
				pathList.append(f'\n/* Compressed {path} */\n')
				content.append(raw)
				__CACHE__[path] = raw
			if contentLength >= __CHUNK_SIZE__:
				self.storeCompress(content, pathList, self.sequence)
				self.sequence += 1
				content = []
				pathList = []
				contentLength = 0
		self.storeCompress(content, pathList, self.sequence)
		self.sequence += 1
		self.meta['sequence'] = self.sequence

	def storeCompress(self, content: List[str], pathList: List[str], sequence: int):
		isCompress = True
		if isCompress:
			if self.type == StaticType.JS:
				compressed = '\n\n'.join([f'{i}{rjsmin.jsmin(j)}' for i, j in zip(pathList, content)])
			elif self.type == StaticType.CSS:
				compressed = '\n\n'.join([f'{i}{css_minify(j)}' for i, j in zip(pathList, content)])
		else:
			compressed = '\n\n'.join([f'{i}{j}' for i, j in zip(pathList, content)])
		compressPath = f"{self.path}/Compressed-{sequence}.txt"
		with open(compressPath, 'wt') as fd:
			fd.write(compressed)
		self.content.append(compressed)
		return compressed

	def readMeta(self):
		metaPath = f"{self.path}/Meta.json"
		if os.path.isfile(metaPath):
			with open(metaPath) as fd:
				self.meta = json.load(fd)
				self.sequence = self.meta['sequence']

	def readCompressed(self):
		if self.meta is None:
			self.readMeta()
		for i in range(self.meta['sequence']):
			compressPath = f"{self.path}/Compressed-{i}.txt"
			try:
				with open(compressPath) as fd:
					self.content.append(fd.read())
			except:
				print(traceback.format_exc())
