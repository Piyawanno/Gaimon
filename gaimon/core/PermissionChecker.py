from xerial.AsyncDBSessionPool import AsyncDBSessionPool
from xerial.AsyncDBSessionBase import AsyncDBSessionBase

from gaimon.core.RequestState import RequestState
from gaimon.core.Authentication import Authentication
from gaimon.core.AsyncServiceClient import AsyncServiceClient
from gaimon.core.Route import Route
from gaimon.core.PermissionDecorator import PermissionRule
from gaimon.core.PreProcessor import PreProcessRule
from gaimon.core.PostProcessor import PostProcessRule
from gaimon.core.SecurityChecker import SecurityChecker
from gaimon.model.UserGroup import UserGroup
from gaimon.model.UserGroupPermission import UserGroupPermission
from gaimon.model.PermissionType import PermissionType
from gaimon.service.businesslog.BusinessLogItem import BusinessLogItem

from sanic.response import HTTPResponse, redirect, text, json as sanicJSON
from sanic import Request
from sanic.exceptions import SanicException
from typing import List, Dict, Any, Callable
from itertools import product

import platform

if (int(platform.python_version_tuple()[1]) > 7):
	from asyncio.exceptions import CancelledError
else:
	from concurrent.futures import CancelledError

import traceback, logging, time


