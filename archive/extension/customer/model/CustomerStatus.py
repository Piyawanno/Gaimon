from enum import IntEnum

class CustomerStatus(IntEnum) :
	NORMAL = 0
	DEPRECATED = 1

CustomerStatus.label = {
	CustomerStatus.NORMAL : 'ปกติ',
	CustomerStatus.DEPRECATED : 'เลิกใช้',
}