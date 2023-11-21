from xerial.Record import Record
from xerial.StringColumn import StringColumn
from xerial.IntegerColumn import IntegerColumn

class Book (Record):
    isbn = StringColumn(isFixedLength=True, length=13)
    title = StringColumn()
    author = StringColumn()
    publishedYear = StringColumn(isFixedLength=True, length=4)
    # library = IntegerColumn(foreignKey="Library.id")