from gaimon.model.PermissionType import PermissionType
from dataclasses import dataclass
from typing import Set


@dataclass
class Route:
	method: str
	rule: str
	option: dict
	role: Set[str]
	permission: Set[PermissionType]
	logModelName: str
	isBusinessLog: bool
	hasDBSession: bool
	isLogData: bool
	isRaw: bool


def ROLE(classRole):
	def decoration(callable):
		callable.role = {classRole}
		for i in dir(callable):
			attribute = getattr(callable, i)
			if hasattr(attribute, '__ROUTE__'):
				route = attribute.__ROUTE__
				if hasattr(callable, '__SKIP_ROLE__') and callable.__SKIP_ROLE__:
					route.role = {classRole}
		return callable

	return decoration


def getRole(callable, option) -> Set[str]:
	role = option.pop('role', None)
	if role is None:
		callable.__SKIP_ROLE__ = True
		return {'root'}
	elif isinstance(role, str):
		return {role}
	elif isinstance(role, list):
		return set(role)
	else:
		raise RuntimeError('Role must be str or list or None.')


def getPermission(callable, option) -> Set[PermissionType]:
	permission = option.pop('permission', None)
	if isinstance(permission, str):
		return {permission}
	elif isinstance(permission, list):
		return set(permission)
	else:
		return None


def decorateMethod(method: str, rule, **option):
	def decorate(callable):
		logModelName = option.get('logModel', None)
		isBusinessLog = logModelName is not None
		hasDBSession = option.get('hasDBSession', True)
		isLogData = option.get('isLogData', False)
		isRaw = option.get('isRaw', False)
		isHome = option.get('isHome', False)
		if 'hasDBSession' in option: del option['hasDBSession']
		if 'isRaw' in option: del option['isRaw']
		if 'isLogData' in option: del option['isLogData']
		if 'isHome' in option: del option['isHome']
		if isBusinessLog: del option['logModel']
		callable.__ROUTE__ = Route(
			method,
			rule,
			option,
			getRole(callable, option),
			getPermission(callable, option),
			logModelName,
			isBusinessLog,
			hasDBSession,
			isLogData,
			isRaw,
		)
		callable.__RAW__ = isRaw
		callable.__ROUTE__.__IS_HOME__ = isHome
		return callable

	return decorate


def GET(rule, **option):
	return decorateMethod("GET", rule, **option)


def POST(rule, **option):
	return decorateMethod("POST", rule, **option)


def REST(rule, **option):
	return decorateMethod("REST", rule, **option)


def SOCKET(rule, **option):
	return decorateMethod("SOCKET", rule, **option)
