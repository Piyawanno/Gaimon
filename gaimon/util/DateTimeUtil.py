from datetime import datetime, date

import math, time

DAY_SECONDS = 60 * 60 * 24
WEEK_SECONDS = DAY_SECONDS * 7


def getCurrentDateID():
	return int(math.floor((time.time() - time.timezone) / DAY_SECONDS))

def getCurrentWeekID():
	return int(math.floor((time.time() - time.timezone) / WEEK_SECONDS))

def dateTimeToDateID(moment: datetime):
	stamp = moment.timestamp()
	return int(math.floor((stamp - time.timezone) / DAY_SECONDS))

def dateToDateID(moment: date):
	dt = datetime.combine(moment, datetime.min.time())
	return dateTimeToDateID(dt)

def dateIDToDateTime(dateID: int):
	return datetime.fromtimestamp(dateID * DAY_SECONDS + 1.0)

def getCurrentMonthID() -> int:
	now = datetime.now()
	return 12 * (now.year - 1970) + now.month

def dateIDToMonthID(dateID: int) -> int:
	return dateTimeToMonthID(dateIDToDateTime(dateID))

def dateTimeToMonthID(date: datetime) -> int:
	return 12 * (date.year - 1970) + date.month

def monthIDToDateTime(monthID: int) -> datetime:
	year = int(monthID / 12) + 1970
	month = monthID % 12
	if month == 0: 
		year = year - 1
		month = 12
	return datetime(year=year, month=month, day=1)

def monthIDToDateID(monthID: int) -> int:
	year = int(monthID / 12) + 1970
	month = monthID % 12
	if month == 0: 
		year = year - 1
		month = 12
	return dateTimeToDateID(datetime(year=year, month=month, day=1))
