from enum import IntEnum

class DirectionENUM(IntEnum) :
	IN = 0
	OUT = 1

DirectionENUM.label = {
	DirectionENUM.IN : 'In',
	DirectionENUM.OUT : 'Out',
}