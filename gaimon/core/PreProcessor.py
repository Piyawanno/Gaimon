from gaimon.core.CommonDecorator import CommonDecorator, CommonDecoratorRule
from typing import List

def PRE(*ruleList:List[str], order:str=None, hasDBSession:bool=True) :
	def decorate(callable):
		callable.__RULE__ = PreProcessRule(ruleList, order, hasDBSession, callable)
		return callable
	return decorate

class PreProcessRule (CommonDecoratorRule) :
	pass

class PreProcessDecorator (CommonDecorator) :
	pass
