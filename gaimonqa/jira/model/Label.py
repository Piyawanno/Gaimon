from xerial.Record import Record
from xerial.StringColumn import StringColumn
from xerial.Children import Children

class Label (Record):
    label = StringColumn()
    description = StringColumn()
    task = Children("Task.id")