from enum import IntEnum


class Day(IntEnum):
	SUNDAY = 1
	MONDAY = 2
	TUESDAY = 3
	WEDNESDAY = 4
	THURSDAY = 5
	FRIDAY = 6
	SATURDAY = 7

Day.label = {
	Day.SUNDAY.value : "Sunday",
	Day.MONDAY.value : "Monday",
	Day.TUESDAY.value : "Tuesday",
	Day.WEDNESDAY.value : "Wednesday",
	Day.THURSDAY.value : "Thursday",
	Day.FRIDAY.value : "Friday",
	Day.SATURDAY.value : "Saturday"
}

