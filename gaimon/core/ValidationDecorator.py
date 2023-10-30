from gaimon.core.CommonDecorator import CommonDecorator, CommonDecoratorRule
from typing import List

def VALIDATE(*ruleList:List[str], order:str=None, hasDBSession:bool=True) :
	def decorate(callable):
		callable.__RULE__ = ValidationRule(ruleList, order, hasDBSession, callable)
		return callable
	return decorate

class ValidationRule (CommonDecoratorRule) :
	pass

class ValidationDecorator (CommonDecorator) :
	pass
