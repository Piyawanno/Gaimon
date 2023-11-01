from xerial.Record import Record
from xerial.IntegerColumn import IntegerColumn

class TaskLabel (Record):
    task = IntegerColumn(foreignKey="Task.id")
    label = IntegerColumn(foreignKey="Label.id")