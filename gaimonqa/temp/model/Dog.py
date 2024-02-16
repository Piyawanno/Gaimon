from xerial.Record import Record
from xerial.StringColumn import StringColumn
from xerial.IntegerColumn import IntegerColumn
from xerial.FloatColumn import FloatColumn


class Dog(Record):
    name = StringColumn()
    age = IntegerColumn()
    weight = FloatColumn()
    height = FloatColumn()

    def modify(self):
        modification = self.createModification("2")
        modification.add("height", FloatColumn())
