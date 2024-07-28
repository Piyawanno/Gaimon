from gaimon.util.ServiceCLI import ServiceCLI
from gaimon.util.ProcessUtil import readConfig

import sys

def run(): GaimonNotificationCLI().run(sys.argv[1:])

class GaimonNotificationCLI (ServiceCLI):
	def __init__(self):
		from gaimon.service.notification.NotificationService import NotificationService
		self.description = "Gaimon Notification server."
		self.serviceClass = NotificationService
		self.serviceName = 'gaimon-notification'
		ServiceCLI.__init__(self)
	
	def getConfig(self, namespace: str):
		config = GaimonNotificationCLI.readConfig(namespace)
		return config

	@staticmethod
	def readConfig(namespace: str):
		config = readConfig(
			['Gaimon.json', 'Notification.json'],
			{
				'DB' : 'Database.json'
			},
			namespace
		)
		config['processNumber'] = 1
		return config

if __name__ == '__main__': run()
