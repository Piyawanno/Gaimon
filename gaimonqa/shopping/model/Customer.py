from xerial.Record import Record
from xerial.StringColumn import StringColumn

class Customer (Record):
    name = StringColumn()
    email = StringColumn()