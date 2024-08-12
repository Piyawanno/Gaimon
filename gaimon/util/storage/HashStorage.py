from gaimon.util.storage.HashNode import HashNode
from typing import Any

import io, struct, os
import numpy as np

HASH_FORMAT = '<qq'
TREE_FORMAT = '<qqqq'
PADDING = struct.pack(HASH_FORMAT, -1, -1)
HASH_SIZE = 16
TREE_SIZE = 32
BLOCK_SIZE = 1024
REST_SIZE = 1021
LAYER_ROUND = list(range(33, 63, 2))
LAYER_MODULUS = [i*BLOCK_SIZE+REST_SIZE for i in LAYER_ROUND]
LAYER_SIZE = np.cumsum([[HASH_SIZE*i for i in LAYER_MODULUS]])

class HashStorage:
	def __init__(self, resourcePath: str, storageName: str):
		self.resourcePath: str = resourcePath
		self.storageName: str = storageName
		self.hashFD = None
		self.layer = -1
	
	def open(self):
		self.hashPath = f'{self.resourcePath}/cuscomm/{self.storageName}.bin'
		mode = 'rb+' if os.path.isfile(self.hashPath) else 'wb+'
		self.hashFD = open(self.hashPath, mode)
		self.hashTail = self.hashFD.seek(0, io.SEEK_END)

	def close(self):
		if self.hashFD is not None : self.hashFD.close()
	
	def getBucket(self, hashed:int, reference: HashNode) -> HashNode :
		offset = 0
		for m, s in zip(LAYER_MODULUS, LAYER_SIZE) :
			if s > self.hashTail : break
			position = offset+(hashed%m)*HASH_SIZE
			self.hashFD.seek(position, io.SEEK_SET)
			buffer = self.hashFD.read(HASH_SIZE)
			storedHash, storedNode = struct.unpack(HASH_FORMAT, buffer)
			if storedHash == hashed :
				stored = self.readNode(storedNode)
				if reference.isEqual(stored) : return stored
			offset = s
		return None

	def setBucket(self, hashed:int, node:HashNode) -> bool:
		offset = 0
		for m, s in zip(LAYER_MODULUS, LAYER_SIZE) :
			position = offset+(hashed%m)*HASH_SIZE
			if s > self.hashTail :
				buffer = m*PADDING
				tail = self.hashFD.seek(0, io.SEEK_END)
				self.hashFD.write(buffer)
				self.hashTail = tail+len(buffer)
				storedHash = -1
			else :
				self.hashFD.seek(position, io.SEEK_SET)
				buffer = self.hashFD.read(HASH_SIZE)
				storedHash, storedPosition = struct.unpack(HASH_FORMAT, buffer)

			if storedHash < 0 :
				self.appendNode(node)
				buffer = struct.pack(HASH_FORMAT, hashed, node.position)
				self.hashFD.seek(position, io.SEEK_SET)
				self.hashFD.write(buffer)
				return True
			elif storedHash == hashed :
				stored = self.readNode(storedPosition)
				if stored.isEqual(node) :
					node.position = storedPosition
					self.writeNode(node)
					return True
			offset = s
		return False
	
	def setTreeRoot(self, hashed:int, node:HashNode) :
		self.appendNode(node)
		tail = self.hashFD.seek(0, io.SEEK_END)
		buffer = struct.pack(TREE_FORMAT, -1, -1, hashed, node.position)
		self.hashFD.write(buffer)
		self.hashTail = tail + TREE_SIZE
		return self.hashTail
	
	def setTree(self, hashed:int, node:HashNode):
		position = LAYER_SIZE[-1]
		while True:
			self.hashFD.seek(position, io.SEEK_SET)
			buffer = self.hashFD.read(TREE_SIZE)
			left, right, storedHash, storedNode = struct.unpack(TREE_FORMAT, buffer)
			if storedHash == hashed :
				stored = self.readNode(storedNode)
				if stored.isEqual(node) :
					node.position = storedNode
					self.writeNode(node)
					break
			if hashed >= storedHash :
				if right < 0 :
					self.appendNode(node)
					tail = self.hashFD.seek(0, io.SEEK_END)
					buffer = struct.pack(TREE_FORMAT, -1, -1, hashed, node.position)
					self.hashFD.write(buffer)
					self.hashFD.seek(position, io.SEEK_SET)
					buffer = struct.pack(TREE_FORMAT, left, tail, storedHash, storedNode)
					self.hashFD.write(buffer)
					self.hashTail = tail + TREE_SIZE
					break
				else :
					position = right
			else :
				if left < 0 :
					self.appendNode(node)
					tail = self.hashFD.seek(0, io.SEEK_END)
					buffer = struct.pack(TREE_FORMAT, -1, -1, hashed, node.position)
					self.hashFD.write(buffer)
					self.hashFD.seek(position, io.SEEK_SET)
					buffer = struct.pack(TREE_FORMAT, tail, right, storedHash, storedNode)
					self.hashFD.write(buffer)
					self.hashTail = tail + TREE_SIZE
					break
				else :
					position = left
	
	def setTreePage(self, hashed:int, node:HashNode) :
		if self.hashTail == LAYER_SIZE[-1] : self.createTreePage()
		position = LAYER_SIZE[-1]+(hashed%LAYER_MODULUS[-1])*8
		self.hashFD.seek(position, io.SEEK_SET)
		buffer = self.hashFD.read(8)
		rootPosition, = struct.unpack('<q', buffer)
		if rootPosition < 0 :
			rootPosition = self.setTreeRoot(hashed, node)
			buffer = struct.pack('<q', rootPosition)
			self.hashFD.seek(position, io.SEEK_SET)
			self.hashFD.write(buffer)
		else :
			self.setTree(hashed, node)
	
	def createTreePage(self) :
		buffer = PADDING*(LAYER_SIZE[-1]//2)
		tail = self.hashFD.seek(0, io.SEEK_END)
		self.hashFD.write(buffer)
		self.hashTail = tail + len(buffer)
	
	
	def getTree(self, hashed:int, reference: HashNode, rootPosition:int) -> HashNode :
		position = rootPosition
		while True :
			self.hashFD.seek(position, io.SEEK_SET)
			buffer = self.hashFD.read(TREE_SIZE)
			left, right, storedHash, storedNode = struct.unpack(TREE_FORMAT, buffer)
			if storedHash == hashed :
				stored = self.readNode(storedNode)
				if reference.isEqual(stored) : return stored
				position = right
			elif hashed > storedHash :
				position = right
			else :
				position = left
			if position < 0 : break
		return None
	
	def getTreePage(self, hashed:int, reference: HashNode) -> HashNode :
		position = LAYER_SIZE[-1]+(hashed%LAYER_MODULUS[-1])*8
		self.hashFD.seek(position, io.SEEK_SET)
		buffer = self.hashFD.read(8)
		rootPosition, = struct.unpack('<q', buffer)
		if rootPosition < 0 : return None
		return self.getTree(hashed, reference, rootPosition)
	
	def checkTailSize(self) -> bool:
		return self.hashTail >= LAYER_SIZE[-1]

	def appendNode(self, node:HashNode):
		raise NotImplementedError
	
	def readNode(self, position: int) -> HashNode:
		raise NotImplementedError
	
	def writeNode(self, node:HashNode):
		raise NotImplementedError

