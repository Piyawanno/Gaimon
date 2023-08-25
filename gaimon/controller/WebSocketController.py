from gaimon.core.Route import SOCKET
from gaimon.core.WebSocketManagement import WebSocketManagement
from sanic import Request, Websocket

import asyncio


class WebSocketController:
	def __init__(self, application):
		from gaimon.core.AsyncApplication import AsyncApplication
		from gaimon.core.Authentication import Authentication
		self.application: AsyncApplication = application
		self.websocket = self.application.websocket
		self.taskList = []

	#NOTE : Permission set to guest and will be checked by WebSocketManagement.register.
	@SOCKET('/socket/register', role=['guest'], hasDBSession=False)
	async def registerSocket(self, request: Request, socket: Websocket):
		await self.websocket.register(request, socket)
		await socket.wait_for_connection_lost()
		print(">>> Connection is closed.")

	@SOCKET('/socket/preload', role=['guest'], hasDBSession=False)
	async def registerPreload(self, request: Request, socket: Websocket):
		task = asyncio.create_task(self.websocket.startReceiveLoop(request, socket))
		self.websocket.taskList.append(task)
		await socket.wait_for_connection_lost()
