import json
from xerial.Record import Record
from xerial.IntegerColumn import IntegerColumn
from xerial.StringColumn import StringColumn
from xerial.JSONColumn import JSONColumn

from xerial.input.TextInput import TextInput

class DynamicModel(Record):
	modelName = StringColumn()
	label = StringColumn(
		input=TextInput(
			label="label",
			order="1",
			isTable=True,
			isSearch=True,
			isRequired=True
		))
	attributeList = JSONColumn()
	parentName = StringColumn()

	hashed = IntegerColumn(length=64)

	def fromJson(self, name: str, config: dict):
		self.modelName = name
		self.label = config['label']
		self.attributeList = json.dumps(config['attributeList'])
		self.parentName = config['parentName']
