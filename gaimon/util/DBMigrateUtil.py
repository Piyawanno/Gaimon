from xerial.DateColumn import DATE_FORMAT
from xerial.DateTimeColumn import DATETIME_FORMAT

from datetime import datetime
import re

__MONTH__ = [
	"มกราคม",
	"กุมภาพันธ์",
	"มีนาคม",
	"เมษายน",
	"พฤษภาคม",
	"มิถุนายน",
	"กรกฎาคม",
	"สิงหาคม",
	"กันยายน",
	"ตุลาคม",
	"พฤศจิกายน",
	"ธันวาคม"
]
__SHORT_MONTH__ = [
	"ม.ค.",
	"ก.พ.",
	"มี.ค.",
	"เม.ย.",
	"พ.ค.",
	"มิ.ย.",
	"ก.ค.",
	"ส.ค.",
	"ก.ย.",
	"ต.ค.",
	"พ.ย.",
	"ธ.ค."
]

__MONTH_REGEX__ = re.compile("|".join(__MONTH__))
__SHORT_MONTH_REGEX__ = re.compile("|".join(__SHORT_MONTH__))


def getText(data, key, default=""):
	return data[key].strip() if key in data and data[key] is not None else default


def getNumber(data, key, default=-1):
	try:
		return int(data[key]) if key in data and len(str(data[key])) else default
	except:
		return default


def getDate(data, key, default=None):
	if not key in data: return default
	item: str = data[key]
	if len(item) == 0: return default
	if 'เกิด' in item or 'เกิดปี' in item:
		if 'เกิดปี' in item: item = item.replace('เกิดปี', '')
		elif 'เกิด' in item: item = item.replace('เกิด', '')
		if 'ปี' in item: item = item.replace('ปี', '')
		item = item.replace("พ.ศ.", "")
		item = item.strip()
		item = int("".join(re.findall(r'\b\d+\b', item)))
		return datetime(item - 543, 1, 1).strftime(DATE_FORMAT)
	if __MONTH_REGEX__.search(item) or __SHORT_MONTH_REGEX__.search(item):
		item = item.replace("พ.ศ.", "")
		item = re.sub(' +', ' ', item)
		result = re.findall(r'\b\d+\b', item)
		if len(result) == 1:
			position = __MONTH_REGEX__.search(item).span()
			index = __MONTH__.index(item[position[0]:position[1]])
			year = int(result[0]) - 543
			return datetime(year, index + 1, 1).strftime(DATE_FORMAT)
		elif len(result) == 2:
			position = __MONTH_REGEX__.search(item).span()
			index = __MONTH__.index(item[position[0]:position[1]])
			date = int(result[0])
			year = int(result[1]) - 543
			return datetime(year, index + 1, date).strftime(DATE_FORMAT)
	return default


def getDateWithFormat(data, key, format, default=None):
	if not key in data: return default
	if len(data[key]) == 0: return default
	return datetime.strptime(data[key], format).strftime(DATE_FORMAT)


def getDateTime(data, key, default=None):
	if not key in data: return default
	item: str = data[key]
	if len(item) == 0: return default
	try:
		return datetime.strptime(item, DATETIME_FORMAT).strftime(DATETIME_FORMAT)
	except:
		return default
