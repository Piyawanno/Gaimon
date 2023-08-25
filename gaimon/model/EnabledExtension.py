from gc import isenabled
from xerial.Record import Record
from xerial.IntegerColumn import IntegerColumn
from xerial.StringColumn import StringColumn
from xerial.DateColumn import DateColumn


class EnabledExtension(Record):
	lid = IntegerColumn(default=-1, foreignKey="LegalEntity.id")
	module = StringColumn(default="", length=128)
	isEnabled = IntegerColumn(default=1)
	activateDate = DateColumn()
	deactivateDate = DateColumn()
