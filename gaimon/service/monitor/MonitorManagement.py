from gaimon.service.monitor.MonitorData import MonitorData
from gaimon.service.monitor.MonitorIntervalType import MonitorIntervalType as Type
from gaimon.service.monitor.MonitorItem import MonitorItem

from typing import Dict, List


class MonitorManagement:
	def __init__(self, config: dict):
		self.config = config
		self.serviceMap: Dict[str, Dict[Type, MonitorItem]] = {}

	def add(self, name: str, data: MonitorData):
		itemMap = self.serviceMap.get(name, None)
		if itemMap is None:
			itemMap = self.createItemMap(name)
			self.serviceMap[name] = itemMap

		for item in itemMap.values():
			item.add(data)

	def get(self, name: str, type: Type) -> List[MonitorData]:
		typeMap = self.serviceMap.get(name, None)
		if typeMap is None: return []
		item = typeMap.get(type, None)
		if item is None: return []
		return item.dataList

	def getByType(self, type: Type) -> Dict[str, List[MonitorData]]:
		data = {}
		for name, typeMap in self.serviceMap.items():
			item = typeMap.get(type, None)
			if item is not None:
				data[name] = item.dataList
		return data

	def createItemMap(self, name: str) -> Dict[Type, MonitorItem]:
		return {
			Type.HOUR: MonitorItem(name,
									Type.HOUR),
			Type.DAY: MonitorItem(name,
									Type.DAY),
			Type.WEEK: MonitorItem(name,
									Type.WEEK),
			Type.MONTH: MonitorItem(name,
									Type.MONTH),
		}
