from gaimon.core.CommonDecorator import CommonDecorator, CommonDecoratorRule
from typing import List

def PERMISSION(*ruleList:List[str], order:str=None, hasDBSession:bool=True) :
	def decorate(callable):
		callable.__RULE__ = PermissionRule(ruleList, order, hasDBSession, callable)
		return callable
	return decorate

class PermissionRule (CommonDecoratorRule) :
	pass
class PermissionDecorator (CommonDecorator) :
	pass
