from gaimon.core.WebSocketHandler import WebSocketHandler
from gaimon.core.WebSocketMode import WebSocketMode
from gaimon.core.WebSocketManagement import WebSocketManagement
from gaimon.core.AsyncPushServiceClient import AsyncPushServiceClient
from gaimon.core.WebSocketRoute import ROUTE
from sanic import Request, Websocket
from typing import List, Dict

import json, asyncio, time, logging


@ROUTE("/notification", ['user'])
class NotificationPushHandler(WebSocketHandler):
	def __init__(self, application):
		super().__init__(application)
		# UID => SocketID => Socket
		self.socketMap: Dict[int, Dict[int, Websocket]] = {}
		self.socketUIDMap = {}
		self.serverID = None
		self.registeredUID = []
		self.push = self.application.createPushNotificationClient()

	async def startLoop(self):
		route = '/notification'
		while True:
			try:
				self.push.pushRoutine[route] = self.handlePush
				self.push.registerRoutine[route] = self.handleRegister
				future = asyncio.Future()
				await self.push.connect('/register/socket', {route: {'entity': 'main'}}, future)
				await future
				self.serverID = None
			except:
				logging.info(">>> Try to reconnect")
			await asyncio.sleep(5.0)
			self.recheckUID()

	def recheckUID(self):
		recheckedUID = set()
		for uid, socketMap in self.socketMap.items():
			for socket in socketMap.values():
				if not WebSocketManagement.isClose(socket):
					recheckedUID.add(uid)
					break
		self.registeredUID = list(recheckedUID)

	async def benchmarkWebSocket(self):
		taskList: List[asyncio.Task] = []
		logging.info(">>> Starting Request Benchmark")
		r = 100_000
		m = 16
		n = r * m

		async def runRequest():
			for i in range(r):
				await self.push.call('/benchmark')

		start = time.time()
		for i in range(m):
			task = asyncio.create_task(runRequest())
			taskList.append(task)

		for task in taskList:
			await task

		elapsed = time.time() - start
		logging.info(
			f">>> Request Benchmark (WebSocket) Elapsed {elapsed:.3f}s {(n/elapsed):.3f} r/s"
		)

	async def benchmarkHTTP(self):
		taskList: List[asyncio.Task] = []
		logging.info(">>> Starting Request Benchmark")
		r = 1_000
		m = 16
		n = r * m
		client = self.application.createNotificationClient()

		async def runRequest():
			for i in range(r):
				result = await client.call('/benchmark')

		start = time.time()
		for i in range(m):
			task = asyncio.create_task(runRequest())
			taskList.append(task)

		for task in taskList:
			await task

		elapsed = time.time() - start
		logging.info(
			f">>> Request Benchmark (HTTP) Elapsed {elapsed:.3f}s {(n/elapsed):.3f} r/s"
		)

	async def handleRegister(self, response: dict):
		logging.info(f">>> Register Notification Socket {str(response)}")
		self.serverID = response['result']['socketID']
		await self.registerUID()

	async def registerUID(self):
		if self.serverID is not None and len(self.registeredUID):
			registeredUID = self.registeredUID
			self.registeredUID = []
			await self.push.call(
				'/register/uid',
				{
					'uid': registeredUID,
					'socketID': self.serverID
				}
			)

	async def handlePush(self, response: dict):
		uid = response['uid']
		socketMap = self.socketMap.get(uid, None)
		if socketMap is None: return
		alive = {}
		for socketID, socket in socketMap.items():
			if WebSocketManagement.isClose(socket):
				logging.info(">>> Remove closed socket")
				self.removeSocket(socket)
				continue
			result = {
				'isSuccess': True,
				'mode': WebSocketMode.PUSH.value,
				'route': self.__ROUTE__.rule,
				'result': response
			}
			await socket.send(json.dumps(result))
			alive[socketID] = socket
		self.socketMap[uid] = alive

	async def setParameter(self, socket: Websocket, parameter: dict):
		pass

	async def removeSocket(self, socket: Websocket):
		uid = self.socketUIDMap.get(socket.ID, None)
		if uid is None: return
		if self.push.isConnected:
			await self.push.call(
				'/deregister/uid',
				{
					'socketID': self.serverID,
					'uid': [uid]
				}
			)
		del self.socketUIDMap[socket.ID]
		socketMap = self.socketMap.get(uid, None)
		if socket.ID in socketMap: del socketMap[socket.ID]

	async def register(self, request: Request, socket: Websocket, parameter: dict):
		socketID = socket.ID
		uid = request.ctx.session['uid']
		self.socketUIDMap[socketID] = uid
		socketMap = self.socketMap.get(uid, {})
		if len(socketMap) == 0: self.socketMap[uid] = socketMap
		socketMap[socketID] = socket
		if not self.push.isConnected or self.push.client.closed:
			self.serverID = None
		self.registeredUID.append(uid)
		await self.registerUID()
		return None
