from collections import UserString
from enum import IntEnum

class AddressSameCompany(IntEnum) :
	NO = 1
	YES = 2

AddressSameCompany.label = {
	AddressSameCompany.NO : 'ไม่ใช่',
	AddressSameCompany.YES : 'ใช่',
}