from gaimon.core.WebSocketManagement import WebSocketManagement
from gaimon.core.WebSocketMode import WebSocketMode
from gaimon.model.UserGroupPermission import UserGroupPermission
from gaimon.service.notification.NotificationStorage import NotificationStorage
from gaimon.service.notification.NotificationItem import NotificationItem
from gaimon.service.notification.NotificationType import NotificationType
from gaimon.util.DateTimeUtil import getCurrentDateID

from gaimon.model.User import User

from xerial.AsyncDBSessionBase import AsyncDBSessionBase

from typing import List, Dict
from sanic import Websocket
import asyncio, logging, traceback, json, os


class NotificationManagement:
	def __init__(self, config, resourcePath: str, entity: str, sleepTime: int = 300):
		self.config = config
		self.entity = entity
		self.resourcePath = f'{resourcePath}/notification/Entity-{entity}/'
		self.storageMap: Dict[NotificationType, NotificationStorage] = {}
		self.unread = {}
		self.unreadMap = {}
		self.permissionDict = {}
		for i in NotificationType:
			self.unread[i.value] = {}
			self.unreadMap[i.value] = {}
			self.storageMap[i] = NotificationStorage(f'{self.resourcePath}/{i.value}')
		self.unsent: List[NotificationItem] = []
		self.sleepTime = sleepTime
		self.socketMap: Dict[int, List[Websocket]] = {}
		self.socketIDMap: Dict[int, Websocket] = {}
		self.socketID = 1


	def setSocket(self, uid: int, socket: Websocket):
		socketList = self.socketMap.get(uid, [])
		if len(socketList) == 0: self.socketMap[uid] = socketList
		if hasattr(socket, 'uidList'):
			socket.uidList.append(uid)
		else:
			socket.uidList = [uid]
		socketList.append(socket)

	def removeSocket(self, uid: int, socket: Websocket):
		socketList = self.socketMap.get(uid, None)
		if socketList is None: return
		if hasattr(socket, 'uidList'):
			if uid in socket.uidList:
				socket.uidList.remove(uid)
		if socket in socketList:
			socketList.remove(socket)

	def appendSocket(self, socket: Websocket) -> int:
		socketID = self.socketID
		self.socketID += 1
		self.socketIDMap[socketID] = socket
		return socketID

	def setSocketUID(self, socketID: int, uid: int):
		socket = self.socketIDMap.get(socketID, None)
		if socket is None: return False
		self.setSocket(uid, socket)
		return True

	def removeSocketUID(self, socketID: int, uid: int):
		socket = self.socketIDMap.get(socketID, None)
		if socket is None: return False
		self.removeSocket(uid, socket)
		del self.socketIDMap[socketID]
		return True

	async def createReceiveTask(self, socket: Websocket):
		while True:
			if WebSocketManagement.isClose(socket):
				self.removeSocket(socket)
			received = await socket.recv()
			data = json.loads(received)
			uid = data['uid']
			socketList = self.socketMap.get(uid, [])
			if len(socketList) == 0: self.socketMap[uid] = socketList
			socketList.append(socket)

	def removeSocket(self, uid: int, socket: Websocket):
		if hasattr(socket, 'uidList'):
			uidList = socket.uidList
			for uid in uidList:
				if uid not in self.socketMap:
					if socket in self.socketMap[uid]:
						self.socketMap[uid].remove(socket)

		if uid not in self.socketMap:
			if socket in self.socketMap[uid]:
				self.socketMap[uid].remove(socket)

	def checkPath(self):
		if not os.path.isdir(self.resourcePath):
			os.makedirs(self.resourcePath)
		for i in NotificationType:
			path = f'{self.resourcePath}/{i.value}'
			if not os.path.isdir(path):
				os.makedirs(path)

	def loadUnsent(self):
		self.unsent = []
		for storage in self.storageMap.values():
			self.unsent.extend(storage.getUnsent())

	async def append(self, type: NotificationType, item: NotificationItem):
		await self.sendToPush(type, item)
		self.storageMap[type].append([item])
		self.unsent.append(item)
		if item.uid not in self.unread[type]:
			unread = []
			self.unread[type][item.uid] = unread
		else:
			unread = self.unread[type][item.uid]

		if item.uid not in self.unreadMap:
			unreadMap = {}
			self.unreadMap[type][item.uid] = unreadMap
		else:
			unreadMap = self.unreadMap[type][item.uid]
		unreadMap[item.ID] = item
		unread.append(item)

	async def sendToPush(self, type: NotificationType, item: NotificationItem):
		if type != NotificationType.INTERNAL: return False
		socketList = self.socketMap.get(item.uid, None)
		if socketList is None: return False
		alive = []
		result = {
			'mode': WebSocketMode.PUSH.value,
			'route': '/notification',
			'isSuccess': True,
		}
		for socket in socketList:
			if not WebSocketManagement.isClose(socket):
				result['result'] = item.toDict()
				await socket.send(json.dumps(result))
				alive.append(socket)
			else:
				self.removeSocket(item.uid, socket)
				print(">>> Socket is closed")
		self.socketMap[item.uid] = alive
		return True

	def getUnread(self,
			type: NotificationType,
			uid: int,
			startTime: float
		) -> List[NotificationItem]:

		if uid not in self.unread[type]:
			unread = self.storageMap[type].getUnread(uid)
			self.unread[type][uid] = unread
			self.unreadMap[type][uid] = {i.ID: i for i in unread}
		else:
			unread = self.unread[type][uid]
		if startTime < 0 or len(unread) == 0:
			return unread
		else:
			return NotificationManagement.getByStartTime(unread, startTime)

	@staticmethod
	def getByStartTime(notificationList: List[NotificationItem], startTime: float) -> List[NotificationItem]:
		n = len(notificationList)
		if n == 0: return []
		last = notificationList[-1]
		if last.notifyTime < startTime: return []
		low = 0
		high = n - 1
		i = 0
		while low <= high:
			i = (high + low) // 2
			notification: NotificationItem = notificationList[i]
			if notification.notifyTime < startTime:
				low = i + 1
			elif notification.notifyTime > startTime:
				high = i - 1
			else:
				break
		return notificationList[i:]

	def setAsRead(self, type: NotificationType, uid: int, notificationIDList: List[int]):
		unreadMap = self.unreadMap[type].get(uid, {})
		readList = []
		unreadList = self.unread[type].get(uid, [])
		for notificationID in notificationIDList:
			if notificationID in unreadMap:
				readList.append(unreadMap[notificationID])
				del unreadMap[notificationID]
		self.unread[type][uid] = sorted(
			list(unreadMap.values()),
			key=lambda x: x.notifyTime
		)
		self.storageMap[type].setAsRead(uid, readList, unreadList)

	async def send(self):
		while True:
			self.dateID = getCurrentDateID()
			current = self.unsent[:]
			self.unsent = []
			unsent = []
			sent = {i.value: [] for i in NotificationType}
			for item in current:
				try:
					await item.send()
					sent[item.type].append(item)
				except:
					logging.error(traceback.format_exc())
					unsent.append(item)
			for type, notificationList in sent.items():
				self.storageMap[type].setAsSent(notificationList)
			self.unsent.extend(unsent)
			await asyncio.sleep(self.sleepTime)

	async def prepareUser(self, session) :
		permissions : List[UserGroupPermission]= await session.select(
			UserGroupPermission, ''
		)
		if len(permissions):
			for permission in permissions:
				if permission.module not in self.permissionDict:
					self.permissionDict[permission.module] = []
				
				self.permissionDict[permission.module].append(permission)
       
				users: List[User] = await session.select(
					User, 'WHERE gid = ?', parameter=[permission.gid]
				)
				permission.users = users