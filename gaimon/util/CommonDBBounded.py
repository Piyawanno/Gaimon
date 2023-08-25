from xerial.AsyncDBSessionPool import AsyncDBSessionPool
import gaimon.model


class CommonDBBounded:
	def __init__(self, config):
		self.config = config
		self.modelList = [gaimon.model]

	async def connectDB(self):
		self.sessionPool = AsyncDBSessionPool(self.config["DB"])
		print(">>> Connecting Database")
		await self.sessionPool.createConnection()
		self.session = await self.sessionPool.getSession()
		for model in self.modelList:
			await AsyncDBSessionPool.browseModel(self.session, model)
		await self.session.createTable()
		self.model = self.session.model.copy()
		self.sessionPool.model = self.model.copy()
