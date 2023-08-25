from xerial.Record import Record
from xerial.IntegerColumn import IntegerColumn
from xerial.StringColumn import StringColumn
from xerial.DateTimeColumn import DateTimeColumn
from xerial.JSONColumn import JSONColumn

from xerial.input.TextInput import TextInput


class Template(Record):
	inputPerLine = 2

	name = StringColumn(
		input=TextInput(
			label='name',
			order='1.0',
			isTable=True,
			isSearch=True,
			isRequired=True
		)
	)

	version = StringColumn(
		input=TextInput(
			label='version',
			order='2.0',
			isTable=True,
			isSearch=True,
			isRequired=False
		)
	)

	model = StringColumn()
	isDefault = IntegerColumn(default=0)
	template = StringColumn(length=-1)
	detail = JSONColumn()
	remark = StringColumn()

	createDate = DateTimeColumn()
	lastUpdate = DateTimeColumn()
	createdBy = IntegerColumn(foreignKey="User.id")

	isDrop = IntegerColumn(default=0)
