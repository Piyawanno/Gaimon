from xerial.AsyncDBSessionPool import AsyncDBSessionPool
from xerial.Vendor import Vendor

from gaimon.util.FilterParameter import FilterParameter
from gaimon.core.AsyncServiceClient import AsyncServiceClient
from typing import List
from datetime import datetime

import os, asyncio, time, traceback


class ExportManagement:
	def __init__(self, config: dict, entity: str, sessionPool: AsyncDBSessionPool):
		self.config = config
		self.resourcePath = config['resourcePath']
		self.sleepTime = config['sleepTime']
		self.expireTime = config['expireTime']
		self.entity = entity
		self.itemQueue: List[FilterParameter] = []
		self.sessionPool = sessionPool
		self.notification = AsyncServiceClient(config['notification'])

	def checkPath(self):
		rootPath = f"{self.resourcePath}/export"
		if not os.path.isdir(rootPath): os.makedirs(rootPath)
		entityPath = f"{rootPath}/{self.entity}"
		if not os.path.isdir(entityPath): os.makedirs(entityPath)
		self.exportPath = entityPath

	def append(self, item: FilterParameter):
		now = datetime.now()
		modelName = item.modelClass.__name__
		path = f"{self.exportPath}/{modelName}-{now.strftime('%Y-%m-%d-%H%M')}.xlsx"
		self.itemQueue.append((item, path))
		return path

	async def startExport(self):
		while True:
			if len(self.itemQueue) == 0:
				await asyncio.sleep(self.sleepTime)
				continue
			self.clean()
			item, path = self.itemQueue.pop(0)
			try:
				session = await self.sessionPool.getSession()
				if self.entity != 'main' and session.vendor == Vendor.POSTGRESQL:
					session.setSchema(self.entity)
				modelClass = item.modelClass
				if modelClass is not None:
					await session.selectExcel(
						path,
						modelClass,
						item.clause,
						limit=item.limit,
						offset=item.offset,
						parameter=item.parameter
					)
					print(f'>>> {path} is stored.')
				# TODO send export notification
				await self.sessionPool.release(session)
			except:
				# TODO send error notification.
				print(traceback.format_exc())

	def clean(self):
		now = time.time()
		for i in os.listdir(self.exportPath):
			path = f'{self.exportPath}/{i}'
			mtime = os.path.getmtime(path)
			if now - mtime > self.expireTime:
				os.unlink(path)
				print(f'>>> {path} is removed.')
