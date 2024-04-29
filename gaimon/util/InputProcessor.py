from gaimon.model.DynamicForm import DynamicForm
from xerial.AsyncDBSessionBase import AsyncDBSessionBase
from xerial.Record import Record
from xerial.DateColumn import DATE_FORMAT
from xerial.DateTimeColumn import DATETIME_FORMAT
from xerial.ColumnType import ColumnType
from xerial.input.InputType import InputType

from packaging.version import Version
from datetime import date, datetime
from typing import List, Dict

import copy

class InputProcessor :
	async def process(self, session: AsyncDBSessionBase, modelClass: type, modelName: str) :
		formList: List[DynamicForm] = await session.select(
			DynamicForm,
			"WHERE modelName=? and formType = 0",
			parameter=[modelName],
			limit=1
		)
		
		if not (hasattr(modelClass,'inputDict') and hasattr(modelClass,'input')) :
			Record.extractInput(modelClass, [])
		input = modelClass.inputDict
		mergedInput = modelClass.input
		if hasattr(modelClass,'__has_callable_default__' ) and modelClass.__has_callable_default__ :
			input = self.processDefault(modelClass)
			mergedInput = self.processMergedDefault(modelClass)
		
		result = {
			'isSuccess': True,
			'inputGroup': getattr(modelClass, 'inputGroup', None),
			'inputPerLine': getattr(modelClass, 'inputPerLine', None),
			'children': [i.toMetaDict() for i in modelClass.children],
			'input': input,
			'avatar': getattr(modelClass, '__avatar__', 'share/icon/logo_padding.png'),
			'isDefaultAvatar': getattr(modelClass, '__avatar__', None) is None,
			'mergedInput': mergedInput,
			'attachedGroup': modelClass.attachedGroup,
		}

		if len(formList) == 0: return result
		form = formList[0].toDict()
		self.processInput(form['inputList'], form['groupList'], result)
		return result
	
	def processDefault(self, modelClass) :
		input = []
		for i in modelClass.inputDict :
			copied:dict = copy.copy(i)
			default = copied.get('default', None)
			default = default() if callable(default) else default
			if hasattr(default, 'toDict') : default = default.toDict()
			elif isinstance(default, date) : default = default.strftime(DATE_FORMAT)
			elif isinstance(default, datetime) : default = default.strftime(DATETIME_FORMAT)
			copied['default'] = default
			input.append(copied)
		return input
	
	def processMergedDefault(self, modelClass) :
		mergedInput = []
		for i in modelClass.input :
			copied:dict = copy.copy(i)
			default = copied.get('default', None)
			default = default() if callable(default) else default
			if hasattr(default, 'toDict') : default = default.toDict()
			copied['default'] = default
			mergedInput.append(copied)
			sub = copied.get('input', None)
			if sub is None : continue
			for j in sub :
				default = j.get('default', None)
				default = default() if callable(default) else default
				if hasattr(default, 'toDict') : default = default.toDict()
				elif isinstance(default, date) : default = default.strftime(DATE_FORMAT)
				elif isinstance(default, datetime) : default = default.strftime(DATETIME_FORMAT)
				j['default'] = default
		return mergedInput

	def processInput(self, inputList, groupList, result={}):
		mergedInput = []
		groupMapper = {}
		groupParsedOrder = []
		for index, item in enumerate(groupList):
			parsedOrder = {
				'id': index + 1,
				'label': item['label'],
				'order': str(item['order']),
				'isGroup': True,
				'input': []
			}
			groupMapper[parsedOrder['label']] = parsedOrder
			parsedOrder['parsedOrder'] = Version(parsedOrder['order'])
			groupParsedOrder.append(parsedOrder)
			mergedInput.append(parsedOrder)
		groupParsedOrder.sort(key=lambda x: x['parsedOrder'])
		groupParsedOrder = [{
			'id': i['id'],
			'label': i['label'],
			'order': i['order']
		} for i in groupParsedOrder]
		result['inputGroup'] = groupParsedOrder

		inputs = []
		for item in inputList:
			config: Dict = item['input'].copy()
			del config['type']
			del config['order']
			del config['inputPerLine']
			if 'typeName' in config: del config['typeName']
			input: Dict = InputType.mapped[item['input']['type']](**config).toDict()

			input['parsedOrder'] = Version(str(item['input']['order']))
			input['columnType'] = ColumnType.mapped[item['type']].__name__
			input['columnName'] = item['name']
			input['isGroup'] = False
			input['inputPerLine'] = item['input']['inputPerLine']
			inputs.append(input)
			if 'group' in item['input'] and item['input']['group']['label'] in groupMapper:
				input['group'] = groupMapper[item['input']['group']['label']]['id']
				groupMapper[item['input']['group']['label']]['input'].append(input)
			else:
				mergedInput.append(input)
		mergedInput.sort(key=lambda x: x['parsedOrder'])
		inputs.sort(key=lambda x: x['parsedOrder'])
		result['input'] = []
		result['mergedInput'] = []
		for item in mergedInput:
			if item['isGroup'] and len(item['input']):
				item['input'].sort(key=lambda x: x['parsedOrder'])
				for input in item['input']:
					del input['parsedOrder']
			if 'parsedOrder' in item: del item['parsedOrder']
			result['mergedInput'].append(item)
		result['input'] = inputs
		return result
