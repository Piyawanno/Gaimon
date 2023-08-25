from xerial.FilterOperation import FilterOperation
from gaimon.core.AsyncServiceClient import AsyncServiceClient
from gaimon.util.ProcessUtil import readConfig

import asyncio


class ExportTest:
	def __init__(self, config):
		self.config = config
		self.client = AsyncServiceClient(config)

	async def run(self):
		parameter = {
			'modelName':
			'Subdistrict',
			'limit':
			None,
			'offset':
			None,
			'filter': [{
				'column': 'zipcode',
				'operation': FilterOperation.EQUAL,
				'value': '10160',
			}],
		}
		result = await self.client.call('/export', parameter)
		print(result)


if __name__ == '__main__':
	config = readConfig(['Export.json'], {})
	test = ExportTest(config)
	asyncio.run(test.run())
