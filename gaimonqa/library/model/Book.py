from xerial.Record import Record
from xerial.StringColumn import StringColumn
from xerial.IntegerColumn import IntegerColumn
# from xerial.DateColumn import DateColumn

class Book (Record):
    isbn = StringColumn(isFixedLength=True, length=13, isPrimaryKey=True)
    title = StringColumn()
    author = StringColumn()
    publishedYear = StringColumn(isFixedLength=True, length=4) # Consider using DateColumn ?
    library = IntegerColumn(foreignKey="Library.id")