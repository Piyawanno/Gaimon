from xerial.Record import Record
from xerial.StringColumn import StringColumn
from xerial.IntegerColumn import IntegerColumn
from xerial.Children import Children

class Library (Record):
    name = StringColumn()
    location = StringColumn()
    librarian = IntegerColumn(foreignKey="Librarian.id")
    book = Children("Book.id")
