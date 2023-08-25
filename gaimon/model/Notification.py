from xerial.Record import Record
from xerial.IntegerColumn import IntegerColumn
from xerial.StringColumn import StringColumn
from xerial.DateTimeColumn import DateTimeColumn
from xerial.input.EnumSelectInput import EnumSelectInput
from xerial.input.DateInput import DateInput
from xerial.input.TextInput import TextInput

from gaimon.service.notification.NotificationLevel import NotificationLevel


class Notification(Record):
	__skip_create__ = True

	level = IntegerColumn(
		input=EnumSelectInput(
			label='level',
			order='2.0',
			enum=NotificationLevel,
			isSearch=True,
			isTable=True,
		)
	)

	type = IntegerColumn()

	notifyTime = DateTimeColumn(
		input=DateInput(
			label='notifying date',
			order='1.0',
			isSearch=True,
			isTable=True,
		)
	)

	uid = IntegerColumn(default=-1, foreignKey='User.id', )

	info = StringColumn(
		input=TextInput(label='information',
						order='3.0',
						isSearch=True,
						isTable=True,
						)
	)

	isRead = IntegerColumn()
	isSent = IntegerColumn()
