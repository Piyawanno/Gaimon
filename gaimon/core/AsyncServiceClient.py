from gaimon.core.RESTResponse import RESTResponse
from gaimon.core.ServiceClient import ServiceClient

import aiohttp, json


class AsyncServiceClient(ServiceClient):
	async def call(self, route, parameter=None, payload=None, headers=None):
		headers = {} if headers is None else headers
		url = self.rootURL + route[1:]
		if self.isCheckPermission:
			body = self.getPermissionPayLoad(parameter)
		else:
			body = {'parameter': parameter} if payload is None else payload
		result = await self.request(url, headers, body)
		return result

	async def request(self, url: str, headers: dict, data):
		self.timeOut = self.config.get('timeOut', 60)
		timeout = aiohttp.ClientTimeout(total=self.timeOut)
		async with aiohttp.ClientSession(timeout=timeout) as session:
			async with session.post(url, headers=headers, json=data) as response:
				return await response.json()
