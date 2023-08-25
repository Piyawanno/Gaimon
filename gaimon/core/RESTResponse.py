from sanic import response
from typing import Dict, Any

class RESTResponse :
	data: Dict[str, Any]
	ensureASCII: bool
	status: int
	content_type: str

	def __init__(
			self,
			data:Dict[str, Any],
			ensure_ascii:bool=False,
			status:int=200
		) :
		self.data = data
		self.ensureASCII = ensure_ascii
		self.status = status
		self.content_type = 'application/json'
	
	def finalize(self) :
		return response.json(
			self.data,
			ensure_ascii=self.ensureASCII,
			status=self.status,
			content_type=self.content_type,
		)

class ErrorRESTResponse (RESTResponse) :
	def __init__(
			self,
			message:str,
			ensure_ascii:bool=False,
			status:int=200
		) :
		RESTResponse.__init__(self, {
			'isSuccess' : False,
			'message' : message
		}, ensure_ascii, status)

class SuccessRESTResponse (RESTResponse) :
	def __init__(
			self,
			data:Dict[str, Any]=None,
			ensure_ascii:bool=False,
			status:int=200
		) :
		if data is None :
			RESTResponse.__init__(self, {
				'isSuccess' : True
			}, ensure_ascii, status)
		else :
			RESTResponse.__init__(self, {
				'isSuccess' : True,
				'result' : data
			}, ensure_ascii, status)