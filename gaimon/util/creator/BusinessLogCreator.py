from gaimon.core.AsyncServiceClient import AsyncServiceClient
from gaimon.model.PermissionType import PermissionType
from gaimon.service.businesslog.BusinessLogItem import BusinessLogItem

from typing import List

import time


class BusinessLogCreator:
	def __init__(self, config):
		self.config = config
		self.client = AsyncServiceClient(config)

	def generateLog(self, n: int) -> List[BusinessLogItem]:
		generated = []
		for i in range(n):
			log = BusinessLogItem()
			log.modelName = 'StockItemType'
			log.ID = i + 1
			log.uid = 1
			log.operation = PermissionType.WRITE
			# NOTE This should be input data.
			log.data = {}
			log.operationTime = time.time()
			generated.append(log)
		return generated

	async def send(self, logList: List[BusinessLogItem]):
		for log in logList:
			result = await self.client.call('/append', log.toDict())
			if not result['isSuccess']:
				print(result)
				break

	async def fetch(self) -> List[BusinessLogItem]:
		data = {'modelName': 'StockItemType', 'ID': 1}
		result = await self.client.call('/getByRecordID', data)
		print(result)
		if result['isSuccess']:
			return [BusinessLogItem().fromDict(i) for i in result['result']]
		else:
			return []


if __name__ == '__main__':
	import json, asyncio
	with open('/etc/gaimon/BusinessLog.json', encoding="utf-8") as fd:
		config = json.load(fd)

	creator = BusinessLogCreator(config)
	logList = creator.generateLog(4)
	asyncio.run(creator.send(logList))
	asyncio.run(creator.fetch())
