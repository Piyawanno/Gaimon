from xerial.Children import Children
from xerial.Record import Record
from xerial.IntegerColumn import IntegerColumn
from xerial.StringColumn import StringColumn

class StepFlow(Record):
	code = StringColumn(isNotNull=True, isIndex=True)
	isDrop = IntegerColumn(default=0)

	item = Children(reference="StepFlowItem.stepFlow")