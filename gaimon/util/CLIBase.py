from typing import List
class CLIBase:
	def __init__(self):
		self.initParser()
	
	def initParser(self):
		raise NotImplementedError
	
	def getOption(self, argv: List[str]):
		self.option = self.parser.parse_args(argv)
		self.namespace = '' if self.option.namespace is None else self.option.namespace
	
	def run(self):
		raise NotImplementedError
	