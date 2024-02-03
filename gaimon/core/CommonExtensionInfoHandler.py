from gaimon.core.Extension import Extension
from gaimon.core.ExtensionTree import ExtensionTree
from typing import List, Dict, Set
from sanic import Request

class CommonExtensionInfoHandler:
	async def getCSS(self, request: Request) -> Dict:
		raise NotImplementedError

	async def getJS(self, request: Request) -> Dict:
		raise NotImplementedError
	
	async def getPageName(self, request: Request) -> Dict:
		raise NotImplementedError
	
	async def getMenu(self, request: Request) -> Dict:
		raise NotImplementedError

	async def getExtension(self, request: Request) -> Dict[str, Extension] :
		raise NotImplementedError

	async def getExtensionTree(self, request: Request) -> ExtensionTree :
		raise NotImplementedError

	async def getRole(self, request: Request) -> Dict[str, List[str]]:
		raise NotImplementedError

	async def getExtensionRole(self, request: Request) -> set:
		raise NotImplementedError
	
	async def getPageExtension(self, request: Request) -> Dict[str, Set[str]]:
		raise NotImplementedError