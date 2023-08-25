from xerial.Record import Record
from gaimon.model.PermissionType import PermissionType
from dataclasses import dataclass

import struct, json, io, time

BUFFER_SIZE = 26

__BUFFER_FORMAT__ = '<QHdQ'


@dataclass
class BusinessLogItem:
	modelName: str
	ID: int
	uid: int
	operation: int
	operationTime: float
	dataPosition: int
	data: dict

	def __init__(self):
		pass

	def fromRecord(self, record: Record, uid: int, permissionType: PermissionType):
		modelClass = record.__class__
		self.modelName = str(modelClass.__name__)
		self.ID = getattr(record, modelClass.primary)
		self.uid = uid
		self.operation = permissionType
		self.data = record.toDict()
		self.operationTime = time.time()
		return self

	def fromBuffer(self, buffer: bytes):
		unpacked = struct.unpack(__BUFFER_FORMAT__, buffer)
		self.uid, self.operation, self.operationTime, self.dataPosition = unpacked
		return self

	def toBuffer(self) -> bytes:
		return struct.pack(
			__BUFFER_FORMAT__,
			self.uid,
			self.operation,
			self.operationTime,
			self.dataPosition
		)

	def fromDict(self, data: dict):
		self.modelName = data['modelName']
		self.ID = data['ID']
		self.uid = data['uid']
		self.operation = data['operation']
		self.operationTime = data['operationTime']
		self.data = data['data']
		return self

	def toDict(self) -> dict:
		return {
			'modelName': self.modelName,
			'ID': self.ID,
			'uid': self.uid,
			'operation': self.operation,
			'operationTime': self.operationTime,
			'data': self.data,
		}

	def appendData(self, dataFD) -> int:
		self.dataPosition = dataFD.seek(0, io.SEEK_END)
		raw = json.dumps(self.data).encode()
		lengthBuffer = struct.pack('<I', len(raw))
		dataFD.write(lengthBuffer)
		dataFD.write(raw)

	def readData(self, dataFD):
		dataFD.seek(self.dataPosition, io.SEEK_SET)
		rawLength, = struct.unpack('<I', dataFD.read(4))
		raw = dataFD.read(rawLength)
		self.data = json.loads(raw)
