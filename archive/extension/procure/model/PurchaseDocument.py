from xerial.Record import Record
from xerial.DateTimeColumn import DateTimeColumn
from xerial.IntegerColumn import IntegerColumn
from xerial.StringColumn import StringColumn


class PurchaseDocument(Record):
	purchaseCode = StringColumn()
	projectName = StringColumn()
	supplier = IntegerColumn()
	remark = StringColumn(length=-1)
	createDate = StringColumn()
	

