from gaimon.core.AsyncServiceClient import AsyncServiceClient
from typing import List, Dict


class EntityBaseServiceClient:
	def __init__(self, config: dict):
		self.config = config

	def create(self):
		self.clientMap: Dict[int, AsyncServiceClient] = {}
		self.clientList: List[AsyncServiceClient] = []
		self.total = len(self.config)
		for i in self.config:
			client = AsyncServiceClient(i)
			self.clientList.append(client)
			self.clientMap[i['ID']] = client

	async def call(self, entity: str, route: str, parameter: dict):
		parameter['entity'] = entity
		hashed = entity.__hash__()
		ID = hashed % self.total
		client = self.clientMap[ID]
		return await client.call(route, parameter)
