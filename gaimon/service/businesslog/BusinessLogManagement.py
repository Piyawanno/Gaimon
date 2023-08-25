from gaimon.service.businesslog.BusinessLogStorage import BusinessLogStorage

import os


class BusinessLogManagement:
	def __init__(self, resourcePath: str, entity: str):
		self.resourcePath = f'{resourcePath}/businesslog/Entity-{entity}'
		self.entity = entity
		self.storage = BusinessLogStorage(self.resourcePath)

	def __del__(self):
		self.storage.close()

	def checkPath(self):
		if not os.path.isdir(self.resourcePath):
			os.makedirs(self.resourcePath)
		self.storage.open()
