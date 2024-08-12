from gaimon.core.AsyncService import AsyncService
from gaimon.core.WebSocketManagement import WebSocketManagement
from gaimon.service.notification.NotificationHandler import NotificationHandler
from gaimon.service.notification.NotificationManagement import NotificationManagement
from gaimon.service.notification.NotificationWebSocketHandler import NotificationWebSocketHandler
from gaimon.util.PathUtil import getGaimonResourcePath

from xerial.Vendor import Vendor
from xerial.AsyncDBSessionPool import AsyncDBSessionPool

from typing import Dict, List
from asyncio import Task

import gaimon.model as MainModel
import os, logging

class NotificationService(AsyncService):
	def __init__(self, config: dict, namespace: str = ''):
		super().__init__(config, namespace)
		self.websocket = WebSocketManagement(self)
		self.websocketHandler = NotificationWebSocketHandler(self)
		self.websocket.appendHandler(self.websocketHandler)

	def setHandler(self):
		self.appendHandler(NotificationHandler)
		self.resourcePath = getGaimonResourcePath(self.namespace)
		self.managementMap: Dict[str, NotificationManagement] = {}
		self.sendTask: List[Task] = []
		self.loadManagement()

	def initLoop(self, loop):
		self.loop = loop
		for management in self.managementMap.values():
			self.sendTask.append(loop.create_task(management.send()))
		self.websocket.startLoop()

	async def prepareHandler(self, handler, request, parameter, hasDBSession):
		entity: str = None if parameter is None else parameter.get('entity', None)
		if hasDBSession :
			handler.session = await self.pool.getSession()
   
			if entity is not None and handler.session.vendor == Vendor.POSTGRESQL:
				if entity != 'main':
					handler.session.setSchema(entity)
		else :
			handler.session = None
    
		handler.management = await self.getManagement(parameter)
 
	async def getManagement(self, parameter: dict) -> NotificationManagement:
		entity: str = None if parameter is None else parameter.get('entity', None)
		management = self.managementMap.get(entity, None)
		if management is None :
			resourcePath = f"{self.resourcePath}/notification"
			if not os.path.isdir(resourcePath): os.makedirs(resourcePath)
			management = NotificationManagement(self.config, self.resourcePath, entity)
			session = await self.pool.getSession()
			management.entity = entity
			if entity is not None and session.vendor == Vendor.POSTGRESQL:
				if entity != 'main':
					session.setSchema(entity)
			management.checkPath()
			management.loadUnsent()
			await management.prepareUser(session)
			await self.pool.release(session)
		else:
			management.entity = entity
		return management

	async def releaseHandler(self, handler):
		if handler.session is not None :
			await self.pool.release(handler.session)

	async def releaseManagement(self, management: NotificationManagement):
		entity = management.entity
		self.managementMap[entity] = management
  
	async def prepare(self):
		pass

	async def load(self):
		await self.connect()

	async def connect(self):
		self.isConnected = True
		self.config["DB"]["connectionNumber"] = self.config.get("DBConnectionNumber", 4)
		self.pool = AsyncDBSessionPool(self.config["DB"])
		await self.pool.createConnection()
		self.session = await self.pool.getSession()
		await AsyncDBSessionPool.browseModel(self.session, MainModel)
		await self.session.createTable()
		self.session.checkModelLinking()
		await self.pool.release(self.session)
  
	async def close(self):
		for task in self.sendTask:
			if not task.done():
				task.cancel()

	def loadManagement(self):
		resourcePath = f"{self.resourcePath}/notification"
		if not os.path.isdir(resourcePath): os.makedirs(resourcePath)
		for i in os.listdir(resourcePath):
			path = f"{resourcePath}/{i}"
			if i[:7] == 'Entity-' and os.path.isdir(path):
				entity = i[7:]
				logging.info(f">>> Loading management {entity}")
				management = NotificationManagement(self.config, self.resourcePath, entity)
				management.checkPath()
				management.loadUnsent()
				self.managementMap[entity] = management
