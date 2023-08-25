from xerial.Record import Record
from xerial.input.TextInput import TextInput
from xerial.IntegerColumn import IntegerColumn
from xerial.StringColumn import StringColumn


class UserGroup(Record):
	type = IntegerColumn(default=0)
	name = StringColumn(
		length=255,
		input=TextInput(
			label="Name",
			order="1",
			isTable=True,
			isSearch=True,
			isRequired=True
		)
	)
	description = StringColumn(
		length=255,
		input=TextInput(
			label="Description",
			order="2",
			isTable=True,
			isSearch=False,
			isRequired=False
		)
	)

	isDrop = IntegerColumn(length=1, isIndex=True, default=0)

	def toOption(self):
		return {'value': self.id, 'label': self.name}
