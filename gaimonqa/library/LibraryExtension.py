from gaimon.core.Extension import Extension

class LibraryExtension (Extension) :
	def __init__(self, resourcePath:str, configPath:str):
		self.ID = "library"
		self.name = "Library"
		self.path = self.getPath(__file__)
		super().__init__(resourcePath, configPath)

	# NOTE This method will be called by initialize module for first time.
	async def initialize(self, isCopy:bool=True, isForce:bool=False, isSetLocalConfig:bool=True) :
		await super().initialize(isCopy, isForce)
	
	# NOTE This method will be called by start Gaimon server.
	async def load(self, application) :
		await super().load(application)