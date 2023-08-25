from xerial.Record import Record
from xerial.IntegerColumn import IntegerColumn
from xerial.StringColumn import StringColumn


class LegalEntity(Record):
	name = StringColumn(length=255)
	description = StringColumn()
	address = IntegerColumn(default=-1, foreignKey="AddressBook.id")
	owner = IntegerColumn(default=-1, foreignKey="User.id")
	registrationNumber = StringColumn(length=13)

	website = StringColumn(length=255)
	phoneNumber = StringColumn(length=16)
	email = StringColumn(length=255)
