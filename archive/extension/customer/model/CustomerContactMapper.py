from xerial.Record import Record
from xerial.IntegerColumn import IntegerColumn

class CustomerContactMapper (Record) :
	customerID = IntegerColumn(foreignKey="Customer.id")
	contactID = IntegerColumn(foreignKey="Contact.id")

	isDrop = IntegerColumn(default=0)