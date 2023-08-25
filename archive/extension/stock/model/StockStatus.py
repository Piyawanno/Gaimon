from enum import IntEnum

class StockStatus(IntEnum) :
	FROM_SUPPILER = 0
	TO_SUPPILER = 1
	FROM_PRODUCTION = 2
	TO_PRODUCTION = 3

StockStatus.label = {
	StockStatus.FROM_SUPPILER : 'From Suppiler',
	StockStatus.TO_SUPPILER : 'To Suppiler',
	StockStatus.FROM_PRODUCTION : 'From Production',
	StockStatus.TO_PRODUCTION : 'To Production',
}