from xerial.Record import Record
from xerial.IntegerColumn import IntegerColumn
from xerial.DateTimeColumn import DateTimeColumn

class StockOut (Record) :
	itemType = IntegerColumn(default=-1, foreignKey="StockItemType.id")
	stockOutBy = IntegerColumn(default=-1, foreignKey="User.id")
	stockOutTime = DateTimeColumn()
	amount = IntegerColumn(default=0)
