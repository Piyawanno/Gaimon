from gaimon.core.AsyncPushServiceClient import AsyncPushServiceClient
from gaimon.service.monitor.MonitorData import MonitorData
from gaimon.service.monitor.MonitorIntervalType import MonitorIntervalType as Type

import asyncio


class MonitorClient:
	def __init__(self, name: str, config: dict):
		self.name = name
		self.config = config
		self.sleepTime = config['updateRate']
		self.data = MonitorData()
		self.client = AsyncPushServiceClient(config)
		self.isConnected = False

	async def connect(self):
		if not self.isConnected or not self.client.isConnected:
			future = asyncio.Future()
			asyncio.create_task(self.client.connect('/register/socket', {}, future))
			await future
			self.isConnected = True

	async def startLoop(self):
		await self.connect()
		while True:
			await asyncio.sleep(self.sleepTime)
			await self.add()

	async def add(self):
		await self.connect()
		self.data.getData()
		parameter = {'name': self.name, 'data': self.data.toDict()}
		return await self.client.call('/add', parameter=parameter)

	async def get(self, name: str, type: Type):
		await self.connect()
		parameter = {'name': name, 'type': type.value}
		return await self.client.call('/get', parameter=parameter)

	async def getByType(self, type: Type):
		await self.connect()
		parameter = {'type': type.value}
		return await self.client.call('/getByType', parameter=parameter)

	async def getAll(self):
		await self.connect()
		return await self.client.call('/getAll', parameter={})


if __name__ == '__main__':
	from gaimon.util.ProcessUtil import readConfig

	async def run():
		name = "GaimonApplication.0"
		config = readConfig(['ServiceMonitor.json'], {})
		client = MonitorClient(name, config)
		await client.connect()
		result = await client.get(name, Type.HOUR)
		print(result)
		result = await client.getByType(Type.HOUR)
		print(result)
		result = await client.getAll()
		print(result)

	asyncio.run(run())
