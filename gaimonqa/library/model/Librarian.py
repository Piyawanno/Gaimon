from xerial.Record import Record
from xerial.StringColumn import StringColumn
from xerial.IntegerColumn import IntegerColumn

class Librarian (Record):
    name = StringColumn()
    email = StringColumn()
    library = IntegerColumn(foreignKey="Library.id")