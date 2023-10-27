from gaimon.core.Extension import Extension
import os

from xerial.AsyncDBSessionBase import AsyncDBSessionBase

class GaimonExtension(Extension):
	def __init__(self, resourcePath: str, configPath: str):
		self.ID = "gaimon"
		self.name = "Gaimon"
		self.path = self.getPath(__file__)
		super().__init__(resourcePath, configPath)

	# NOTE This method will be called by initialize module for first time.
	async def initialize(
		self,
		isCopy: bool = True,
		isForce: bool = False,
		isSetLocalConfig: bool = True
	):
		await super().initialize(isCopy, isForce)

	# NOTE This method will be called by start Gaimon server.
	async def load(self, application):
		await super().load(application)

	async def prepare(self, application, session:AsyncDBSessionBase):
		await super().prepare(application, session)
