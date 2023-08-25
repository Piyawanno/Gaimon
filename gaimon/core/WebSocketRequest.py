from sanic import Request


class WebSocketRequest:
	def __init__(self, request: Request, parameter: dict):
		self.json = parameter
		self.ctx = request.ctx
		self.credentials = request.credentials
