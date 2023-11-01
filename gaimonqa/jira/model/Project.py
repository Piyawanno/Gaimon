from xerial.Record import Record
from xerial.StringColumn import StringColumn
from xerial.IntegerColumn import IntegerColumn
from xerial.Children import Children

class Project (Record):
    name = StringColumn()
    user = IntegerColumn(foreignKey="User.id")
    task = Children("Task.id")