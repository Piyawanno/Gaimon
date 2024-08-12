from xerial.Record import Record
from xerial.IntegerColumn import IntegerColumn
from xerial.StringColumn import StringColumn
from xerial.JSONColumn import JSONColumn


class StepFlowItem(Record):
	stepFlow = IntegerColumn(foreignKey="StepFlow.id", isIndex=True)
	stepOrder = StringColumn(isNotNull=True)
	title = StringColumn()
	code = StringColumn()
	permission = JSONColumn()
	isDrop = IntegerColumn(default=0)