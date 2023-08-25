from gaimon.service.notification.NotificationLevel import NotificationLevel
from gaimon.service.notification.NotificationType import NotificationType
from gaimon.core.AsyncServiceClient import AsyncServiceClient
from datetime import datetime

import time, struct, json

META_LENGTH = 24
INDEX_LENGTH = 8
SENT_INDEX_LENGTH = 16

__FORMAT__ = '<dQIbbBB'
__INDEX_FORMAT__ = '<Q'
__SENT_INDEX_FORMAT__ = '<QQ'

__READABLE_DATE_FORMAT__ = '%d %b %y, %H:%M:%S'


class NotificationItem:
	def __init__(
		self,
		uid: int = None,
		level: NotificationLevel = None,
		type: NotificationType = None,
		info: dict = {}
	):
		self.uid = uid
		self.level = level
		self.type = type
		self.info = info
		self.isRead = False
		self.isSent = False
		self.raw = json.dumps(info, ensure_ascii=False)
		self.notifyTime = time.time()
		self.ID = int(self.notifyTime * 1_000)
		self.position = -1
		self.metaPosition = -1
		# self.length = len(self.raw)
		self.length = len(self.raw.encode('utf-8'))
		self.index: bytes = None

	def pack(self, position: int) -> bytes:
		self.position = position
		return struct.pack(
			__FORMAT__,
			self.notifyTime,
			self.position,
			self.length,
			int(self.level),
			int(self.type),
			self.isRead,
			self.isSent
		)

	def packIndex(self) -> bytes:
		if self.index is None:
			self.index = struct.pack(__INDEX_FORMAT__, self.metaPosition)
		return self.index

	def packUnsentIndex(self) -> bytes:
		return struct.pack(__SENT_INDEX_FORMAT__, self.metaPosition, self.uid)

	def unpack(self, raw: bytes):
		unpacked = struct.unpack(__FORMAT__, raw)
		self.notifyTime = unpacked[0]
		self.position = unpacked[1]
		self.length = unpacked[2]
		self.level = unpacked[3]
		self.type = unpacked[4]
		self.isRead = unpacked[5]
		self.isSent = unpacked[6]

		self.ID = int(self.notifyTime * 1_000)

	def unpackIndex(self, raw: bytes):
		self.metaPosition = struct.unpack(__INDEX_FORMAT__, raw)[0]

	def unpackSentIndex(self, raw: bytes):
		self.metaPosition, self.uid = struct.unpack(__SENT_INDEX_FORMAT__, raw)

	def toDict(self) -> dict:
		return {
			'ID':
			self.ID,
			'level':
			self.level,
			'type':
			self.type,
			'notifyTime':
			self.notifyTime,
			'formattedDate':
			datetime.fromtimestamp(self.notifyTime).strftime(__READABLE_DATE_FORMAT__),
			'uid':
			self.uid,
			'info':
			self.info,
			'isRead':
			self.isRead,
			'isSent':
			self.isSent,
		}

	async def send(self):
		if self.type == NotificationType.INTERNAL_SERVICE:
			client = AsyncServiceClient(self.info)
			route = self.info['route']
			parameter = self.info['parameter']
			await client.call(route, parameter)
