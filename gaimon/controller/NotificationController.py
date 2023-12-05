from gaimon.core.Route import POST
from gaimon.core.RESTResponse import RESTResponse as REST

import pystache

__CURRENT_NUMBER__ = 5


class NotificationController:
	def __init__(self, application):
		from gaimon.core.AsyncApplication import AsyncApplication
		self.application: AsyncApplication = application
		self.title = self.application.title
		self.resourcePath = self.application.resourcePath
		self.renderer = pystache.Renderer()
		self.pull = self.application.createNotificationClient()
		self.push = None

	@POST('/notification/count', role=['user'], hasDBSession=False)
	async def count(self, request):
		return await self.callService(request, '/count')

	@POST('/notification/getPage', role=['user'], hasDBSession=False)
	async def getPage(self, request):
		return await self.callService(request, '/get/page')

	@POST('/notification/search', role=['user'], hasDBSession=False)
	async def search(self, request):
		return await self.callService(request, '/search')

	@POST('/notification/getCurrent', role=['user'], hasDBSession=False)
	async def getCurrent(self, request):
		parameter = {'number': __CURRENT_NUMBER__, }
		return await self.callService(request, '/get/current', parameter)

	@POST('/notification/setAsRead', role=['user'], hasDBSession=False)
	async def setAsRead(self, request):
		return await self.callService(request, '/set/asRead')

	@POST('/notification/getUnread', role=['user'], hasDBSession=False)
	async def getUnread(self, request):
		return await self.callService(request, '/get/unread')

	async def callService(self, request, route, parameter: dict = None):
		from gaimon.controller.NotificationPushHandler import NotificationPushHandler
		requestParameter = dict(request.json)
		requestParameter['uid'] = request.ctx.session['uid']
		if parameter is not None:
			requestParameter.update(parameter)

		result = None
		if self.push is None:
			handlerRoute = NotificationPushHandler.__ROUTE__.rule
			handler: NotificationPushHandler = self.application.websocket.handlerMap.get(
				handlerRoute,
				None
			)
			if handler is not None:
				self.push = handler.push

		if self.push is not None and self.push.isConnected:
			result = await self.push.call(route, requestParameter)
		else:
			result = await self.pull.call(route, requestParameter)
		return REST(result, ensure_ascii=False)
