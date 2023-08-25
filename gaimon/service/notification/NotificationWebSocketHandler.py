from gaimon.core.WebSocketHandler import WebSocketHandler
from gaimon.core.WebSocketRoute import ROUTE
from gaimon.service.notification.NotificationManagement import NotificationManagement

from sanic import Request, Websocket


@ROUTE('/notification', role=['guest'])
class NotificationWebSocketHandler(WebSocketHandler):
	def __init__(self, application):
		from gaimon.service.notification.NotificationService import NotificationService
		self.application: NotificationService = application

	async def startLoop(self):
		pass

	async def register(self, request: Request, socket: Websocket, parameter: dict):
		entity = parameter.get('entity', 'main')
		management: NotificationManagement = self.application.managementMap.get(
			entity,
			None
		)
		if management is None:
			raise RuntimeError(f'Entity {entity} cannot be found.')
		else:
			socket.ID = management.appendSocket(socket)
			socket.uidList = []
			socket.management = management
			return {'socketID': socket.ID}

	async def setParameter(self, socket: Websocket, parameter: dict):
		pass

	async def removeSocket(self, socket: Websocket):
		if hasattr(socket, 'management') and hasattr(socket, 'uidList'):
			management: NotificationManagement = socket.management
			for uid in socket.uidList:
				management.removeSocket(uid, socket)
