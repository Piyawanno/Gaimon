from xerial.Record import Record
from xerial.DBSessionBase import REGISTER
from xerial.IntegerColumn import IntegerColumn
from xerial.StringColumn import StringColumn
from xerial.JSONColumn import JSONColumn
from packaging.version import Version

from typing import Dict, List

import json



@REGISTER
class DynamicForm(Record):
	modelName = StringColumn()
	formType = IntegerColumn(default=0)
	inputList = JSONColumn()
	groupList = JSONColumn()
	inputPerLine = IntegerColumn()
	converted = JSONColumn()

	def toDict(self) -> dict:
		result = super().toDict()
		result['inputList'] = json.loads(self.inputList)
		result['groupList'] = json.loads(self.groupList)
		groupMap: Dict[str, Dict] = {i['label']: i for i in result['groupList']}
		inputs = []
		for item in result['inputList']:
			if not 'group' in item['input']:
				item['order'] = str(item['order'])
				item['parsedOrder'] = Version(item['order'])
				inputs.append(item)
				continue
			if not item['input']['group']['label'] in groupMap: continue
			if not 'input' in groupMap[item['input']['group']['label']]:
				groupMap[item['input']['group']['label']]['input'] = []
			groupMap[item['input']['group']['label']]['input'].append(item)
		for item in result['groupList']:
			item['order'] = str(item['order'])
			item['parsedOrder'] = Version(item['order'])
			inputs.append(item)
		inputs.sort(key=lambda x: x['parsedOrder'])
		for item in inputs:
			del item['parsedOrder']
		result['input'] = inputs
		return result

	def convert(self):
		result = {}
		result['modelName'] = self.modelName
		result['formType'] = self.formType
		result['inputList'] = json.loads(self.inputList)
		result['groupList'] = json.loads(self.groupList)
		result['inputPerLine'] = self.inputPerLine
		groupMap: Dict[str, Dict] = {i['label']: i for i in result['groupList']}
		inputs = []
		for item in result['inputList']:
			if not 'group' in item['input']:
				item['order'] = str(item['order'])
				item['parsedOrder'] = Version(item['order'])
				inputs.append(item)
				continue
			if not item['input']['group']['label'] in groupMap: continue
			if not 'input' in groupMap[item['input']['group']['label']]:
				groupMap[item['input']['group']['label']]['input'] = []
			groupMap[item['input']['group']['label']]['input'].append(item)
		for item in result['groupList']:
			item['order'] = str(item['order'])
			item['parsedOrder'] = Version(item['order'])
			inputs.append(item)
		inputs.sort(key=lambda x: x['parsedOrder'])
		for item in inputs:
			del item['parsedOrder']
		result['input'] = inputs
		self.converted = json.dumps(result)
