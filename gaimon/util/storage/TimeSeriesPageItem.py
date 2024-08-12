import numpy as np
import struct, io

HEADER_SIZE = 40
FORMAT = '<qqqqii'
BLOCK_SIZE = 1024
PAGE_SIZE = 1021
HEADER_OFFSET = (BLOCK_SIZE-PAGE_SIZE)*8*2
POSITION_END = PAGE_SIZE*8+HEADER_OFFSET
BUFFER_SIZE = BLOCK_SIZE*8*2

PADDING = (HEADER_OFFSET - HEADER_SIZE)*b'\0'

class TimeSeriesPageItem :
	position: int
	previousPage: int
	nextPage: int
	parentPage: int
	tailPage: int
	number: int
	pageSize: int
	parentIndex: int
	positionList: np.array
	timeList: np.array
	isUpdate: bool

	def __init__(self):
		self.isUpdate = False
		self.reset()
	
	def __repr__(self) :
		return f'<MessagePage p={self.position} n={self.pageSize} parent={self.parentPage}>'

	def showData(self) :
		print(list(self.positionList[:self.pageSize]), list(self.timeList[:self.pageSize]))

	def reset(self) :
		self.previousPage = -1
		self.nextPage = -1
		self.parentPage = -1
		self.tailPage = -1
		self.pageSize = 0
		self.parentIndex = 0
	
	def createData(self) :
		self.positionList = np.zeros(PAGE_SIZE, dtype=np.int64)
		self.timeList = np.zeros(PAGE_SIZE, dtype=np.float64)

	def load(self, buffer:bytes) :
		(
			self.previousPage,
			self.nextPage,
			self.parentPage,
			self.tailPage,
			self.pageSize,
			self.parentIndex,
		) = struct.unpack(FORMAT, buffer[:HEADER_SIZE])
		self.positionList = np.frombuffer(buffer[HEADER_OFFSET:POSITION_END], dtype=np.int64)
		# print(800, POSITION_END, buffer[POSITION_END:POSITION_END+40])
		self.timeList = np.frombuffer(buffer[POSITION_END:], dtype=np.float64)
	
	def loadHeader(self, buffer:bytes) :
		(
			self.previousPage,
			self.nextPage,
			self.parentPage,
			self.tailPage,
			self.pageSize,
			self.parentIndex,
		) = struct.unpack(FORMAT, buffer)

	def dump(self) -> bytes :
		header = self.dumpHeader()
		positionBuffer = self.positionList.tobytes()
		timeBuffer = self.timeList.tobytes()
		# print(400, len(header+PADDING+positionBuffer), POSITION_END)
		return b''.join([header, PADDING, positionBuffer, timeBuffer])

	def dumpHeader(self) -> bytes :
		return struct.pack(
			FORMAT,
			self.previousPage,
			self.nextPage,
			self.parentPage,
			self.tailPage,
			self.pageSize,
			self.parentIndex,
		)

	def writeHeader(self, descriptor: io.BytesIO) :
		header = self.dumpHeader()
		descriptor.seek(self.position, io.SEEK_SET)
		descriptor.write(header)

	def append(self, descriptor: io.BytesIO, position:int, time:float) :
		positionPosition = self.position+HEADER_OFFSET+self.pageSize*8
		timePosition = self.position+POSITION_END+self.pageSize*8
		self.pageSize += 1
		self.writeHeader(descriptor)
		descriptor.seek(positionPosition, io.SEEK_SET)
		buffer = struct.pack('<q', position)
		descriptor.write(buffer)
		descriptor.seek(timePosition, io.SEEK_SET)
		buffer = struct.pack('<d', time)
		descriptor.write(buffer)

	def setTime(self, descriptor: io.BytesIO, index:int, time:float) :
		timePosition = POSITION_END+index*8
		descriptor.seek(timePosition, io.SEEK_SET)
		buffer = struct.pack('<d', time)
		descriptor.write(buffer)

	def search(self, time:float) -> int :
		low = 0
		high = self.pageSize - 1
		if self.timeList[high] < time : return self.positionList[high], high
		i = 0
		while low <= high:
			i = (high + low) // 2
			compare = self.timeList[i]
			if compare < time :
				low = i + 1
			elif compare > time :
				high = i - 1
			else:
				return self.positionList[i], i
		if self.timeList[i] > time and i > 0:
			return self.positionList[i-1], i-1
		else :
			return self.positionList[i], i
