from xerial.AsyncDBSessionPool import AsyncDBSessionPool

from gaimon.core.AsyncService import AsyncService
from gaimon.service.export.ExportHandler import ExportHandler
from gaimon.service.export.ExportManagement import ExportManagement

from typing import Dict

import gaimon.model as GaimonModel
import os, logging, importlib


class ExportService(AsyncService):
	def setHandler(self):
		self.appendHandler(ExportHandler)
		self.resourcePath = self.config['resourcePath']
		self.managementMap: Dict[str, ExportManagement] = {}
		self.taskList = []

	async def connect(self):
		self.config["DB"]["connectionNumber"] = self.config.get("DBConnectionNumber", 2)
		self.sessionPool = AsyncDBSessionPool(self.config["DB"])
		logging.info(">>> Connecting Database")
		await self.sessionPool.createConnection()
		self.session = await self.sessionPool.getSession()
		await AsyncDBSessionPool.browseModel(self.session, GaimonModel)
		for extensionPath in self.config['extension']:
			module = importlib.import_module(extensionPath)
			path = module.__path__[0]
			if os.path.isdir(f"{path}/model"):
				model = importlib.import_module(f'{extensionPath}.model')
				await AsyncDBSessionPool.browseModel(self.session, model)
		await self.session.createTable()
		self.session.checkModelLinking()
		self.modelMap = self.session.model
		await self.sessionPool.release(self.session)

	def initLoop(self, loop):
		self.loop = loop
		for management in self.managementMap.values():
			self.taskList.append(loop.create_task(management.startExport()))

	async def prepareHandler(self, handler, request, parameter, hasDBSession):
		entity: str = 'main' if parameter is None else parameter.get('entity', 'main')
		management = self.managementMap.get(entity, None)
		if management is None:
			management = ExportManagement(self.config, entity, self.sessionPool)
			management.checkPath()
			self.taskList.append(self.loop.create_task(management.startExport()))
			self.managementMap[entity] = management
		handler.management = management
		handler.modelMap = self.modelMap

	async def prepare(self):
		pass

	async def load(self):
		await self.connect()

	async def close(self):
		for task in self.taskList:
			task.done()
