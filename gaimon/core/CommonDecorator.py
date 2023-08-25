from typing import Callable, List
from xerial.AsyncDBSessionBase import AsyncDBSessionBase
from packaging.version import Version

__MAX_CACHE__  = 4

class CommonDecorator :
	def __init__(self, application):
		from gaimon.core.AsyncApplication import AsyncApplication
		self.application: AsyncApplication = application
		self.extension: str = ''
		self.session: AsyncDBSessionBase = None

class CommonDecoratorRule :
	def __init__(self, ruleList:List[str], order:str, hasDBSession:bool, callable:Callable) :
		self.ruleList = ruleList
		self.order = None if order is None else Version(order)
		self.hasDBSession = hasDBSession
		self.callable = callable
		self.decoratorList = []
	
	def setDecoratorClass(self, decoratorClass:type) :
		self.decoratorClass = decoratorClass
	
	def getDecorator(self, application) -> CommonDecorator:
		if len(self.decoratorList) == 0 :
			return self.decoratorClass(application)
		else :
			return self.decoratorList.pop(0)
	
	def releaseDecorator(self, decorator:CommonDecorator) :
		if len(self.decoratorList) < __MAX_CACHE__ :
			self.decoratorList.append(decorator)
