from xerial.Record import Record
from xerial.DateTimeColumn import DateTimeColumn
from xerial.IntegerColumn import IntegerColumn
from xerial.FloatColumn import FloatColumn
from xerial.StringColumn import StringColumn

STATUS_REQUEST = 0 
STATUS_APPROVE = 1
STATUS_ORDER  = 2
STATUS_BILL = 3
STATUS_RECIEVE = 4
STATUS_FINISH = 5
STATUS_RETURN = 6

OBJECTIVE_REPLACE_OLD = 0
OBJECTIVE_STOCK = 1
OBJECTIVE_REPAIR = 2
OBJECTIVE_MODIFY = 3
OBJECTIVE_CREATE_MACHINE = 4 
OBJECTIVE_REPAIR_MACHINE = 5
OBJECTIVE_LOST = 6
OBJECTIVE_GENERATE = 7
OBJECTIVE_OTHER = 8


class Purchase(Record):
	materialCode = StringColumn()
	materialType = IntegerColumn()
	detail = StringColumn()
	sendDate = DateTimeColumn()
	# materialSupplierID = IntegerColumn(foreignKey="MaterialSupplier.id")
	# supplierID = IntegerColumn(foreignKey="Supplier.id")
	projectName = StringColumn()
	comment = StringColumn()
	contract = StringColumn()
	status = IntegerColumn()
	objective = IntegerColumn()

	amountPerUnit = FloatColumn()
	amount = FloatColumn()
	amountLeft = IntegerColumn()
	unit = IntegerColumn()
	pricePerUnit = FloatColumn()
	total = FloatColumn()

	createDate = DateTimeColumn()
	createUserID = IntegerColumn()
	updateDate = DateTimeColumn()
	updateUserID = IntegerColumn()
	approveDate = IntegerColumn()
	approveUserID = IntegerColumn()
	