from xerial.Record import Record
from xerial.IntegerColumn import IntegerColumn
from xerial.StringColumn import StringColumn
from xerial.FloatColumn import FloatColumn

from xerial.input.TextInput import TextInput
from xerial.input.NumberInput import NumberInput

class OrganizationType (Record) :
	name = StringColumn(
		length=255, 
		input=TextInput(
			label="ชื่อ", 
			order="1.0", 
			isTable=True, 
			isSearch=False, 
			isRequired=True)
	)

	vat = FloatColumn(
		default= 0.0,
		input=NumberInput(
			label="ภาษีมูลค่าเพิ่ม (%)",
			order="3.0",
			isTable=True, 
			isSearch=False, 
			isRequired=True)
	)
	
	withholdingTax = FloatColumn(
		default= 0.0,
		input=NumberInput(
			label="ภาษีหัก ณ ที่จ่าย (%)", 
			order="4.0", 
			isTable=True, 
			isSearch=False, 
			isRequired=True)
	)

	isDrop = IntegerColumn(default=0)

	def toOption(self):
		return {'value': self.id, 'label': self.name}