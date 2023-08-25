from dataclasses import dataclass
from typing import List


@dataclass
class WebSocketRoute:
	rule: str
	role: List[str]


def ROUTE(rule: str, role: List[str]):
	def decorate(handlerClass):
		handlerClass.__ROUTE__ = WebSocketRoute(rule, role)
		return handlerClass

	return decorate
