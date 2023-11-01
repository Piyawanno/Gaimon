from xerial.Record import Record
from xerial.StringColumn import StringColumn
from xerial.IntegerColumn import IntegerColumn

class Attachment (Record):
    name = StringColumn()
    task = IntegerColumn(foreignKey="Task.id")