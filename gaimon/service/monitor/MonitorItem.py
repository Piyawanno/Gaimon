from gaimon.service.monitor.MonitorIntervalType import MonitorIntervalType, UPDATE_RATE
from gaimon.service.monitor.MonitorData import MonitorData

from typing import List

print(MonitorIntervalType)


class MonitorItem:
	def __init__(self, key: str, type: MonitorIntervalType):
		self.key = key
		self.type = type
		self.interval, self.length = UPDATE_RATE[type]
		self.lastUpdate = -1
		self.dataList: List[MonitorData] = []

	def add(self, data: MonitorData):
		if data.monitorTime - self.lastUpdate > self.interval:
			self.lastUpdate = data.monitorTime
			self.dataList.append(data)
			if len(self.dataList) > self.length:
				self.dataList.pop(0)
