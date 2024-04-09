import traceback
from xerial.DBSessionBase import DBSessionBase
from xerial.DBSessionPool import DBSessionPool
from xerial.ModelClassGenerator import ModelClassGenerator
from xerial.MetaDataExtractor import MetaDataExtractor
from gaimon.model.DynamicModel import DynamicModel

from typing import Any, Dict, List

import json, time


class DynamicModelHandler:
	def __init__(self, application):
		self.application = application
		self.sessionPool: DBSessionPool = application.sessionPool
		self.session: DBSessionBase = application.session
		self.generator = ModelClassGenerator()
		self.modelList = []
		self.modelClassDict:Dict[str, Any] = {}

	def getModelList(self, entity:str):
		return self.modelList
	
	def getModelByName(self, name: str, entity:str):
		return self.modelClassDict.get(name, None)

	async def checkModel(self, isCreateTable: bool = False, session: DBSessionBase = None, entity: str="main"):
		if session is None: session = self.session
		self.modelList: List[DynamicModel] = await session.select(DynamicModel, "")
		result = []
		for model in self.modelList:
			model.modelName = model.modelName.strip()
			if len(model.modelName) == 0: continue
			if model.attributeList == None: continue
			model.attributeList = json.loads(model.attributeList)
			modelClass = self.generator.append(model.modelName, model.attributeList)
			self.modelClassDict[model.modelName] = modelClass
			MetaDataExtractor.checkBackup(modelClass)
			session.appendModel(modelClass)
			result.append(modelClass)
		if isCreateTable: 
			try:
				await session.createTable()
			except:
				print(traceback.format_exc())
		self.sessionPool.model = session.model
		return result

	async def getModel(self, name: str, session: DBSessionBase = None, entity: str="main") -> type:
		if session is None: session = self.session
		modelClass = session.model.get(name, None)
		if modelClass is not None: return modelClass
		await self.checkModel(True, session)
		return session.model.get(name, None)
