from typing import List


class EntityBaseManagementMapper:
	def __init__(self, managementFactory, initializeRoutine, total: int, ID: int):
		self.managementFactory = managementFactory
		self.initializeRoutine = initializeRoutine
		self.total = total
		self.ID = ID

	async def create(self, entityList: List[str]):
		self.managementMap = {}
		self.managementList = []
		for i in entityList:
			ID = i.__hash__() % self.total
			if ID == self.ID:
				management = self.managementFactory()
				await self.initializeRoutine(management)
				self.managementList.append(management)
				self.managementMap[ID] = management

	async def get(self, entity: str):
		ID = entity.__hash__() % self.total
		if ID != self.ID: return None
		managemenet = self.managementMap.get(ID, None)
		if managemenet is None:
			management = self.managementFactory()
			await self.initializeRoutine(management)
			self.managementList.append(management)
			self.managementMap[ID] = management
		return managemenet
