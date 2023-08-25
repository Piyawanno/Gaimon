from typing import List, Tuple
from xerial.AsyncDBSessionBase import AsyncDBSessionBase

from gaimon.model.DynamicModel import DynamicModel
from gaimon.model.DynamicForm import DynamicForm
from gaimon.util.HashFunction import SMHash

import json


class DynamicModelUtil:
	@staticmethod
	async def getDynamicModel(session: AsyncDBSessionBase,
								modelName: str) -> Tuple[bool,
														DynamicModel]:
		models: List[DynamicModel] = await session.select(
			DynamicModel,
			f"WHERE modelName = '{modelName}'",
			limit=1
		)
		if len(models) == 0: return (False, None)
		return (True, models[0])

	@staticmethod
	async def insertDynamicModel(
		session: AsyncDBSessionBase,
		modelName: str,
		label: str,
		parentName: str
	) -> Tuple[bool,
				DynamicModel]:
		models: List[DynamicModel] = await session.select(
			DynamicModel,
			f"WHERE modelName = '{modelName}'",
			limit=1
		)
		if len(models): return (False, None)
		model = DynamicModel()
		model.modelName = modelName
		model.label = label
		model.parentName = parentName
		# model.attributeList = json.dumps([])
		model.hashed = SMHash(model.modelName)
		await session.insert(model)
		return (True, model)

	@staticmethod
	async def updateDynamicModel(
		session: AsyncDBSessionBase,
		modelName: str,
		attributeList: List
	) -> Tuple[bool,
				DynamicModel]:
		models: List[DynamicModel] = await session.select(
			DynamicModel,
			f"WHERE modelName = '{modelName}'",
			limit=1
		)
		if len(models) == 0: return (False, None)
		model = models[0]
		model.attributeList = json.dumps(attributeList)
		await session.update(model)
		return (True, model)

	@staticmethod
	async def getDynamicForm(session: AsyncDBSessionBase,
								modelName: str,
								formType: int) -> Tuple[bool,
														DynamicForm]:
		forms: List[DynamicForm] = await session.select(
			DynamicForm,
			f"WHERE modelName = '{modelName}' and formType = {formType}",
			limit=1
		)
		if len(forms) == 0: return (False, None)
		return (True, forms[0])

	@staticmethod
	async def updateDynamicForm(
		session: AsyncDBSessionBase,
		modelName: str,
		inputList: List,
		groupList: List,
		inputPerLine: int,
		formType: int
	) -> Tuple[bool,
				DynamicForm]:
		forms: List[DynamicForm] = await session.select(
			DynamicForm,
			f"WHERE modelName = '{modelName}' and formType = {formType}",
			limit=1
		)
		if len(forms):
			form = forms[0]
			form.inputList = json.dumps(inputList)
			form.inputPerLine = inputPerLine
			form.groupList = json.dumps(groupList)
			form.convert()
			await session.update(form)
			return (True, form)
		form = DynamicForm()
		form.modelName = modelName
		form.inputList = json.dumps(inputList)
		form.inputPerLine = inputPerLine
		form.groupList = json.dumps(groupList)
		form.formType = 0
		form.convert()
		await session.insert(form)
		return (True, form)
