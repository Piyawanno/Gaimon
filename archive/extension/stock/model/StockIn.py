from xerial.Record import Record
from xerial.IntegerColumn import IntegerColumn
from xerial.DateTimeColumn import DateTimeColumn

class StockIn (Record) :
	itemType = IntegerColumn(default=-1, foreignKey="StockItemType.id")
	stockInBy = IntegerColumn(default=-1, foreignKey="User.id")
	stockInTime = DateTimeColumn()
	amount = IntegerColumn(default=0)
