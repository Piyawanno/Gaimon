from gaimon.core.Route import GET
from gaimon.util.PathUtil import conform
from gaimon.core.RESTResponse import RESTResponse
from sanic import response

import os


class StaticController:
	def __init__(self, application):
		from gaimon.core.AsyncApplication import AsyncApplication
		from gaimon.core.ThemeHandler import ThemeHandler
		self.application: AsyncApplication = application
		self.theme: ThemeHandler = self.application.theme
		self.resourcePath:str = self.application.resourcePath

	@GET('/share/<path:path>', role=['guest'], hasDBSession=False)
	async def getStatic(self, request, path):
		regularPath = conform(f"{self.resourcePath}/share/{path}")
		if not os.path.isfile(regularPath) :
			regularPath = conform(f"{self.resourcePath}/upload/{path}")
		if self.theme.theme is None:
			if os.path.isfile(regularPath):
				return await response.file(regularPath)
			return response.text('NOT FOUND', status=404)
		if path[:3] == 'js/':
			return await response.file(regularPath)
		themePath = conform(f"{self.resourcePath}/theme/{self.theme.theme}/{path}")
		if os.path.isfile(themePath):
			return await response.file(themePath)
		else:
			return await response.file(regularPath)
