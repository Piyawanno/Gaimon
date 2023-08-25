import importlib
from xerial.Record import Record
from xerial.IntegerColumn import IntegerColumn
from xerial.StringColumn import StringColumn
from xerial.DateTimeColumn import DateTimeColumn

class StockItem (Record) :
	type = IntegerColumn(default=-1, foreignKey="StockItemType.id", isIndex=True)
	name = StringColumn(default='', length=255)
	reference = StringColumn(default='', length=255)
	stockWarehouseID = IntegerColumn(foreignKey="StockWarehouse.id")

	stockIn = IntegerColumn(default=-1, foreignKey="StockIn.id")
	stockInBy = IntegerColumn(default=-1, foreignKey="User.id")
	stockInTime = DateTimeColumn()

	stockOut = IntegerColumn(default=-1, foreignKey="StockOut.id")
	stockOutBy = IntegerColumn(default=-1, foreignKey="User.id")
	stockOutTime = DateTimeColumn()
	# None