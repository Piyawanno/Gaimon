from enum import IntEnum


class NotificationLevel(IntEnum):
	INFO = 20
	WARNING = 30
	ERROR = 40


NotificationLevel.label = {
	NotificationLevel.INFO: 'info',
	NotificationLevel.WARNING: 'warning',
	NotificationLevel.ERROR: 'error',
}
