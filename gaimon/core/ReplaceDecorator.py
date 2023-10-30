from gaimon.core.CommonDecorator import CommonDecorator, CommonDecoratorRule
from gaimon.model.PermissionType import PermissionType as PT
from typing import List, Set, Callable

def REPLACE(rule:str, role:List[str]=None, permission:List[PT]=None, order:str=None, hasDBSession:bool=True) :
	def decorate(callable):
		callable.__RULE__ = ReplaceRule([rule], order, hasDBSession, callable)
		# NOTE : Place holder for later modification, otherwise the method
		# of an object is immutable.
		callable.__ROUTE__ = {}
		if role is not None :
			callable.__RULE__.role = set(role)
		if permission is not None :
			callable.__RULE__.permission = set(permission)
		return callable
	return decorate

class ReplaceRule (CommonDecoratorRule) :
	role: Set[str] = None
	permission: Set[PT] = None
	callee: Callable

class ReplaceDecorator (CommonDecorator) :
	pass
