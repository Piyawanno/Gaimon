from sanic import Request, Websocket


class WebSocketHandler:
	def __init__(self, application):
		from gaimon.core.AsyncApplication import AsyncApplication
		self.application: AsyncApplication = application

	async def startLoop(self):
		raise NotImplementedError

	async def register(self, request: Request, socket: Websocket, parameter: dict):
		raise NotImplementedError

	async def setParameter(self, socket: Websocket, parameter: dict):
		raise NotImplementedError

	async def removeSocket(self, socketID: int, socket: Websocket):
		raise NotADirectoryError
