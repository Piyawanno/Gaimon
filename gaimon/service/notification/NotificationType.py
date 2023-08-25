from enum import IntEnum


class NotificationType(IntEnum):
	INTERNAL = 10
	"""
	NOTE Required fields
	- host
	- part
	- user : None for unauthenticated service
	- password : None for unauthenticated service
	- route
	- parameter : Dict of service parameter
	"""
	INTERNAL_SERVICE = 11
	JAVASCRIPT_CLICKABLE = 12
	"""
	NOTE Required fields
	- email
	- topic
	"""
	EMAIL = 20
	"""
	NOTE Required fields
	- lineID
	"""
	LINE_CHAT = 31
	FACEBOOK_CHAT = 32
