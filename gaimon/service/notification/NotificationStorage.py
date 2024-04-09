import logging
import traceback
from gaimon.service.notification.NotificationItem import NotificationItem, META_LENGTH, INDEX_LENGTH, SENT_INDEX_LENGTH
from xerial.DateColumn import DATE_FORMAT

from typing import Dict, List
from datetime import datetime

import json, io, os

__PER_PAGE__ = 20


class NotificationStorage:
	def __init__(self, resourcePath: str):
		self.resourcePath = resourcePath
		self.unreadFormat = f'{self.resourcePath}/UnreadMeta-{{uid}}.bin'
		self.unsentPath = f'{self.resourcePath}/UnsentMeta.bin'
		self.metaFormat = f'{self.resourcePath}/NotificationMeta-{{uid}}.bin'
		self.infoFormat = f'{self.resourcePath}/NotificationInfo-{{uid}}.bin'
		self.levelFormat = f'{self.resourcePath}/NotificationLevel-{{level}}-{{uid}}.bin'

	def count(self, uid: int) -> int:
		metaPath = self.metaFormat.format(uid=uid)
		fileStat = os.stat(metaPath)
		fileSize = fileStat.st_size
		return fileSize // META_LENGTH

	def getUnread(self, uid: int) -> Dict[int, List[NotificationItem]]:
		unreadPath = self.unreadFormat.format(uid=uid)
		if not os.path.isfile(unreadPath): return []
		fileStat = os.stat(unreadPath)
		fileSize = fileStat.st_size
		if fileSize == 0: return []

		with open(unreadPath, 'rb') as fd:
			rawIndex = fd.read()
		return self.readItemFromIndex(uid, rawIndex)

	def setUnread(self, uid: int, notificationList: List[NotificationItem]):
		unreadPath = self.unreadFormat.format(uid=uid)
		with open(unreadPath, 'wb') as fd:
			bufferList = []
			for item in notificationList:
				index = item.packIndex()
				bufferList.append(index)
			buffer = b''.join(bufferList)
			fd.seek(0, io.SEEK_END)
			fd.write(buffer)
			fd.flush()

	def resetUnread(self, uid: int, notificationList: List[NotificationItem]):
		unreadPath = self.unreadFormat.format(uid=uid)
		with open(unreadPath, 'wb') as fd:
			bufferList = []
			for item in notificationList:
				index = item.packIndex()
				bufferList.append(index)
			buffer = b''.join(bufferList)
			fd.seek(0, io.SEEK_SET)
			fd.write(buffer)
			fd.flush()

	def getUnsent(self) -> List[NotificationItem]:
		if not os.path.isfile(self.unsentPath): return []
		fileStat = os.stat(self.unsentPath)
		fileSize = fileStat.st_size
		if fileSize == 0: return []

		grouped = self.readUnsentIndex()

		result = []
		for uid, itemList in grouped.items():
			self.readItemContent(uid, itemList)
			result.extend(itemList)
		return result

	def readUnsentIndex(self) -> Dict[int, List[NotificationItem]]:
		with open(self.unsentPath, 'rb') as fd:
			rawIndex = fd.read()

		grouped: Dict[int, List[NotificationItem]] = {}
		length = len(rawIndex)
		position = 0
		nextPosition = SENT_INDEX_LENGTH
		while position < length:
			raw = rawIndex[position:nextPosition]
			position = nextPosition
			nextPosition += SENT_INDEX_LENGTH
			item = NotificationItem(None, None, None, {})
			item.unpackSentIndex(raw)
			itemList = grouped.get(item.uid, [])
			if len(itemList) == 0: grouped[item.uid] = itemList
			itemList.append(item)
		return grouped

	def setUnsent(self, notificationList: List[NotificationItem]):
		with open(self.unsentPath, 'wb') as fd:
			bufferList = []
			for item in notificationList:
				index = item.packUnsentIndex()
				bufferList.append(index)
			buffer = b''.join(bufferList)
			fd.seek(0, io.SEEK_END)
			fd.write(buffer)
			fd.flush()

	def resetUnsent(self, uid: int, notificationList: List[NotificationItem]):
		if len(notificationList) == 0: return
		with open(self.unsentPath, 'wb') as fd:
			bufferList = []
			for item in notificationList:
				index = item.packUnsentIndex()
				bufferList.append(index)
			buffer = b''.join(bufferList)
			fd.seek(0, io.SEEK_SET)
			fd.write(buffer)
			fd.flush()

	def groupNotificationByUID(
		self,
		notificationList: List[NotificationItem]
	) -> Dict[int,
				List[NotificationItem]]:
		grouped: Dict[int, List[NotificationItem]] = {}
		for item in notificationList:
			itemList = grouped.get(item.uid, [])
			if len(itemList) == 0: grouped[item.uid] = itemList
			itemList.append(item)
		return grouped

	def append(self, notificationList: List[NotificationItem]):
		grouped = self.groupNotificationByUID(notificationList)
		for uid, itemList in grouped.items():
			metaPath = self.metaFormat.format(uid=uid)
			infoPath = self.infoFormat.format(uid=uid)
			metaMode = 'rb+' if os.path.isfile(metaPath) else 'wb'
			infoMode = 'rb+' if os.path.isfile(infoPath) else 'wb'
			levelMap: Dict[int, List[NotificationItem]] = {}
			with open(metaPath, metaMode) as metaFD:
				with open(infoPath, infoMode) as infoFD:
					for item in itemList:
						levelList = levelMap.get(item.level, [])
						if len(levelList) == 0: levelMap[item.level] = levelList
						levelList.append(item)
						position = infoFD.seek(0, io.SEEK_END)
						meta = item.pack(position)
						metaPosition = metaFD.seek(0, io.SEEK_END)
						item.metaPosition = metaPosition
						metaFD.write(meta)
						info = json.dumps(item.info, ensure_ascii=False)
						infoFD.write(info.encode())
						item.uid = uid
			self.setUnread(uid, itemList)
			self.appendLevel(uid, levelMap)
		self.setUnsent(itemList)

	def appendLevel(self, uid: int, levelMap: Dict[int, List[NotificationItem]]):
		for level, itemList in levelMap.items():
			levelPath = self.levelFormat.format(level=level, uid=uid)
			mode = 'rb+' if os.path.isfile(levelPath) else 'wb'
			bufferList = []
			for item in itemList:
				if item.metaPosition == -1: continue
				bufferList.append(item.packIndex())

			with open(levelPath, mode) as fd:
				fd.seek(0, io.SEEK_END)
				fd.write(b''.join(bufferList))

	def setAsRead(
		self,
		uid: int,
		readList: List[NotificationItem],
		unreadList: List[NotificationItem]
	):
		groupedRead = self.groupNotificationByUID(readList)
		groupedUnread = self.groupNotificationByUID(unreadList)
		for uid, readList in groupedRead.items():
			metaPath = self.metaFormat.format(uid=uid)
			if not os.path.isfile(metaPath): continue
			readMap = {}
			with open(metaPath, 'rb+') as metaFD:
				for item in readList:
					if item.metaPosition == -1: continue
					metaFD.seek(item.metaPosition, io.SEEK_SET)
					item.isRead = True
					meta = item.pack(item.position)
					metaFD.write(meta)
					readMap[item.ID] = item
			unreadList = groupedUnread.get(uid, [])
			filteredUnread = [i for i in unreadList if i.ID not in readMap]
			self.resetUnread(uid, filteredUnread)

	def setAsSent(
		self,
		uid: int,
		readList: List[NotificationItem],
		unsentList: List[NotificationItem]
	):
		groupedRead = self.groupNotificationByUID(readList)
		groupedUnsent = self.groupNotificationByUID(unsentList)
		filteredUnsent = []
		for uid, readList in groupedRead.items():
			metaPath = self.metaFormat.format(uid=uid)
			readMap = {}
			with open(metaPath, 'rb+') as metaFD:
				for item in readList:
					if item.metaPosition == -1: continue
					metaFD.seek(item.metaPosition, io.SEEK_SET)
					item.isSent = True
					meta = item.pack(item.position)
					metaFD.write(meta)
					readMap[item.ID] = item
			unsentList = groupedUnsent.get(uid, [])
			filteredUnsent.extend([i for i in unsentList if i.uid not in readMap])
		self.resetUnsent(filteredUnsent)

	def getPage(self, uid: int, page: int, perPage: int) -> List[NotificationItem]:
		result = []
		metaPath = self.metaFormat.format(uid=uid)
		if not os.path.isfile(metaPath): return result
		fileStat = os.stat(metaPath)
		fileSize = fileStat.st_size
		if fileSize == 0: return []
		pageSize = perPage * META_LENGTH
		start = page * pageSize
		end = min(fileSize, (page + 1) * pageSize)
		size = end - start
		if start >= fileSize or size <= 0: return []
		print('metaPath', metaPath)
		with open(metaPath, 'rb') as metaFD:
			print(f'size={size} end={end} start={start}')
			metaFD.seek(start, io.SEEK_SET)
			rawMeta = metaFD.read(size)
		return self.readItemFromMeta(uid, start, rawMeta)

	def search(self,
				uid: int,
				level: int,
				date: str,
				info: str) -> List[NotificationItem]:
		base: List[NotificationItem] = None
		if date is None or len(date) == 0:
			if level is None or level <= 0: base = self.readAll(uid)
			else: base = self.readLevel(uid, level)
		else:
			base = self.readDate(uid, date)
			if level is not None and level > 0:
				base = [i for i in base if i.level == level]
		if info is not None and len(info) > 1:
			return [i for i in base if 'message' in i.info and info in i.info['message']]
		else:
			return base

	def readAll(self, uid: int) -> List[NotificationItem]:
		metaPath = self.metaFormat.format(uid=uid)
		if not os.path.isfile(metaPath): return []
		with open(metaPath, 'rb') as fd:
			rawMeta = fd.read()
			return self.readItemFromMeta(uid, 0, rawMeta)

	def readLevel(self, uid: int, level: int) -> List[NotificationItem]:
		levelPath = self.levelFormat.format(level=level, uid=uid)
		if not os.path.isfile(levelPath): return []
		with open(levelPath, 'rb') as fd:
			rawIndex = fd.read()
		return self.readItemFromIndex(uid, rawIndex)

	def readDate(self, uid: int, date: str) -> List[NotificationItem]:
		metaPath = self.metaFormat.format(uid=uid)
		if not os.path.isfile(metaPath): return []
		searchDate = datetime.strptime(date, DATE_FORMAT)
		startTime = searchDate.timestamp()
		endTime = startTime + 60 * 60 * 24
		fileStat = os.stat(metaPath)
		fileSize = fileStat.st_size
		n = fileSize // META_LENGTH
		with open(metaPath, 'rb') as fd:
			start = self.getMetaPositionByTime(fd, startTime, n)
			end = self.getMetaPositionByTime(fd, endTime, n)
			size = (end - start + 1) * META_LENGTH
			position = start * META_LENGTH
			fd.seek(position)
			rawMeta = fd.read(size)
			return self.readItemFromMeta(uid, position, rawMeta)

	def getMetaPositionByTime(self, metaFD, searchTime: float, n: int):
		low = 0
		high = n - 1
		i = 0
		item = NotificationItem()
		while low <= high:
			i = (high + low) // 2
			position = i * META_LENGTH
			metaFD.seek(position, io.SEEK_SET)
			raw = metaFD.read(META_LENGTH)
			item.unpack(raw)
			if item.notifyTime < searchTime:
				low = i + 1
			elif item.notifyTime > searchTime:
				high = i - 1
			else:
				break
		return i

	def getCurrent(self, uid: int, number: int) -> List[NotificationItem]:
		result = []
		metaPath = self.metaFormat.format(uid=uid)
		if not os.path.isfile(metaPath): return result
		fileStat = os.stat(metaPath)
		fileSize = fileStat.st_size
		if fileSize == 0: return []
		with open(metaPath, 'rb') as metaFD:
			size = number * META_LENGTH
			start = max(fileSize - size, 0)
			metaFD.seek(start, io.SEEK_SET)
			rawMeta = metaFD.read(fileSize - start)
		return self.readItemFromMeta(uid, start, rawMeta)

	def readItemFromIndex(self, uid: int, rawIndex: bytes):
		position = 0
		nextPosition = INDEX_LENGTH
		length = len(rawIndex)
		itemList = []
		while position < length:
			index = rawIndex[position:nextPosition]
			position = nextPosition
			nextPosition += INDEX_LENGTH
			item = NotificationItem()
			item.uid = uid
			item.unpackIndex(index)
			itemList.append(item)
		self.readItemContent(uid, itemList)
		return itemList

	def readItemFromMeta(self,
							uid: int,
							start: int,
							rawMeta: bytes) -> List[NotificationItem]:
		result = []
		infoPath = self.infoFormat.format(uid=uid)
		print('infoPath', infoPath)
		with open(infoPath, 'rb') as infoFD:
			position = 0
			size = len(rawMeta)
			nextPosition = META_LENGTH
			while position < size:
				raw = rawMeta[position:nextPosition]
				item = NotificationItem()
				item.unpack(raw)
				item.uid = uid
				item.metaPosition = start + position

				infoFD.seek(item.position, io.SEEK_SET)
				info = infoFD.read(item.length)
				item.info = json.loads(info)
				result.append(item)
				position = nextPosition
				nextPosition += META_LENGTH
		return result

	def readItemContent(self, uid: int, itemList: List[NotificationItem]):
		metaPath = self.metaFormat.format(uid=uid)
		if not os.path.isfile(metaPath): return
		infoPath = self.infoFormat.format(uid=uid)
		with open(metaPath, 'rb') as metaFD:
			with open(infoPath, 'rb') as infoFD:
				for item in itemList:
					metaFD.seek(item.metaPosition, io.SEEK_SET)
					dataRaw = metaFD.read(META_LENGTH)
					item.unpack(dataRaw)

					infoFD.seek(item.position, io.SEEK_SET)
					info = infoFD.read(item.length)
					try:
						item.info = json.loads(info)
					except:
						print(info)
						logging.error(traceback.format_exc())
						item.info = { 'message': 'error'}
						
