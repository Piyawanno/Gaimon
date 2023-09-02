from gaimon.core.Route import GET
from gaimon.util.PathUtil import conform
from gaimon.core.RESTResponse import RESTResponse
from sanic import response

import os, mimetypes

__MAX_SIZE__ = 100*1024
__CACHE__ = {}
class StaticController:
	def __init__(self, application):
		from gaimon.core.AsyncApplication import AsyncApplication
		from gaimon.core.ThemeHandler import ThemeHandler
		self.application: AsyncApplication = application
		self.theme: ThemeHandler = self.application.theme
		self.resourcePath:str = self.application.resourcePath

	@GET('/share/<path:path>', role=['guest'], hasDBSession=False)
	async def getStatic(self, request, path):
		cached = __CACHE__.get(path, None)
		if cached is not None :
			return response.raw(cached['content'], content_type=cached['type'])
		regularPath = conform(f"{self.resourcePath}/share/{path}")
		if not os.path.isfile(regularPath) :
			regularPath = conform(f"{self.resourcePath}/upload/{path}")
		if self.theme.theme is None:
			if os.path.isfile(regularPath):
				return await self.response(regularPath)
			return response.text('NOT FOUND', status=404)
		if path[:3] == 'js/':
			return await self.response(regularPath)
		themePath = conform(f"{self.resourcePath}/theme/{self.theme.theme}/{path}")
		if os.path.isfile(themePath):
			return await self.response(themePath)
		else:
			return await self.response(regularPath)
	
	async def response(self, path) :
		stat = os.stat(path)
		if stat.st_size > __MAX_SIZE__ :
			return await response.file(path)
		with open(path) as fd :
			content = fd.read()
			type = mimetypes.guess_type(path)
			__CACHE__[path] = {
				'content' : content,
				'type' : type,
			}
		return response.raw(content, content_type=type)
