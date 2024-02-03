from enum import IntEnum


class Day(IntEnum):
	
	MONDAY = 0
	TUESDAY = 1
	WEDNESDAY = 2
	THURSDAY = 3
	FRIDAY = 4
	SATURDAY = 5
	SUNDAY = 6

Day.label = {
	Day.SUNDAY.value : "Sunday",
	Day.MONDAY.value : "Monday",
	Day.TUESDAY.value : "Tuesday",
	Day.WEDNESDAY.value : "Wednesday",
	Day.THURSDAY.value : "Thursday",
	Day.FRIDAY.value : "Friday",
	Day.SATURDAY.value : "Saturday"
}

