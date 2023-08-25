from gaimon.core.Route import POST, SOCKET
from gaimon.core.WebSocketManagement import WebSocketManagement
from gaimon.service.monitor.MonitorData import MonitorData
from gaimon.service.monitor.MonitorIntervalType import MonitorIntervalType

from sanic import Websocket

from typing import List


class MonitorHandler:
	def __init__(self, service):
		from gaimon.service.monitor.MonitorService import MonitorService
		from gaimon.service.monitor.MonitorManagement import MonitorManagement
		self.service: MonitorService = service
		self.management: MonitorManagement = None
		self.websocket: WebSocketManagement = self.service.websocket

	@SOCKET('/register/socket')
	async def registerSocket(self, request, socket: Websocket, parameter=None):
		await self.websocket.register(request, socket)
		await socket.wait_for_connection_lost()
		return {'isSuccess': True}

	@POST('/add')
	async def add(self, request, parameter):
		name = parameter['name']
		data = parameter['data']
		self.management.add(name, MonitorData().fromDict(data))
		return {'isSuccess': True}

	@POST('/get')
	async def get(self, request, parameter):
		name = parameter['name']
		type = MonitorIntervalType(parameter['type'])
		dataList = self.management.get(name, type)
		return {'isSuccess': True, 'data': [i.toDict() for i in dataList]}

	@POST('/getByType')
	async def getByType(self, request, parameter):
		type = MonitorIntervalType(parameter['type'])
		dataMap = self.management.getByType(type)
		result = {}
		for name, dataList in dataMap.items():
			result[name] = [i.toDict() for i in dataList]

		return {'isSuccess': True, 'data': result}

	@POST('/getAll')
	async def getAll(self, request, parameter):
		result = {}
		for name, typeMap in self.management.serviceMap.items():
			result[name] = {}
			for type, item in typeMap.items():
				result[name][type] = [i.toDict() for i in item.dataList]
		return {'isSuccess': True, 'data': result}
