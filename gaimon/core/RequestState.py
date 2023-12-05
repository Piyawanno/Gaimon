from xerial.AsyncDBSessionBase import AsyncDBSessionBase
from sanic.response import HTTPResponse
from sanic.request import Request
from typing import List, Dict, Any, Callable

import time

class RequestState :
	# NOTE callee : Class method
	callee: Callable
	# NOTE : callable : Object method
	callable: Callable
	request: Request
	argument: List[Any]
	option: Dict[str, Any]
	session: AsyncDBSessionBase
	log: Dict[str, Any]
	start: float
	controller: Any
	hasSession: bool
	isAllowed: bool
	result: HTTPResponse
	errorMessage: str
	uid: int
	permissions: List[str]
	entity: str

	def __init__(self, callee, request:Request, argument: List[Any], option: Dict[str, Any], entity: str = 'main') :
		self.callee = callee
		self.request = request
		self.argument = argument
		self.option = option
		self.session = None
		self.result = None
		self.log = {'entity': 'main'}
		self.entity = entity
		self.start = time.time()
		self.controller = None
		self.hasSession = False
		self.isAllowed = False
		self.uid = request.ctx.session.get('uid', -1)
		self.permissions = request.ctx.session.get('permissions', [])
		if self.callee.__ROUTE__.isLogData :
			self.log['requestData'] = request.json
	
	def setEntity(self, entity:str) :
		self.log['entity'] = entity
		self.entity = entity
	
	def setController(self, controller) :
		self.controller = controller
		self.callable = getattr(controller, self.callee.__name__)
		self.log["extension"] = controller.extensionPath
		self.session = controller.session
	
	async def callRegular(self) :
		self.result = await self.callable(self.request, *self.argument, **self.option)
	
	async def callSocket(self) :
		socket = self.argument[0]
		socket.ping_timeout = None
		argument = self.argument[1:]
		self.result = await self.callable(self.request, socket, *argument, **self.option)
	
	def finalizeResult(self) :
		from gaimon.core.RESTResponse import RESTResponse
		if isinstance(self.result, RESTResponse) :
			self.result = self.result.finalize()
		return self.result
