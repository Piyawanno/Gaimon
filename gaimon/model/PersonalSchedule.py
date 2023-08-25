from datetime import datetime
from enum import IntEnum
from gc import isenabled
from xmlrpc.client import DateTime
from xerial.Record import Record
from xerial.IntegerColumn import IntegerColumn
from xerial.StringColumn import StringColumn
from xerial.DateTimeColumn import DateTimeColumn

from xerial.input.TextInput import TextInput
from xerial.input.NumberInput import NumberInput
from xerial.input.EnableInput import EnableInput
from xerial.input.EnumSelectInput import EnumSelectInput
from xerial.input.DateTimeInput import DateTimeInput

from gaimon.model.PersonalScheduleNotificationUnitType import PersonalScheduleNotificationUnitType


class PersonalScheduleGroup(IntEnum):
	GENERAL = 1
	NOTIFICATION = 2


PersonalScheduleGroup.label = {
	PersonalScheduleGroup.GENERAL: 'General',
	PersonalScheduleGroup.NOTIFICATION: 'Notification',
}

PersonalScheduleGroup.order = {
	PersonalScheduleGroup.GENERAL: '1.0',
	PersonalScheduleGroup.NOTIFICATION: '2.0',
}


class PersonalSchedule(Record):
	inputPerLine = 3
	__GROUP_LABEL__ = PersonalScheduleGroup

	uid = IntegerColumn(default=-1, foreignKey="User.id")
	subject = StringColumn(
		default="",
		input=TextInput(
			label="task",
			order="1",
			group=PersonalScheduleGroup.GENERAL,
		)
	)
	referenceID = IntegerColumn()
	eventType = StringColumn()
	isAllDay = IntegerColumn()
	startTime = DateTimeColumn(
		input=DateTimeInput(
			label="start time",
			order="3",
			group=PersonalScheduleGroup.GENERAL,
		)
	)
	endTime = DateTimeColumn(
		input=DateTimeInput(
			label="end time",
			order="4",
			group=PersonalScheduleGroup.GENERAL,
		)
	)
	isNotify = IntegerColumn(
		default=0,
		input=EnableInput(
			label="notify",
			order="5",
			isTable=True,
			isSearch=False,
			isRequired=False,
			group=PersonalScheduleGroup.NOTIFICATION,
		)
	)
	notificationTime = IntegerColumn(
		input=NumberInput(
			label="time",
			order="6",
			group=PersonalScheduleGroup.NOTIFICATION,
		)
	)
	notificationUnit = IntegerColumn(
		default=-1,
		input=EnumSelectInput(
			label="unit",
			enum=PersonalScheduleNotificationUnitType,
			order="7",
			group=PersonalScheduleGroup.NOTIFICATION,
		)
	)

	def toCalendar(self):
		data = self.toDict()
		if not self.startTime is None: data['startTime'] = self.startTime.timestamp()
		if not self.endTime is None: data['endTime'] = self.endTime.timestamp()
		return data
