from xerial.Record import Record
from xerial.StringColumn import StringColumn
from xerial.FloatColumn import FloatColumn
from xerial.Children import Children

class Product (Record):
    name = StringColumn()
    price = FloatColumn(precision=2, length=10)
    orderItem = Children("OrderItem.id")