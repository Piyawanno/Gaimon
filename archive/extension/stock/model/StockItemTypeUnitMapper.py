from xerial.Record import Record
from xerial.StringColumn import StringColumn
from xerial.IntegerColumn import IntegerColumn
from xerial.input.TextInput import TextInput
from xerial.input.NumberInput import NumberInput
from xerial.input.ReferenceSelectInput import ReferenceSelectInput

class StockItemTypeUnitMapper (Record) :
	itemType = IntegerColumn(
		default=-1, 
		foreignKey='StockItemType.id', 
		isIndex=True, 
		input=ReferenceSelectInput(
			label="Item", 
			order="1", 
			url="stock/item/type/option/get", 
			isTable=True, 
			isSearch=True, 
			isRequired=True
		)
	)

	unit = IntegerColumn(default=-1, foreignKey="Unit.id", input=ReferenceSelectInput(label="Unit", order="2", url="utility/unit/option/get", isTable=True, isSearch=True, isRequired=True))
	
	unitAmount = IntegerColumn(default=0, input=NumberInput(label="Amount", order="3", isTable=True, isSearch=False, isRequired=True))
	
	subUnit = IntegerColumn(default=-1, foreignKey="Unit.id", input=ReferenceSelectInput(label="SubUnit", order="4", url="utility/unit/option/get", isTable=True, isSearch=True, isRequired=True))
	
	subUnitAmount = IntegerColumn(default=0, input=NumberInput(label="Amount", order="5", isTable=True, isSearch=False, isRequired=True))
	isDrop = IntegerColumn(length=1, default=0, isIndex=True)