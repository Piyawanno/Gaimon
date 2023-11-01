from xerial.Record import Record
from xerial.StringColumn import StringColumn
from xerial.Children import Children

class Customer (Record):
    name = StringColumn()
    email = StringColumn()
    order = Children("Order.id")