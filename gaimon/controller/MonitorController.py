from gaimon.core.Route import GET, POST
from gaimon.core.RESTResponse import (
	SuccessRESTResponse as Success,
	ErrorRESTResponse as Error,
)
from gaimon.core.AsyncServiceClient import AsyncServiceClient
from sanic import Request

class MonitorController:
	def __init__(self, application):
		from gaimon.core.AsyncApplication import AsyncApplication
		self.application: AsyncApplication = application
		self.extension = self.application.getExtensionInfo()
		self.entity: str = None
	
	@GET('/monitor/get', role=['user'])
	async def getMonitor(self, request: Request):
		
		result = {}
		return Success(result)