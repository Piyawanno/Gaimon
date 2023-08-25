from gaimon.service.businesslog.BusinessLogItem import BusinessLogItem, BUFFER_SIZE

from dataclasses import dataclass
from typing import List

import os, io, json, struct, time, logging

__MODEL_PATH__ = "{resourcePath}/Model-{modelName}.bin"
__PAGE_HEADER_FORMAT__ = '<qddI'
__PAGE_HEADER_LENGTH__ = 28
__PAGE_SIZE__ = 2**10
__UNSET_POSITION_BUFFER__ = struct.pack('<q', -1)


@dataclass
class PageHeader:
	__slots__ = 'position', 'nextPosition', 'headTime', 'tailTime', 'tail'
	position: int
	nextPosition: int
	headTime: float
	tailTime: float
	tail: int

	@staticmethod
	def fromBuffer(buffer: bytes, position: int):
		nextPosition, headTime, tailTime, tail = struct.unpack(
			__PAGE_HEADER_FORMAT__, buffer
		)
		return PageHeader(position, nextPosition, headTime, tailTime, tail)

	def setHead(self, pageFD):
		buffer = struct.pack(
			__PAGE_HEADER_FORMAT__,
			self.nextPosition,
			self.headTime,
			self.tailTime,
			self.tail
		)
		pageFD.seek(self.position, io.SEEK_SET)
		pageFD.write(buffer)

	def append(self, buffer: bytes, pageFD, isFill: bool = False):
		now = time.time()
		tail = self.tail + len(buffer)
		if tail < __PAGE_SIZE__:
			pageFD.seek(self.position + self.tail, io.SEEK_SET)
			pageFD.write(buffer)
			if isFill:
				filling = (__PAGE_SIZE__ - tail) * b'\x00'
				pageFD.write(filling)
			self.tail = tail
			self.tailTime = now
			self.setHead(pageFD)
		else:
			eof = pageFD.seek(0, io.SEEK_END)
			neighbor = PageHeader(eof, -1, now, now, __PAGE_HEADER_LENGTH__)
			neighbor.append(buffer, pageFD, True)
			pageFD.write(b'\x00' * (__PAGE_SIZE__ - tail))
			self.nextPosition = eof
			self.setHead(pageFD)


class BusinessLogStorage:
	def __init__(self, resourcePath: str):
		self.resourcePath = resourcePath
		self.dataPath = f'{self.resourcePath}/Data.bin'
		self.dataFD = None
		self.pagePath = f'{self.resourcePath}/Page.bin'
		self.pageFD = None
		self.modelFDMap = {}
		print(self.dataPath)

	def __del__(self):
		self.close()

	def checkPath(self):
		if not os.path.isdir(self.resourcePath):
			os.makedirs(self.resourcePath)

	def open(self):
		mode = "rb+" if os.path.isfile(self.dataPath) else "wb+"
		self.dataFD = open(self.dataPath, mode)
		mode = "rb+" if os.path.isfile(self.pagePath) else "wb+"
		self.pageFD = open(self.pagePath, mode)
		for i in os.listdir(self.resourcePath):
			if i[:6] != 'Model-': continue
			self.getModelFD(i[6:-4])

	def close(self):
		logging.info(">>> Closing file descriptors.")
		if self.dataFD is not None:
			self.dataFD.close()
		if self.pageFD is not None:
			self.pageFD.close()
		for descriptor in self.modelFDMap.values():
			descriptor.close()

	def append(self, item: BusinessLogItem):
		modelFD = self.getModelFD(item.modelName)
		item.appendData(self.dataFD)
		buffer = item.toBuffer()
		eof = modelFD.seek(0, io.SEEK_END)
		position = item.ID << 4
		pageTail = self.pageFD.seek(0, io.SEEK_END)
		self.pageFD.write(buffer)
		self.pageFD.write(__UNSET_POSITION_BUFFER__)
		tailBuffer = struct.pack('<q', pageTail)

		if position >= eof:
			if position > eof:
				modelFD.write(__UNSET_POSITION_BUFFER__ * ((position - eof) >> 3))
			modelFD.seek(position, io.SEEK_SET)
			modelFD.write(tailBuffer + tailBuffer)
		else:
			modelFD.seek(position, io.SEEK_SET)
			positionBuffer = modelFD.read(16)
			head, tail = struct.unpack('<qq', positionBuffer)
			if head < 0:
				modelFD.write(tailBuffer + tailBuffer)
			else:
				self.pageFD.seek(tail + BUFFER_SIZE, io.SEEK_SET)
				self.pageFD.write(tailBuffer)
				modelFD.seek(position + 8, io.SEEK_SET)
				modelFD.write(tailBuffer)

	def getByRecordID(self, modelName: str, ID: int) -> List[BusinessLogItem]:
		modelFD = self.modelFDMap.get(modelName, None)
		if modelFD is None: return []
		result = []
		metaPosition = ID << 4
		modelFD.seek(metaPosition, io.SEEK_SET)
		position, = struct.unpack('<q', modelFD.read(8))
		bufferSize = BUFFER_SIZE + 8
		while position >= 0:
			self.pageFD.seek(position, io.SEEK_SET)
			buffer = self.pageFD.read(bufferSize)
			item = BusinessLogItem().fromBuffer(buffer[:BUFFER_SIZE])
			item.modelName = modelName
			item.ID = ID
			item.readData(self.dataFD)
			position, = struct.unpack('<q', buffer[BUFFER_SIZE:])
			result.append(item)
		return result

	def getModelFD(self, modelName: str):
		modelFD = self.modelFDMap.get(modelName, None)
		if modelFD is not None: return modelFD
		path = __MODEL_PATH__.format(resourcePath=self.resourcePath, modelName=modelName)
		mode = "rb+" if os.path.isfile(path) else "wb+"
		modelFD = open(path, mode)
		self.modelFDMap[modelName] = modelFD
		return modelFD
