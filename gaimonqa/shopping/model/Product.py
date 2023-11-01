from xerial.Record import Record
from xerial.StringColumn import StringColumn
from xerial.FloatColumn import FloatColumn

class Product (Record):
    name = StringColumn()
    price = FloatColumn(precision=2, length=10)