from unicodedata import category
from xerial.Record import Record
from xerial.StringColumn import StringColumn
from xerial.IntegerColumn import IntegerColumn
from xerial.DateTimeColumn import DateTimeColumn
from xerial.JSONColumn import JSONColumn
from xerial.input.TextInput import TextInput
from xerial.input.TextAreaInput import TextAreaInput

class StockItemType (Record) :
	categoryID = IntegerColumn(default=-1, foreignKey='StockItemCategory.id', isIndex=True)
	name = StringColumn(default='', length=255, input=TextInput(label="ชื่อ", order="1.0", isTable=True, isSearch=True, isRequired=True))
	reference = StringColumn(default='', length=255, input=TextInput(label="อ้างอิง", order="2.0", isTable=False, isSearch=False, isRequired=False))
	description = StringColumn(default='', input=TextInput(label="หมายเหตุ", order="3.0", isTable=False, isSearch=False, isRequired=False))
	itemReferenceFormat = StringColumn(default='', length=255, input=TextInput(label="รูปแบบการอ้างอิง", order="4.0", isTable=False, isSearch=False, isRequired=False))
	atrributeClass = IntegerColumn(default=0, isIndex=True)
	lastStockIn = DateTimeColumn(isIndex=True)
	lastStockOut = DateTimeColumn(isIndex=True)
	detail = JSONColumn()
	total = StringColumn(default='', length=255, input=TextInput(label="เหลือ", order="5.0", isTable=False, isSearch=False, isRequired=False))

	def toOption(self):
		return {'value': self.id, 'label': self.name}
