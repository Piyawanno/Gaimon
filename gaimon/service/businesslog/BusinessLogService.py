from gaimon.core.AsyncService import AsyncService

from gaimon.service.businesslog.BusinessLogManagement import BusinessLogManagement
from gaimon.service.businesslog.BusinessLogHandler import BusinessLogHandler

from typing import Dict

import logging, os


class BusinessLogService(AsyncService):
	def setHandler(self):
		self.appendHandler(BusinessLogHandler)
		self.managementMap: Dict[str, BusinessLogManagement] = {}

	async def prepareHandler(self, handler, request, parameter, hasDBSession):
		entity: str = 'main' if parameter is None else parameter.get('entity', 'main')
		management = self.managementMap.get(entity, None)
		if management is None:
			management = BusinessLogManagement(self.resourcePath, entity)
			management.checkPath()
			self.managementMap[entity] = management
		handler.management = management

	async def prepare(self):
		pass

	async def load(self):
		pass

	async def close(self):
		pass

	def loadManagement(self):
		resourcePath = f"{self.resourcePath}/notification"
		for i in os.listdir(resourcePath):
			path = f"{resourcePath}/{i}"
			if i[:7] == 'Entity-' and os.path.isdir(path):
				entity = i[7:]
				logging.info(f">>> Loading management {entity}")
				management = BusinessLogManagement(self.resourcePath, entity)
				management.checkPath()
				self.managementMap[entity] = management
