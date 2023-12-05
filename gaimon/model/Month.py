from enum import IntEnum


class Month(IntEnum):
	JANUARY = 1
	FEBRUARY = 2
	MARCH = 3
	APRIL = 4
	MAY = 5
	JUNE = 6
	JULY = 7
	AUGUST = 8
	SEPTEMBER = 9
	OCTOBER = 10
	NOVEMBER = 11
	DECEMBER = 12


Month.label = {
    Month.JANUARY.value : "January",
	Month.FEBRUARY.value : "February",
	Month.MARCH.value : "March",
	Month.APRIL.value : "April",
	Month.MAY.value : "May",
	Month.JUNE.value : "June",
	Month.JULY.value : "July",
	Month.AUGUST.value : "August",
	Month.SEPTEMBER.value : "September",
	Month.OCTOBER.value : "October",
	Month.NOVEMBER.value : "November",
	Month.DECEMBER.value : "December"
}
