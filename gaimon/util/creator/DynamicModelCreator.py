from gaimon.util.CommonDBBounded import CommonDBBounded
from gaimon.model.DynamicModel import DynamicModel

from typing import List

import json


class DynamicModelCreator(CommonDBBounded):
	def create(self, name: str, label: str, attributeList: List[dict]) -> DynamicModel:
		model = DynamicModel()
		model.modelName = name
		model.label = label
		model.attributeList = json.dumps(attributeList)
		return model

	def createModel(self, config: dict) -> List[DynamicModel]:
		if not 'label' in config: config['label'] = config['name']
		result = []
		model = DynamicModel()
		model.fromJson(config['name'], config)
		result.append(model)
		print(model.modelName)
		return result
