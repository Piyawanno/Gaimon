from gaimon.core.AsyncApplication import AsyncApplication
from gaimon.util.ProcessUtil import readConfig
import os, gaimon.model, sys

class GaimonApplication (AsyncApplication) :
	def __init__(self, config:dict, namespace:str) :
		self.controllerPath = 'gaimon.controller'
		AsyncApplication.__init__(self, config, namespace, False)
		self.rootPath = os.path.dirname(__file__)
		self.modelModule = "gaimon.model"

	def loadController(self):
		super().loadController()
		directory = f"{self.rootPath}/controller/static"
		modulePath = "gaimon.controller.static"
		static = self.browseController(directory, modulePath)
		self.browsePermission(directory, modulePath)
		self.browsePreProcessor(directory, modulePath)
		self.browsePostProcessor(directory, modulePath)
		self.browseWebSocket(directory, modulePath)
		self.map(static)
		self.controller.extend(static)

	async def load(self) :
		await super().load()

def readGaimonConfig(namespace:str) :
	return readConfig(
		['Gaimon.json'],
		{
			'DB': 'Database.json',
			'redis': 'Redis.json',
			'notification' : 'Notification.json',
			'businessLog' : 'BusinessLog.json',
			'monitor' : 'ServiceMonitor.json',
		},
		namespace
	)