from gaimon.core.WebSocketHandler import WebSocketHandler
from gaimon.core.WebSocketMode import WebSocketMode
from gaimon.core.WebSocketRequest import WebSocketRequest

from sanic import Request, Websocket
from typing import Dict, List
from websockets.connection import CLOSED, CLOSING

import traceback, json, asyncio

CLOSE_STATE = {CLOSED, CLOSING}


class WebSocketManagement:
	def __init__(self, application):
		from gaimon.core.AsyncApplication import AsyncApplication
		from gaimon.core.AsyncService import AsyncService
		self.application: AsyncApplication = application
		self.isService = isinstance(application, AsyncService)
		self.handlerMap: Dict[str, WebSocketHandler] = {}
		self.taskList: List[asyncio.Task] = []
		self.socketID = 1

	def startLoop(self):
		for handler in self.handlerMap.values():
			task = asyncio.create_task(handler.startLoop())
			self.taskList.append(task)

	def stopTask(self):
		for task in self.taskList:
			if not task.done():
				task.cancel()

	@staticmethod
	def isClose(socket: Websocket) -> bool:
		return socket.connection.state in CLOSE_STATE

	def appendHandler(self, handler: WebSocketHandler):
		route = handler.__ROUTE__
		self.handlerMap[route.rule] = handler

	def isAllowed(self, handler: WebSocketHandler, request: Request):
		route = handler.__ROUTE__
		handlerRole = set(route.role)
		if 'guest' in handlerRole: return True
		if 'role' not in request.ctx.session: return False
		requestRole = set(request.ctx.session['role'])
		if 'root' in requestRole: return True
		if len(requestRole.intersection(handlerRole)): return True
		else: return False

	async def register(self, request: Request, socket: Websocket):
		received = await socket.recv()
		registration = json.loads(received)
		result = {}
		socket.ID = self.socketID
		self.socketID += 1
		for route, parameter in registration['parameter'].items():
			handler = self.handlerMap.get(route, None)
			if handler is None:
				result[route] = {
					"isSuccess": False,
					"message": f"Registered route {route} cannot be found."
				}
				continue
			if not self.isAllowed(handler, request):
				result[route] = {
					"isSuccess": False,
					"message": f"Route {route} denies permission."
				}
				continue
			try:
				registerResult = await handler.register(request, socket, parameter)
				result[route] = {"isSuccess": True, "result": registerResult, }
			except:
				print(traceback.format_exc())
				print("*** Error by register WebSocket")
				result[route] = {"isSuccess": False, "message": 'Internal Error', }

		task = asyncio.create_task(self.startReceiveLoop(request, socket))
		self.taskList.append(task)
		await socket.send(
			json.dumps({
				'mode': WebSocketMode.REGISTER.value,
				'result': result
			})
		)

	async def startReceiveLoop(self, request: Request, socket: Websocket):
		while True:
			if WebSocketManagement.isClose(socket):
				for handler in self.handlerMap.values():
					handler.removeSocket(socket)
				break
			received = await socket.recv()
			data = json.loads(received)
			if data['mode'] == WebSocketMode.PARAMETER.value:
				route = data.get('route', None)
				if route is None: continue
				handler = self.handlerMap.get(route, None)
				if handler is None: continue
				await handler.setParameter(socket, data['parameter'])
			elif data['mode'] == WebSocketMode.REQUEST.value:
				try:
					if self.isService:
						await self.handleServiceRequest(request, socket, data)
					else:
						await self.handleRequest(request, socket, data)
				except:
					await socket.send(
						json.dumps({
							'isSuccess': False,
							'mode': WebSocketMode.REQUEST.value,
							'route': data['route'],
							'resolveID': data['resolveID'],
							'message': 'Internal Error'
						})
					)
					print(traceback.format_exc())

	async def handleRequest(self, request: Request, socket: Websocket, requestParameter):
		route = requestParameter['route']
		resolveID = requestParameter['resolveID']
		method = requestParameter['method']
		uid = request.ctx.session['uid']
		websocketRequest = WebSocketRequest(
			request,
			requestParameter.get('parameter',
									None)
		)
		routed, handler, parameter = self.application.application.router.get(
			route, method, None
		)
		response = {
			'mode': WebSocketMode.REQUEST.value,
			'route': route,
			'resolveID': resolveID,
		}
		if not self.isAllowed(handler.__self__.callee, request):
			response['isSuccess'] = False
			response['message'] = "Permission Denied"
			await socket.send(json.dumps(response))

		result = await handler.__self__.runWebSocket(websocketRequest, uid, **parameter)
		if result.status == 200:
			response['isSuccess'] = True
			if result.content_type == 'application/json':
				response['result'] = json.loads(result.body.decode())
			else:
				response['result'] = result.body.decode()
		else:
			response['isSuccess'] = False
			response['message'] = result.body.decode()
		await socket.send(json.dumps(response))

	async def handleServiceRequest(
		self,
		request: Request,
		socket: Websocket,
		requestParameter
	):
		route = requestParameter['route']
		resolveID = requestParameter['resolveID']
		method = requestParameter['method']
		websocketRequest = WebSocketRequest(request, requestParameter['parameter'])
		routed, handler, parameter = self.application.application.router.get(
			route, method, None
		)
		response = {
			'mode': WebSocketMode.REQUEST.value,
			'route': route,
			'resolveID': resolveID,
		}
		result = await handler.__self__.runWebSocket(
			websocketRequest,
			requestParameter['parameter'],
			**parameter
		)
		response['isSuccess'] = True
		response['result'] = result
		await socket.send(json.dumps(response))
