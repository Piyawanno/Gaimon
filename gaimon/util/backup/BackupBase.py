from xerial.AsyncDBSessionPool import AsyncDBSessionPool

import gaimon.model as GaimonModel
import logging, importlib, os

class BackupBase:
	async def connect(self, entity: str):
		self.sessionPool = AsyncDBSessionPool(self.config["DB"])
		logging.info(">>> Connecting Database")
		await self.sessionPool.createConnection()
		self.session = await self.sessionPool.getSession()
		# if len(entity) and self.config['vendor'] == Vendor.POSTGRESQL:
		# 	self.session.setSchema(entity)
		await AsyncDBSessionPool.browseModel(self.session, GaimonModel)
		for extensionPath in self.config['extension']:
			await self.loadModel(extensionPath)
		await self.session.createTable()
		self.session.checkModelLinking()

	async def close(self):
		logging.info(">>> Database Connection Close")
		await self.sessionPool.release(self.session)
		await self.sessionPool.close()

	async def loadModel(self, extensionPath: str):
		module = importlib.import_module(extensionPath)
		path = module.__path__[0]
		if os.path.isdir(f"{path}/model"):
			model = importlib.import_module(f'{extensionPath}.model')
			await AsyncDBSessionPool.browseModel(self.session, model)
