from sanic import Request

class SecurityChecker :
	def __init__(self, application) :
		from gaimon.core.AsyncApplication import AsyncApplication
		self.application:AsyncApplication = application
	
	async def check(self, request:Request) -> bool:
		return True
