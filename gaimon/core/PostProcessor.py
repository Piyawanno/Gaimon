from gaimon.core.CommonDecorator import CommonDecorator, CommonDecoratorRule
from typing import List

def POST(*ruleList:List[str], order:str=None, hasDBSession:bool=True) :
	def decorate(callable):
		callable.__RULE__ = PostProcessRule(ruleList, order, hasDBSession, callable)
		return callable
	return decorate

class PostProcessRule (CommonDecoratorRule) :
	pass

class PostProcessDecorator (CommonDecorator) :
	pass
