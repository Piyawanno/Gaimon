from enum import IntEnum


class MonitorIntervalType(IntEnum):
	HOUR = 10
	DAY = 20
	WEEK = 30
	MONTH = 40


# NOTE : Value (Interval to update, Monitor item list length)
UPDATE_RATE = {
	MonitorIntervalType.HOUR: (10,
								120),
	MonitorIntervalType.DAY: (60 * 10,
								6 * 24),
	MonitorIntervalType.WEEK: (60 * 60,
								24 * 7),
	MonitorIntervalType.MONTH: (60 * 60 * 6,
								4 * 30),
}
