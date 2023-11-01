from xerial.Record import Record
from xerial.StringColumn import StringColumn
from xerial.IntegerColumn import IntegerColumn

class Movie (Record):
    title = StringColumn()
    genre = StringColumn()
    synopsis = StringColumn(length=-1)
    publishYear = IntegerColumn()