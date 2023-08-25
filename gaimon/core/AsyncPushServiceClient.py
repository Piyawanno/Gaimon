from gaimon.core.ServiceClient import ServiceClient
from gaimon.core.WebSocketMode import WebSocketMode
from gaimon.core.AsyncServiceClient import AsyncServiceClient
from sanic import Websocket
from typing import Dict

import aiohttp, json, asyncio, traceback


class AsyncPushServiceClient(ServiceClient):
	def __init__(self, config: dict):
		self.config = config
		isWSS = config.get('isWSS', False)
		if isWSS:
			self.rootURL = f"wss://{config['host']}/"
		else:
			self.rootURL = f"ws://{config['host']}:{config['port']}/"
		user = config.get('user', None)
		password = config.get('password', None)
		if user is None:
			self.isCheckPermission = False
		else:
			self.user = user
			self.password = password.encode()
			self.isCheckPermission = True
		self.pushRoutine = {}
		self.registerRoutine = {}
		self.route = None
		self.resolveID = 1
		self.requestMap: Dict[int, asyncio.Future] = {}
		self.isConnected = False

	async def connect(
		self,
		route: str,
		parameter: dict = None,
		future: asyncio.Future = None
	):
		self.route = route
		url = self.rootURL + route[1:]
		if self.isCheckPermission:
			body = self.getPermissionPayLoad({parameter})
		else:
			body = {'parameter': parameter}
		body['mode'] = WebSocketMode.REGISTER.value

		async with aiohttp.ClientSession() as session:
			async with session.ws_connect(url) as client:
				await asyncio.sleep(1.0)
				self.client = client
				self.isConnected = True
				await client.send_json(body)
				if future is not None:
					future.set_result(True)
				async for message in client:
					if message.type == aiohttp.WSMsgType.TEXT:
						await self.handleData(message.data)
					elif message.type == aiohttp.WSMsgType.ERROR:
						print(f"*** Push Error {message.data}")
						break
			self.isConnected = False

	async def call(self, route, parameter=None, method='POST') -> asyncio.Future:
		future = asyncio.Future()
		resolveID = self.resolveID
		self.requestMap[resolveID] = future
		self.resolveID += 1
		request = {
			'mode': WebSocketMode.REQUEST.value,
			'route': route,
			'resolveID': resolveID,
			'parameter': parameter,
			'method': method,
		}
		await self.client.send_json(request)
		return await future

	async def handleData(self, raw: str):
		try:
			data = json.loads(raw)
			mode = data['mode']
			if mode == WebSocketMode.REGISTER.value:
				for route, result in data['result'].items():
					routine = self.registerRoutine.get(route, None)
					if routine is not None:
						await routine(result)
			elif mode == WebSocketMode.REQUEST.value:
				resolveID = data['resolveID']
				future = self.requestMap.get(resolveID, None)
				if future is not None:
					if data['isSuccess']:
						future.set_result(data['result'])
					else:
						future.set_exception(RuntimeError(data['message']))
					del self.requestMap[resolveID]
			elif mode == WebSocketMode.PUSH.value:
				route = data['route']
				routine = self.pushRoutine.get(route, None)
				if routine is not None:
					await routine(data['result'])
		except:
			print(traceback.format_exc())


def createServiceCall(pull: AsyncServiceClient, push: AsyncPushServiceClient):
	async def callService(route, parameter):
		if push is not None and push.isConnected:
			return await push.call(route, parameter)
		else:
			return await pull.call(route, parameter)

	return callService
