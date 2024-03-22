from xerial.Record import Record
from xerial.StringColumn import StringColumn
from xerial.IntegerColumn import IntegerColumn

class User (Record):
    name = StringColumn()
    address = StringColumn(length=-1)
    phoneNumber = IntegerColumn()