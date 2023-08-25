import importlib
from xerial.Record import Record
from xerial.StringColumn import StringColumn
from xerial.input.TextInput import TextInput

class StockItemCategory (Record) :
	name = StringColumn(default='', length=255, input=TextInput(label="ชื่อ", order="1.0", isTable=True, isSearch=True, isRequired=True))
	description = StringColumn(default='', length=255, input=TextInput(label="รายละเอียด", order="2.0", isTable=False, isSearch=False, isRequired=False))
	