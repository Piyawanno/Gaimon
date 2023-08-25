from enum import IntEnum


class PersonalScheduleNotificationUnitType(IntEnum):
	MINUTES = 1
	HOURS = 2
	DAYS = 3
	WEEKS = 4


PersonalScheduleNotificationUnitType.label = {
	PersonalScheduleNotificationUnitType.MINUTES: 'minutes',
	PersonalScheduleNotificationUnitType.HOURS: 'hours',
	PersonalScheduleNotificationUnitType.DAYS: 'days',
	PersonalScheduleNotificationUnitType.WEEKS: 'weeks',
}
