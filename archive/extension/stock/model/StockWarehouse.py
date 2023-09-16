from xerial.Record import Record
from xerial.DateTimeColumn import DateTimeColumn
from xerial.IntegerColumn import IntegerColumn
from xerial.StringColumn import StringColumn
from xerial.FloatColumn import FloatColumn
from xerial.JSONColumn import JSONColumn

class StockWarehouse (Record) :
	__table_name__ = 'StockWarehouse'

	name = StringColumn(default="")
	typeName = StringColumn(default="")

	isDrop = IntegerColumn(default=0)