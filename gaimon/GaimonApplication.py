from gaimon.core.AsyncApplication import AsyncApplication
from gaimon.core.LogFlusher import LogFlusher
from gaimon.util.ProcessUtil import readConfig
from sanic import Sanic

import os

class GaimonApplication (AsyncApplication) :
	def __init__(self, config: dict, namespace: str) :
		AsyncApplication.__init__(self, config, namespace, False)
		self.rootPath = os.path.dirname(__file__)
		self.config['extension'].insert(0, 'gaimon')
		

def readGaimonConfig(namespace:str) :
	config = readConfig(
		['Gaimon.json'],
		{
			'DB': 'Database.json',
			'redis': 'Redis.json',
			'notification' : 'Notification.json',
			'businessLog' : 'BusinessLog.json',
			'monitor' : 'ServiceMonitor.json',
			'additionExtension' : 'Extension.json',
		},
		namespace
	)
	extension = config.get('additionExtension', None)
	if extension is not None :
		config['extension'].extend(extension)
	return config