from gaimon.core.Extension import Extension
from gaimon.core.ExtensionTree import ExtensionTree
from typing import List, Dict, Set

class CommonExtensionInfoHandler:
	async def getCSS(self, entity: str) -> Dict:
		raise NotImplementedError

	async def getJS(self, entity: str) -> Dict:
		raise NotImplementedError
	
	async def getPageName(self, entity: str) -> Dict:
		raise NotImplementedError
	
	async def getMenu(self, entity: str) -> Dict:
		raise NotImplementedError

	async def getExtension(self, entity: str) -> Dict[str, Extension] :
		raise NotImplementedError

	async def getExtensionTree(self, entity: str) -> ExtensionTree :
		raise NotImplementedError

	async def getRole(self, entity: str) -> Dict[str, List[str]]:
		raise NotImplementedError

	async def getExtensionRole(self, entity: str) -> set:
		raise NotImplementedError
	
	async def getPageExtension(self, entity: str) -> Dict[str, Set[str]]:
		raise NotImplementedError