class PermissionChecker:
	authen: Authentication
	route: str
	additionPermission: PermissionRule

	def __init__(self, application, callee, role, permission):
		from gaimon.core.AsyncApplication import AsyncApplication
		self.application: AsyncApplication = application
		self.security = SecurityChecker(self.application)
		self.businessLog: AsyncServiceClient = AsyncServiceClient(
			self.application.config['businessLog']
		)
		self.callee = callee
		self.role = role
		self.permission = permission
		self.permissions = []
		self.isSocket = False
		if permission is None:
			self.permissions = role
		else:
			label = PermissionType.label
			self.permissions = set([f"{i}.{label[j]}" for i, j in product(role, permission)])
		self.controllerName = callee.__self__.__class__.__name__
		self.isSessionEachConnect = False
		self.additionPermission:List[PermissionRule] = []
		self.preProcessor:List[PreProcessRule] = []
		self.postProcessor:List[PostProcessRule] = []
	
	async def checkStateSession(self, state:RequestState) :
		if state.session is None :
			state.session = await self.application.sessionPool.getSession()

	async def checkPermission(self, state:RequestState) :
		state.isAllowed = await self.checkRegularPermission(state)
		if not state.isAllowed : return state.isAllowed
		state.isAllowed = await self.checkAdditionPermission(state)
		return state.isAllowed
	
	async def checkAdditionPermission(self, state:RequestState) :
		if self.additionPermission is None : return True
		for permission in self.additionPermission :
			decorator = permission.getDecorator(self.application)
			if permission.hasDBSession :
				await self.checkStateSession(state)
				decorator.session = state.session
			callee = getattr(decorator, permission.callable.__name__)
			result = await callee(
				state.request, *state.argument, **state.option
			)
			permission.releaseDecorator(decorator)
			if not result : return False
		return True

	async def checkRegularPermission(self, state:RequestState):
		if 'guest' in self.role: return True
		if 'role' in state.request.ctx.session:
			role = set(state.request.ctx.session['role'])
		else:
			role = set()
		if 'root' in role: return True
		await self.checkStateSession(state)
		permissions = await self.authen.getRoleByGroupID(
			state.session, state.request.ctx.session['gid']
		)
		state.request.ctx.session['permission'] = permissions
		permissions = set(permissions)
		if state.uid != -1: permissions.add('user')
		state.permissions = list(permissions)
		if self.role.intersection(role): return True
		if len(permissions.intersection(self.permissions)):
			return True
		else:
			return False

	async def run(self, request: Request, *argument, **option):
		if not await self.security.check(request) :
			return HTTPResponse("Bad request", code=500)
		domainCheck = self.checkDomain(request)
		if domainCheck is not None : return domainCheck
		state = RequestState(self.callee, request, argument, option)
		state.hasSession = self.callee.__ROUTE__.hasDBSession
		controller = self.application.getController(self.controllerName)
		await self.setController(controller)
		state.setController(controller)
		return await self.runState(state)
	
	async def runState(self, state:RequestState) :
		try:
			await self.setSession(state.request)
			await self.checkPermission(state)
			if not state.isAllowed :
				await self.releaseHandler(state)
				return self.createException(state.request, "Unauthorized", 401)
			await self.setControllerConfig(state)
			await self.callPreProcess(state)
			if self.isSocket: await state.callSocket()
			else: await state.callRegular()
			await self.callPostProcess(state)
			self.setInfoLog(state)
			await self.appendBusinessLog(state)
		except CancelledError as error:
			logging.error(f"Operation Canceled {self.callee.__ROUTE__.rule}")
			state.result = self.createException(state.request, "Internal Error", 500)
		except:
			state.errorMessage = "Error by Checking Permission/Connecting DB"
			state.result = None
			self.setErrorLog(state)
			state.result = self.createException(state.request, "Internal Error", 500)
		await self.releaseHandler(state)
		state.finalizeResult()
		return state.result

	async def releaseHandler(self, state:RequestState) :
		if state.session is not None :
			await self.application.sessionPool.release(state.session)
		self.application.releaseController(self.controllerName, state.controller)
		await self.flushLog()

	async def runWebSocket(self, request, uid, *argument, **option):
		state = RequestState(self.callee, request, argument, option)
		state.hasSession = self.callee.__ROUTE__.hasDBSession
		controller = self.application.getController(self.controllerName)
		await self.setController(controller)
		state.setController(controller)
		await self.setControllerConfig(state)
		await self.callPreProcess(state)
		await state.callRegular()
		await self.callPostProcess(state)
		await self.releaseHandler(state)
		state.finalizeResult()
		return state.result

	async def setController(self, controller):
		application = self.application
		self.authen = self.application.authen
		controller.application = application
		controller.theme = application.theme
		controller.authen = application.authen
		if self.callee.__ROUTE__.hasDBSession:
			controller.session = await application.sessionPool.getSession()
			controller.session.model = application.model
			controller.authen.session = controller.session
		else :
			controller.session = None
		controller.entity = 'main'
	
	async def setControllerConfig(self, state:RequestState) :
		uid = state.request.ctx.session['uid']
		handler = self.application.configHandler
		extension = state.controller.extension
		config = await handler.getConfig(uid, 'main', extension)
		state.controller.userConfig = config[0]
		state.controller.entityConfig = config[1]
		state.controller.extensionConfig = config[2]

	async def setSession(self, request: Request):
		request.ctx.session['uid'] = -1
		request.ctx.session['role'] = ['guest']
		request.ctx.session['gid'] = -1
		request.ctx.session['permissions'] = []
		token = None
		if request.credentials:
			token = request.credentials.token
		else:
			token = request.args.get('token', None)

		if token is not None:
			result = await self.authen.checkToken(token)
			if result is not None:
				request.ctx.session['uid'] = result['uid']
				role = set()
				if not result['role'] is None: role = set(filter(lambda a: not a is None, result['role']))
				role.add('user')
				request.ctx.session['role'] = list(role)
				request.ctx.session['gid'] = result['gid']

	def createException(self, request, message, status):
		contentType = request.content_type.split(";")[0]
		if contentType == "application/json":
			return sanicJSON({"message": message}, status=status)
		else:
			return text(message, status=status)

	async def appendBusinessLog(self, state:RequestState):
		route: Route = state.callee.__ROUTE__
		if not route.isBusinessLog: return
		item = BusinessLogItem()
		item.uid = state.uid
		item.data = state.request.json
		item.ID = state.request.json.get('id', None)
		item.modelName = route.logModelName
		item.operation = route.permission
		item.operationTime = time.time()
		await self.businessLog.call('/append', item.toDict())

	async def flushLog(self):
		if self.application.logFlusher is not None:
			await self.application.logFlusher.checkFlush()

	def setLog(self, state:RequestState):
		state.log["request"] = state.request
		state.log["response"] = state.result
		state.log["elapsed"] = int((time.time() - state.start) * 1_000_000) / 1_000.0
		state.log["isAccess"] = True
		state.log["route"] = self.route

	def setInfoLog(self, state:RequestState):
		if state.session is not None :
			state.log["queryCount"] = state.session.queryCount
		else:
			state.log["queryCount"] = 0
		if not self.application.isDevelop:
			self.setLog(state)
			logger = logging.getLogger("gaimon")
			logger.info("", extra=state.log)

	def setErrorLog(self, state:RequestState):
		if not self.application.isDevelop:
			trace = traceback.format_exc()
			state.log["trace"] = trace
			print(trace)
			print(state.errorMessage)
			self.setLog(state)
			logger = logging.getLogger("gaimon")
			logger.error(state.errorMessage, extra=state.log)
		else:
			logging.error(traceback.format_exc())
			logging.error(state.errorMessage)

	async def callPreProcess(self, state:RequestState) :
		if self.preProcessor is None : return True
		for processor in self.preProcessor :
			decorator = processor.getDecorator(self.application)
			if processor.hasDBSession :
				await self.checkStateSession(state)
				decorator.session = state.session
			callee = getattr(decorator, processor.callable.__name__)
			await callee(
				state.request, *state.argument, **state.option
			)
			processor.releaseDecorator(decorator)
	
	async def callPostProcess(self, state:RequestState) :
		if self.postProcessor is None : return True
		for processor in self.postProcessor :
			decorator = processor.getDecorator(self.application)
			if processor.hasDBSession :
				await self.checkStateSession(state)
				decorator.session = state.session
			callee = getattr(decorator, processor.callable.__name__)
			state.result = await callee(
				state.request, state.result, *state.argument, **state.option
			)
			processor.releaseDecorator(decorator)
	
	def checkDomain(self, request:Request) :
		isCheck = self.application.config.get('isCheckDomain', False)
		if not isCheck : return None
		domain = self.application.config.get('domain', None)
		if domain is None : return None
		rootURL = self.application.config['rootURL']
		if request.host != domain : return redirect(rootURL)
	
	@staticmethod
	async def processRole(session, user, isForce=True):
		if user.isRoot: return ['root']
		else:
			groupID = -1
			if not user.gid is None: groupID = int(user.gid)
			groupList = await session.select(
				UserGroupPermission,
				'WHERE gid=%d' % groupID,
				limit=1
			)
			role = ["user"]
			if len(groupList):
				return [role.append(i.toString()) for i in groupList]
			else:
				return role
