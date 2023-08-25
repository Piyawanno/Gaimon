from gaimon.core.AsyncService import AsyncService
from gaimon.core.WebSocketManagement import WebSocketManagement
from gaimon.service.monitor.MonitorHandler import MonitorHandler
from gaimon.service.monitor.MonitorManagement import MonitorManagement

from typing import Dict


class MonitorService(AsyncService):
	def setHandler(self):
		self.management = MonitorManagement(self.config)
		self.websocket = WebSocketManagement(self)
		self.appendHandler(MonitorHandler)
		self.taskList = []

	async def connect(self):
		pass

	def initLoop(self, loop):
		self.loop = loop

	async def prepareHandler(self, handler, request, parameter, hasDBSession):
		handler.management = self.management

	async def prepare(self):
		pass

	async def load(self):
		await self.connect()

	async def close(self):
		for task in self.taskList:
			task.done()
