from typing import Dict, List
from datetime import datetime
from gaimon.model.StepFlow import StepFlow
from gaimon.model.StepFlowItem import StepFlowItem
from xerial.AsyncDBSessionBase import AsyncDBSessionBase
from packaging.version import Version

DAY_SECONDS = 60 * 60 * 24

class StepFlowUtil:
	def __init__(self, application, entity: str="main"):
		from gaimon.core.AsyncApplication import AsyncApplication
		self.application: AsyncApplication = application
		self.entity = entity
		self.resourcePath = self.application.resourcePath

	async def getAll(self, session: AsyncDBSessionBase):
		models = await session.select(StepFlow, '', hasChildren=True)
		result = {}
		for model in models:
			step = model.toDict()
			step['item'].sort(key=lambda a: Version(a['stepOrder']))
			result[model.code] = step
		return result

	async def registerStepFromConfig(self, session: AsyncDBSessionBase, config: Dict[str, List[StepFlowItem]]):
		if len(config) == 0: return
		codes = [code for code in config]
		stepList:List[StepFlow] = await session.select(StepFlow, f'WHERE code IN ({", ".join(["?" for i in codes])})', parameter=codes)
		stepMap:Dict[str, StepFlow] = {i.code: i for i in stepList}
		itemsConfig:List[StepFlowItem] = []
		stepItemParameter = []
		stepItemClause = []
		for code in config:
			step = stepMap.get(code, None)
			if step is None:
				step = StepFlow()
				step.code = code
				await session.insert(step)
				stepMap[code] = step
			for i in config[code]:
				i.stepFlow = step.id
				itemsConfig.append(i)
				stepItemParameter.append(step.id)
				stepItemParameter.append(i.code)
				stepItemClause.append("stepFlow = ? and code = ?")
		stepItemList:List[StepFlowItem] = await session.select(StepFlowItem, f'WHERE {" OR ".join(stepItemClause)}', parameter=stepItemParameter)
		stepItemMap:Dict[str, StepFlow] = {f"{i.stepFlow}_{i.code}": i for i in stepItemList}
		for i in itemsConfig:
			key = f"{i.stepFlow}_{i.code}"
			stepItem = stepItemMap.get(key, None)
			if stepItem is None:
				await session.insert(i)
				stepItemMap[key] = i
			else:
				item = i.toDict()
				del item['id']
				stepItem.fromDict(item)
				await session.update(stepItem)

	async def registerStep(self, session: AsyncDBSessionBase, code: str, stepItem: StepFlowItem) -> StepFlowItem:
		steps:List[StepFlow] = await session.select(StepFlow, 'WHERE code = ?', parameter=[code], limit=1)
		if len(steps) == 0:
			step = StepFlow()
			step.code = code
			await session.insert(step)
		else:
			step = step[0]
		models:List[StepFlowItem] = await session.select(StepFlowItem, 'WHERE stepFlow = ? and code = ?', parameter=[step.id, stepItem.code], limit=1)
		model:StepFlowItem = None
		if len(models) == 0:
			stepItem.stepFlow = step.id
			await session.insert(stepItem)
			model = stepItem
		else:
			model = models[0]
			model.fromDict(stepItem.toDict())
			model.stepFlow = step.id
			await session.update(model)
		return model
