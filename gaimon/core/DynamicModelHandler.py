from xerial.DBSessionBase import DBSessionBase
from xerial.DBSessionPool import DBSessionPool
from xerial.ModelClassGenerator import ModelClassGenerator
from xerial.MetaDataExtractor import MetaDataExtractor
from gaimon.model.DynamicModel import DynamicModel

from typing import List

import json


class DynamicModelHandler:
	def __init__(self, application):
		self.application = application
		self.sessionPool: DBSessionPool = application.sessionPool
		self.session: DBSessionBase = application.session
		self.generator = ModelClassGenerator()
		self.modelList = []

	async def checkModel(self, isCreateTable: bool = False, session: DBSessionBase = None):
		if session is None: session = self.session
		self.modelList: List[DynamicModel] = await session.select(DynamicModel, "")
		for model in self.modelList:
			if model.attributeList == None: continue
			model.attributeList = json.loads(model.attributeList)
			modelClass = self.generator.append(model.modelName, model.attributeList)
			MetaDataExtractor.checkBackup(modelClass)
			session.appendModel(modelClass)
		if isCreateTable: await session.createTable()
		self.sessionPool.model = session.model

	async def append(self, name: str, label: str, attributeList: List[dict]) -> type:
		model = DynamicModel()
		model.modelName = name
		model.label = label
		model.attributeList = json.dumps(attributeList)
		await self.session.insert(model)
		modelClass = self.generator.append(name, attributeList)
		self.session.appendModel(modelClass)
		await self.session.createTable()
		self.sessionPool.model = self.session.model
		return modelClass

	async def getModel(self, name: str, session: DBSessionBase = None) -> type:
		if session is None: session = self.session
		modelClass = session.model.get(name, None)
		if modelClass is not None: return modelClass
		await self.checkModel(True, session)
		return session.model.get(name, None)
