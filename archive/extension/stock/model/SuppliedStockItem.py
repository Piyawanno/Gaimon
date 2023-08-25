import importlib
from xerial.Record import Record
from xerial.IntegerColumn import IntegerColumn
from xerial.StringColumn import StringColumn
from xerial.DateTimeColumn import DateTimeColumn
from xerial.input.TextInput import TextInput
from xerial.input.DateTimeInput import DateTimeInput
from xerial.input.EnumSelectInput import EnumSelectInput

from gaimon.extension.stock.model.DirectionENUM import DirectionENUM
from gaimon.extension.stock.model.StockStatus import StockStatus

class SuppliedStockItem (Record) :
	type = IntegerColumn(default=-1, foreignKey="StockItemType.id", isIndex=True)
	name = StringColumn(default='', length=255, input=TextInput(label="ชื่อ", order="1.0", isTable=True, isSearch=True, isRequired=True))
	reference = StringColumn(default='', length=255, input=TextInput(label="อ้างอิง", order="2.0", isTable=False, isSearch=False, isRequired=False))
	stockWarehouseID = IntegerColumn(foreignKey="StockWarehouse.id")
	direction = IntegerColumn(input=EnumSelectInput(label="Direction", enum=DirectionENUM, order="3.0", isTable=True, isSearch=True, isRequired=True))
	statusENUM = IntegerColumn(input=EnumSelectInput(label="สถานะ", enum=StockStatus, order="6.0", isTable=True, isSearch=True, isRequired=True))
	
	stockIn = IntegerColumn(default=-1, foreignKey="StockIn.id")
	stockInBy = IntegerColumn(default=-1, foreignKey="User.id")
	stockInTime = DateTimeColumn(input=DateTimeInput(label="เข้าเวลา", order="4.0", isTable=True, isSearch=False, isRequired=False))

	stockOut = IntegerColumn(default=-1, foreignKey="StockOut.id")
	stockOutBy = IntegerColumn(default=-1, foreignKey="User.id")
	stockOutTime = DateTimeColumn(input=DateTimeInput(label="ออกวลา", order="5.0", isTable=True, isSearch=False, isRequired=False))
