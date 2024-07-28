from gaimon.core.AsyncServiceClient import AsyncServiceClient
from gaimon.core.Route import POST, SOCKET
from gaimon.core.WebSocketManagement import WebSocketManagement
from gaimon.model.User import User
from gaimon.model.UserGroupPermission import UserGroupPermission
from gaimon.service.notification.NotificationItem import NotificationItem
from gaimon.service.notification.NotificationType import NotificationType
from xerial.AsyncDBSessionBase import AsyncDBSessionBase

from sanic import Websocket
from typing import List,Dict

"""
TODO
- Store permission map (module, role, user) in Management and trigger by change.
- Store service configuration in management.
"""
class NotificationHandler:
	def __init__(self, service):
		from gaimon.service.notification.NotificationService import NotificationService
		from gaimon.service.notification.NotificationManagement import NotificationManagement
		self.service: NotificationService = service
		self.management: NotificationManagement = None
		self.session: AsyncDBSessionBase = None
		self.websocket: WebSocketManagement = self.service.websocket
		self.clientDict :Dict[str, AsyncServiceClient]= {}
  
	@SOCKET('/register/socket', hasDBSession=False)
	async def registerSocket(self, request, socket: Websocket, parameter=None):
		await self.websocket.register(request, socket)
		await socket.wait_for_connection_lost()
		print(201, request, id(request))
		print(201, socket, id(socket))
		return {'isSuccess': True}

	@POST('/benchmark', hasDBSession=False)
	async def benchmark(self, request, parameter):
		return {'isSuccess': True}

	@POST('/register/uid', hasDBSession=False)
	async def registerUID(self, request, parameter):
		registerUID = parameter['uid']
		socketID = parameter['socketID']
		for uid in registerUID:
			self.management.setSocketUID(socketID, uid)
		return {'isSuccess': True}

	@POST('/deregister/uid', hasDBSession=False)
	async def deregisterUID(self, request, parameter):
		deregisterUID = parameter['uid']
		socketID = parameter['socketID']
		for uid in deregisterUID:
			self.management.removeSocketUID(socketID, uid)
		return {'isSuccess': True}

	@POST('/count', hasDBSession=False)
	async def count(self, request, parameter):
		uid = parameter['uid']
		count = self.management.storage.count(uid)
		return {'isSuccess': True, 'count': count}

	@POST('/set', hasDBSession=False)
	async def set(self, request, parameter):
		uid = parameter['uid']
		level = parameter['level']
		type = parameter['type']
		info = parameter['info']
		item = NotificationItem(uid, level, type, info)
		await self.management.append(NotificationType.INTERNAL, item)
		return {'isSuccess': True}

	@POST('/set/module')
	async def setModule(self, request, parameter):
		await self.triggerModule(parameter)
		return {'isSuccess': True}

	@POST('/set/module/list')
	async def setModuleList(self, request, parameter):
		for i in parameter['notificationList']:
			await self.triggerModule(i)
		return {'isSuccess': True}

	@POST('/set/list', hasDBSession=False)
	async def setList(self, request, parameter):
		for i in parameter['notificationList']:
			uid = i['uid']
			level = i['level']
			type = i['type']
			info = i['info']
			item = NotificationItem(uid, level, type, info)
			await self.management.append(NotificationType.INTERNAL, item)
		return {'isSuccess': True}

	# TODO Revise
	@POST('/set/inter/process/list')
	async def setInterProcessList(self, request, parameter):
		for info in parameter['notificationList']:
			await self.triggerInterProcess(info)
		return {'isSuccess': True}

	# TODO Revise
	@POST('/set/inter/process')
	async def setInterProcess(self, request, parameter):
		uid = parameter['uid']
		level = parameter['level']
		type = parameter['type']
		info = parameter['info']
		service = info['service']
		url = info['service']

		if service not in self.clientDict and service in self.service.config:
			self.clientDict[service] = AsyncServiceClient(self.service.config['service'])
   
		self.clientDict[service].call(url, info)
		await self.triggerInterProcess(parameter['info'])
		return {'isSuccess': True}

	@POST('/set/asRead', hasDBSession=False)
	async def setAsRead(self, request, parameter):
		uid = parameter['uid']
		notificationIDList: List[int] = parameter['notificationIDList']
		self.management.setAsRead(NotificationType.INTERNAL, uid, notificationIDList)
		return {'isSuccess': True}

	@POST('/get/unread', hasDBSession=False)
	async def getUnread(self, request, parameter):
		uid = parameter['uid']
		startTime = parameter['startTime']
		unread = self.management.getUnread(NotificationType.INTERNAL, uid, startTime)
		return {'isSuccess': True, 'notification': [i.toDict() for i in unread]}

	@POST('/get/page', hasDBSession=False)
	async def getPage(self, request, parameter):
		uid = parameter['uid']
		page = parameter['page']
		perPage = parameter['perPage']
		storage = self.management.storageMap[NotificationType.INTERNAL]
		notificationList = storage.getPage(uid, page, perPage)
		notificationList = notificationList[::-1]
		return {'isSuccess': True, 'notification': [i.toDict() for i in notificationList]}

	@POST('/search', hasDBSession=False)
	async def search(self, request, paramnotificationListeter):
		uid = parameter['uid']
		level = int(parameter['level'])
		date = parameter['notifyTime']
		info = parameter['info']
		storage = self.management.storageMap[NotificationType.INTERNAL]
		notificationList = storage.search(uid, level, date, info)
		return {'isSuccess': True, 'notification': [i.toDict() for i in notificationList]}

	@POST('/get/current', hasDBSession=False)
	async def getCurrent(self, request, parameter):
		uid = parameter['uid']
		number = parameter['number']
		storage = self.management.storageMap[NotificationType.INTERNAL]
		notificationList = storage.getCurrent(uid, number)
		return {'isSuccess': True, 'notification': [i.toDict() for i in notificationList]}
	
	@POST('/trigger/user', hasDBSession=True)
	async def triggerUser(self, request, parameter) :
		await self.management.prepareUser(self.session)
		return {'isSuccess' : True}

	async def triggerInterProcess(self, info) :
		service = info['service']
		url = info['service']

		if service not in self.clientDict and service in self.service.config:
			self.clientDict[service] = AsyncServiceClient(self.service.config['service'])

		permissions : List[UserGroupPermission] = await self.session.select(
			UserGroupPermission,
			'WHERE module = ?',
			parameter=[service]
		)
		if len(permissions):
			clause = ','.join(list({str(permission.gid) for permission in permissions}))
			n = await self.session.count(User, f'WHERE gid IN ({clause})')
			for i in range(n) :
				self.clientDict[service].call(url, info)
	
	async def triggerModule(self, info) :
		level = info['level']
		type = info['type']
		info = info['info']
		module = info['module']
		if module in self.management.permissionDict:
			permissions = self.management.permissionDict[module]
			if len(permissions):
				for permission in permissions:
					for user in permission.users:
						item = NotificationItem(user.id, level, type, info)
						await self.management.append(NotificationType.INTERNAL, item)
		# permissions : List[UserGroupPermission]= await self.session.select(
		# 	UserGroupPermission, 'WHERE module = ?', parameter=[module]
		# )
		# if len(permissions):
		# 	clause = ','.join(list({str(permission.gid) for permission in permissions}))
		# 	users: List[User] = await self.session.select(
		# 		User, f'WHERE gid in ({clause})'
		# 	)