import os


class StaticFileHandler:
	def __init__(self, application):
		from gaimon.core.AsyncApplication import AsyncApplication
		self.application: AsyncApplication = application
		self.resourcePath = self.application.resourcePath

	async def isStaticShare(self, path: str) -> bool:
		path = f'{self.resourcePath}/share/{path}'
		if os.path.isfile(path) : return True
		path = f'{self.resourcePath}/update/{path}'
		return os.path.isfile(path)

	async def readStaticShare(self, path: str) -> bytes:
		path = f'{self.resourcePath}/share/{path}'
		if not os.path.isfile(path) : 
			path = f'{self.resourcePath}/upload/{path}'
		with open(path, 'rb') as fd:
			return fd.read()

	async def storeStaticShare(self, path: str, data: bytes):
		path = f'{self.resourcePath}/upload/{path}'
		directory = os.path.dirname(path)
		if not os.path.isdir(directory) : os.makedirs(directory, exist_ok=True)
		with open(path, 'wb') as fd:
			fd.write(data)

	async def isStaticFile(self, path: str) -> bool:
		path = f'{self.resourcePath}/file/{path}'
		return os.path.isfile(path)

	async def readStaticFile(self, path: str) -> bytes:
		path = f'{self.resourcePath}file/{path}'
		with open(path, 'rb') as fd:
			return fd.read()

	async def storeStaticFile(self, path: str, data: bytes):
		path = f'{self.resourcePath}file/{path}'
		directory = os.path.dirname(path)
		if not os.path.isdir(directory) : os.makedirs(directory, exist_ok=True)
		with open(path, 'wb') as fd:
			fd.write(data)

	async def removeStaticFile(self, path: str):
		path = f'{self.resourcePath}file/{path}'
		if os.path.exists(path): os.remove(path)

	async def storeStaticFileChunk(self, path: str, data: bytes, position: int):
		path = f'{self.resourcePath}file/{path}'
		with open(path, 'ab') as fd:
			fd.seek(position)
			fd.write(data)
