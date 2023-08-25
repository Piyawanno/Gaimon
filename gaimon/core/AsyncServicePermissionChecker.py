from gaimon.core.ServicePermissionChecker import ServicePermissionChecker
from sanic.exceptions import SanicException
from sanic import response
from sanic import Websocket

import traceback, json, inspect, platform, logging

if (int(platform.python_version_tuple()[1]) > 7):
	from asyncio.exceptions import CancelledError
else:
	from concurrent.futures import CancelledError


class AsyncServicePermissionChecker(ServicePermissionChecker):
	async def run(self, request, *argument, **option):
		try:
			service = self.service
			handler = await service.getHandler(self.handlerName)
			callee = getattr(handler, self.callee.__name__)
			if hasattr(callee, '__RAW__') and callee.__RAW__:
				return await self.runRaw(request, callee, *argument, **option)
			else:
				return await self.runREST(request, callee, *argument, **option)
		except CancelledError as error:
			logging.error(f"Operation Canceled {callee.__ROUTE__.rule}")
			return SanicException("Internal Error", status_code=500)
		except:
			print(traceback.format_exc())
			print("*** Error by Checking Permission/Connecting DB")
			return SanicException("Internal Error", status_code=500)

	async def runRaw(self, request, callee, *argument, **option):
		await self.service.prepareHandler(callee.__self__, request, None, self.hasDBSession)
		result = await callee(request, *argument, **option)
		await self.service.releaseHandler(callee.__self__)
		return result

	async def runREST(self, request, callee, *argument, **option):
		payload = request.json
		if self.isAllowed(payload):
			if self.isSocket:
				socket: Websocket = argument[0]
				socket.ping_timeout = None
				argument = argument[1:]
				await self.service.prepareHandler(callee.__self__, request, None, self.hasDBSession)
				result = await callee(
					request,
					socket,
					*argument,
					**option,
					parameter=None
				)
				await self.service.releaseHandler(callee.__self__)
				return response.json(result)
			elif not isinstance(payload, dict):
				await self.service.prepareHandler(callee.__self__, request, None, self.hasDBSession)
				result = await callee(request, *argument, **option, parameter=None)
				await self.service.releaseHandler(callee.__self__)
				return response.json(result)
			else:
				parameter = payload.get('parameter', None)
				await self.service.prepareHandler(callee.__self__, request, parameter, self.hasDBSession)
				result = await callee(request, *argument, **option, parameter=parameter)
				await self.service.releaseHandler(callee.__self__)
				return response.json(result)
		else:
			return SanicException("Unauthorized", status_code=401)

	async def runWebSocket(self, request, parameter, *argument, **option):
		handler = await self.service.getHandler(self.handlerName)
		callee = getattr(handler, self.callee.__name__)
		await self.service.prepareHandler(callee.__self__, request, parameter, self.hasDBSession)
		result = await callee(request, *argument, **option, parameter=parameter)
		await self.service.releaseHandler(callee.__self__)
		return result
