from xerial.AsyncDBSessionPool import AsyncDBSessionPool
from xerial.AsyncDBSessionBase import AsyncDBSessionBase
from typing import List

import json

class DBPoolLoader :
	def __init__(self, config:dict = None):
		self.config = config
	
	def loadConfig(self) :
		from gaimon.core.AsyncApplication import CONFIG_ROOT
		path = f'{CONFIG_ROOT}/Database.json'
		with open(path) as fd :
			self.config = json.load(fd)
	
	async def prepare(self, modelModuleList: List[type]):
		if self.config is None :
			self.loadConfig()
		self.pool = AsyncDBSessionPool(self.config)
		await self.pool.createConnection()
		session = await self.pool.getSession()
		for i in modelModuleList:
			await AsyncDBSessionPool.browseModel(session, i)
		await session.createTable()
		session.checkModelLinking()
		await self.pool.release(session)
	
	async def getSession(self, entity: str) -> AsyncDBSessionBase:
		return await self.pool.getSession()
	
	async def releaseSession(self, session: AsyncDBSessionBase, entity: str) :
		return await self.pool.release(session)