from gaimon.core.WebSocketHandler import WebSocketHandler
from gaimon.core.WebSocketManagement import WebSocketManagement
from gaimon.core.WebSocketMode import WebSocketMode
from gaimon.core.WebSocketRoute import ROUTE
from sanic import Request, Websocket
from typing import List, Dict

import json, time, asyncio


@ROUTE("/benchmark", ['user'])
class BenchmarkPushHandler(WebSocketHandler):
	def __init__(self, application):
		super().__init__(application)
		self.socketID = 1
		self.socketList = []
		self.taskList = []

	async def startLoop(self):
		dumped = json.dumps({
			'isSuccess': True,
			'mode': WebSocketMode.PUSH.value,
			'route': self.__ROUTE__.rule,
			"result": "Nothing"
		})
		while True:
			socketList = self.socketList
			alive = []
			for socket in socketList:
				if WebSocketManagement.isClose(socket):
					continue
				start = time.time()
				n = 10_000
				for i in range(n):
					await socket.send(dumped)
				end = time.time()
				alive.append(socket)
				print(f">>> Push Benchmark Elapsed : {end-start}s ({n/(end-start)}r/s)")
			self.socketList = alive
			await asyncio.sleep(10.0)

	async def setParameter(self, socket: Websocket, parameter: dict):
		print(f">>> Receive {socket.ID} {parameter}")

	async def removeSocket(self, socket: Websocket):
		if socket in self.socketList:
			self.socketList.remove(socket)
		print(
			f">>> Socket removed {socket.ID} {len(self.socketList)} {len(self.socketMap)}"
		)

	async def register(self, request: Request, socket: Websocket, parameter: dict):
		self.socketList.append(socket)
		return None
