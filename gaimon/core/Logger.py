from gaimon.core.LogHandler import LogHandler

import logging


class Logger(logging.Logger):
	def __init__(self, name, level=0):
		super().__init__(name, level)
		self.handler = LogHandler()

	def handle(self, record: logging.LogRecord):
		self.handler.handle(record)
