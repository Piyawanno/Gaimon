from xerial.Record import Record
from xerial.StringColumn import StringColumn
from xerial.IntegerColumn import IntegerColumn

class Profile (Record):
    firstname = StringColumn()
    lastname = StringColumn()
    pronouns = StringColumn()
    user = IntegerColumn(foreignKey="User.id")