import math
import time

from typing import List, Dict

from gaimon.util.ProcessUtil import readConfig
from gaimon.core.AsyncServiceClient import AsyncServiceClient
from gaimonerp.stock.model.CustomerStockItem import CustomerStockItem
from gaimonerp.stock.model.ProcessStatus import ProcessStatus
from gaimonerp.stock.model.ProductionStockItem import ProductionStockItem
from gaimonerp.stock.model.StockReconcile import StockReconcile
from gaimonerp.stock.model.StockReserve import StockReserve
from gaimonerp.stock.model.StockWithdrawItem import StockWithdrawItem
from gaimonerp.stock.model.SupplierStockItem import SupplierStockItem

DAY_SECONDS = 60 * 60 * 24


class NotificationClient:
	def __init__(self, application):
		from gaimon.core.AsyncApplication import AsyncApplication
		self.application: AsyncApplication = application
		self.resourcePath = self.application.resourcePath
		self.client: AsyncServiceClient = None

	async def checkClient(self):
		if self.client is not None: return
		self.client = self.application.createNotificationClient()

	async def registerUID(self, uid, socketID, entity:str = "None"):
		await self.checkClient()
		data = {
			'uid': uid,
			'socketID': socketID,
			'entity': entity,
		}
		result = await self.client.call('/register/uid', data, entity=entity)
		if result['isSuccess']: return
		else: raise RuntimeError(result['message'])

	async def deregisterUID(self, uid, socketID, entity:str = "None"):
		await self.checkClient()
		data = {
			'uid': uid,
			'socketID': socketID,
			'entity': entity,
		}
		result = await self.client.call('/deregister/uid', data, entity=entity)
		if result['isSuccess']: return
		else: raise RuntimeError(result['message'])
	
	async def count(self, uid, entity:str = "None"):
		data = {
			'uid': uid,
			'entity': entity,
		}
		await self.checkClient()
		result = await self.client.call('/count', data, entity=entity)
		if result['isSuccess']: return result['count']
		else: raise RuntimeError(result['message'])
	
	async def count(self, uid, entity:str = "None"):
		data = {
			'uid': uid,
			'entity': entity,
		}
		await self.checkClient()
		result = await self.client.call('/count', data, entity=entity)
		if result['isSuccess']: return result['count']
		else: raise RuntimeError(result['message'])
  
	async def set(self, uid, level, type, info, entity:str = "None"):
		data = {
			'uid': uid,
			'level': level,
			'type': type,
			'info': info,
			'entity': entity,
		}
		await self.checkClient()
		result = await self.client.call('/set', data, entity=entity)
		if result['isSuccess']: return result
		else: raise RuntimeError(result['message'])
  
	async def setModule(self, uid, level, type, info, entity:str = "None"):
		data = {
			'uid': uid,
			'level': level,
			'type': type,
			'info': info,
			'entity': entity,
		}
		await self.checkClient()
		result = await self.client.call('/set/module', data, entity=entity)
		if result['isSuccess']: return result
		else: raise RuntimeError(result['message'])

  
	async def setAsRead(self, uid, notificationIDList, entity:str = "None"):
		data = {
			'uid': uid,
			'notificationIDList': notificationIDList,
			'entity': entity,
		}
		await self.checkClient()
		result = await self.client.call('/set/asRead', data, entity=entity)
		if result['isSuccess']: return result
		else: raise RuntimeError(result['message'])

	def getDateID(self, timestamp: float) -> int:
		return int(math.floor((timestamp - time.timezone) / DAY_SECONDS))
