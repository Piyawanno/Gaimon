from xerial.AsyncDBSessionPool import AsyncDBSessionPool

from gaimon.extension.stock.model.StockShelf import StockShelf
from gaimon.extension.stock.model.StockPackage import StockPackage
from gaimon.extension.stock.model.StockItemType import StockItemType

from typing import List, Tuple, Dict
from packaging.version import Version
from datetime import datetime

class FIFOManagement :
	def __init__(self, config:dict) :
		self.config = config
		self.sleepTime = config['sleepTime']
		self.entity:str = None
		self.session:AsyncDBSessionPool = None
		
	async def prepare(self) :
		clause = "WHERE isFIFO=1"
		self.shelfList:List[StockShelf] = await self.session.select(StockShelf, clause, isRelated=False)
		await self.checkMaxContain(self.shelfList)
		self.shelfIDMap:Dict[int, StockShelf] = {i.id:i for i in self.shelfList}
		self.shelfMap:Dict[int, Dict[int, List[StockShelf]]] = self.mapShelf(self.shelfList)
		self.currentInMap:Dict[int, Dict[int, StockShelf]] = self.mapCurrentIn(self.shelfMap)
		self.currentOutMap:Dict[int, Dict[int, StockShelf]] = self.mapCurrentOut(self.shelfMap)
	
	async def checkMaxContain(self, shelfList:List[StockShelf]) :
		packageID = {str(i.package) for i in shelfList if i.maxPackageNumber < 0 and i.package > 0}
		if len(packageID) == 0 : return
		joined = ",".join(list(packageID))
		clause = f"WHERE id IN ({joined})"
		packageList:List[StockPackage] = await self.session.select(StockPackage, clause, isRelated=False)
		packageMap = {i.id:i for i in packageList}
		for shelf in shelfList :
			package = packageMap.get(shelf.package, None)
			if package is None : continue
			shelf.calculateMaxContain(package)
			await self.session.update(shelf)
	
	def mapShelf(self, shelfList:List[StockShelf]) -> Dict[int, List[StockShelf]] :
		shelfMap = {}
		for shelf in shelfList :
			itemMap = shelfMap.get(shelf.package, {})
			if len(itemMap) == 0 : shelfMap[shelf.package] = itemMap
			shelfList = itemMap.get(shelf.itemType, [])
			if len(shelfList) == 0 : itemMap[shelf.itemType] = shelfList
			shelfList.append(shelf)
		for shelfList in shelfMap.values() :
			self.sortTransferOrder(shelfList)
		return shelfMap
	
	def mapCurrentIn(self, shelfMap:Dict[int, List[StockShelf]]) -> Dict[int, StockShelf] :
		mapped = {}
		for packageID, itemMap in shelfMap.items() :
			mapped[packageID] = {}
			for itemTypeID, shelfList in itemMap.items() :
				mapped[packageID][itemTypeID] = self.checkCurrentIn(shelfList)
		return mapped
	
	def mapCurrentOut(self, shelfMap:Dict[int, List[StockShelf]]) -> Dict[int, StockShelf] :
		mapped = {}
		for packageID, itemMap in shelfMap.items() :
			mapped[packageID] = {}
			for itemTypeID, shelfList in itemMap.items() :
				mapped[packageID][itemTypeID] = self.checkCurrentOut(shelfList)
		return mapped

	def checkCurrentIn(self, shelfList:List[StockShelf]) -> StockShelf :
		filtered = [i for i in shelfList if i.lastIn is not None]
		if len(filtered) :
			return max(filtered, key=lambda x : x.lastIn)
		else :
			return shelfList[0]
	
	def checkCurrentOut(self, shelfList:List[StockShelf]) -> StockShelf :
		filtered = [i for i in shelfList if i.lastOut is not None]
		if len(filtered) :
			return max(filtered, key=lambda x : x.lastOut)
		else :
			return shelfList[0]
	
	def sortTransferOrder(self, shelfList:List[StockShelf]) :
		for shelf in shelfList :
			shelf.parsedOrder = Version(shelf.transferOrder)
		shelfList.sort(key=lambda x : x.parsedOrder)
		for i, shelf in enumerate(shelfList) :
			shelf.index = i

	async def withdrawItem(self, itemCount:Dict[int, int]) -> Dict[int, List[Tuple[StockShelf, int]]]:
		now = datetime.now()
		result:Dict[int, List[Tuple(StockShelf, int)]] = {}
		for itemTypeID, amount in itemCount.items() :
			shelfList = self.shelfMap.get(itemTypeID, None)
			if shelfList is None : continue
			current = self.currentOutMap.get(itemTypeID, None)
			if current is None : continue
			n = len(shelfList)
			if n == 0 : continue
			startIndex = current.index
			residual = amount
			result[itemTypeID] = []
			while True :
				if current.currentPackageNumber <= 0 :
					index = current.index + 1
					if index >= n : index = 0
					current = shelfList[index]
				else :
					if current.currentPackageNumber > residual :
						current.currentPackageNumber = current.currentPackageNumber - residual
						current.lastOut = now
						await self.session.update(current)
						result[itemTypeID].append((current, residual))
						break
					else :
						available = residual - current.currentPackageNumber
						result[itemTypeID].append((current, available))
						residual = residual - available
						current.currentPackageNumber = 0
						current.lastOut = now
						await self.session.update(current)
						index = current.index + 1
						if index >= n : index = 0
						current = shelfList[index]
				if current.index == startIndex : break
			self.currentOutMap[itemTypeID] = current
		return result

	async def appendItem(self, itemCount:Dict[int, int]) -> Dict[int, List[Tuple[StockShelf, int]]]:
		now = datetime.now()
		result:Dict[int, List[Tuple(StockShelf, int)]] = {}
		for itemTypeID, amount in itemCount.items() :
			shelfList = self.shelfMap.get(itemTypeID, None)
			if shelfList is None : continue
			current = self.currentInMap.get(itemTypeID, None)
			if current is None : continue
			n = len(shelfList)
			if n == 0 : continue
			startIndex = current.index
			residual = amount
			result[itemTypeID] = []
			while True :
				if current.currentPackageNumber >= current.maxPackageNumber :
					index = current.index + 1
					if index >= n : index = 0
					current = shelfList[index]
				else :
					if current.currentPackageNumber + residual <= current.maxPackageNumber :
						current.currentPackageNumber += residual
						current.lastIn = now
						await self.session.update(current)
						result[itemTypeID].append((current, residual))
						break
					else :
						capacity = current.maxPackageNumber - current.currentPackageNumber
						result[itemTypeID].append((current, capacity))
						residual = residual - capacity
						current.currentPackageNumber = current.maxPackageNumber
						current.lastIn = now
						await self.session.update(current)
						index = current.index + 1
						if index >= n : index = 0
						current = shelfList[index]
				if current.index == startIndex : break
			self.currentInMap[itemTypeID] = current
		return result

	async def getShelfIn(self, packageID:int, itemTypeID:int, amount:int, isCommit:bool=False) -> List[Tuple[StockShelf, int]] :
		now = datetime.now()
		result = []
		itemMap = self.shelfMap.get(packageID, None)
		if itemMap is None : return result
		shelfList = itemMap.get(itemTypeID, None)
		if shelfList is None : return result
		currentItemMap = self.currentInMap.get(packageID, None)
		if currentItemMap is None : return result
		current = currentItemMap.get(itemTypeID, None)
		if current is None : return result
		n = len(shelfList)
		if n == 0 : return result
		residual = amount
		while True :
			capacity = current.maxPackageNumber - current.currentPackageNumber
			print(f"capacity {capacity} residual {residual}")
			if residual > capacity :
				residual = residual - capacity
				current.lastIn = now
				if isCommit :
					current.currentPackageNumber = current.maxPackageNumber
					await self.session.update(current)
				result.append((current, capacity))
				index = current.index + 1
				if index >= n : index = 0
				current = shelfList[index]
			else :
				current.lastIn = now
				if isCommit :
					current.currentPackageNumber = current.currentPackageNumber+residual
					await self.session.update(current)
				await self.session.update(current)
				result.append((current, residual))
				break
		self.currentInMap[packageID][itemTypeID] = current
		return result
	
	async def setShelfIn(self, shelfID:int, packageID:int, amount:int) -> int:
		shelf = self.shelfIDMap.get(shelfID, None)
		if shelf is None :
			raise ValueError(f"shelfID {shelfID} cannot be found.")
		if shelf.package != packageID :
			raise ValueError(f"Shelf ID={shelfID} is not allowed to store ItemType ID={packageID}.")
		capacity = shelf.maxPackageNumber - shelf.currentPackageNumber
		if amount > capacity :
			shelf.currentPackageNumber = shelf.maxPackageNumber
			await self.session.update(shelf)
			return amount - capacity
		else :
			shelf.currentPackageNumber += amount
			print(f"III. Shelf {shelf.id} p={packageID} {shelf.currentPackageNumber} {shelf.maxPackageNumber}")
			await self.session.update(shelf)
			return amount

	async def getShelfOut(self, packageID:int, itemTypeID:int, amount:int, isCommit:bool=False) -> List[Tuple[StockShelf, int]] :
		now = datetime.now()
		result = []
		itemMap = self.shelfMap.get(packageID, None)
		if itemMap is None : return result
		shelfList = itemMap.get(itemTypeID, None)
		if shelfList is None : return result
		currentItemMap = self.currentInMap.get(packageID, None)
		if currentItemMap is None : return result
		current = currentItemMap.get(itemTypeID, None)
		if current is None : return result
		n = len(shelfList)
		if n == 0 : return result
		residual = amount
		while True :
			if residual > current.currentPackageNumber :
				residual = residual - current.currentPackageNumber
				current.lastOut = now
				if isCommit :
					current.currentPackageNumber = 0
					await self.session.update(current)
				result.append((current, current.currentPackageNumber))
				index = current.index + 1
				if index >= n : index = 0
				current = shelfList[index]
			else :
				current.lastOut = now
				if isCommit :
					current.currentPackageNumber = current.currentPackageNumber-residual
					await self.session.update(current)
				result.append((current, residual))
				break
		self.currentOutMap[packageID][itemTypeID] = current
		return result
	
	async def setShelfOut(self, shelfID:int, packageID:int, amount:int) -> int:
		shelf = self.shelfIDMap.get(shelfID, None)
		if shelf is None :
			raise ValueError(f"shelfID {shelfID} cannot be found.")
		if shelf.itemType != packageID :
			raise ValueError(f"Shelf ID={shelfID} is not allowed to store ItemType ID={packageID}.")
		if amount > shelf.currentPackageNumber :
			available = shelf.currentPackageNumber
			shelf.currentPackageNumber = 0
			await self.session.update(shelf)
			return available
		else :
			shelf.currentPackageNumber = shelf.currentPackageNumber - amount
			await self.session.update(shelf)
			return amount

