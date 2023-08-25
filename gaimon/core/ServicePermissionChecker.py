from flask import request

import traceback, json, struct, hashlib, time, inspect, logging, platform

if (int(platform.python_version_tuple()[1]) > 7):
	from asyncio.exceptions import CancelledError
else:
	from concurrent.futures import CancelledError

HASH_ITERATION = 1_000
HASH_LENGTH = 256
SALT_LENGTH = 64


class ServicePermissionChecker:
	def __init__(self, service, callee, isCheckPermission):
		self.service = service
		self.callee = callee
		self.hasDBSession = self.callee.__ROUTE__.hasDBSession
		self.handlerName = callee.__self__.__class__.__name__
		self.isCheckPermission = isCheckPermission
		self.isSocket = False

	@staticmethod
	def getHash(password, salt, encodedTime):
		concatenated = b''.join([salt, encodedTime])
		return hashlib.pbkdf2_hmac(
			'SHA512',
			password,
			concatenated,
			HASH_ITERATION,
			HASH_LENGTH
		).hex()

	def isAllowed(self, request):
		if self.isCheckPermission:
			now = time.time()
			encodedTime = bytes.fromhex(request['time'])
			requestTime, = struct.unpack('<d', encodedTime)
			if request['user'] == self.service.user:
				if now - requestTime < self.service.hashTime:
					salt = bytes.fromhex(request['salt'])
					hashed = ServicePermissionChecker.getHash(
						self.service.password,
						salt,
						encodedTime
					)
					return request['hashed'] == hashed
			return False
		else:
			return True

	def run(self, *argument, **option):
		try:
			service = self.service
			handler = service.getHandler(self.handlerName)
			callee = getattr(handler, self.callee.__name__)
			if hasattr(callee, '__RAW__') and callee.__RAW__:
				self.runRaw()
			else:
				self.runREST(request, callee, *argument, **option)
		except CancelledError as error:
			logging.error(f"Operation Canceled {callee}")
			return "Internal Error", 500
		except:
			print(traceback.format_exc())
			print("*** Error by Checking Permission/Connecting DB")
			return "Internal Error", 500

	def runRaw(self, request, callee, *argument, **option):
		self.service.prepareHandler(callee.__self__, request, None, self.hasDBSession)
		result = callee(request, *argument, **option)
		self.service.releaseHandler(callee.__self__)
		return result

	def runREST(self, request, callee, *argument, **option):
		payload = json.loads(request.data) if len(request.data) else None
		if self.isAllowed(payload):
			if not isinstance(payload, dict):
				self.service.prepareHandler(callee.__self__, request, parameter, self.hasDBSession)
				result = callee(request, *argument, **option, parameter=None)
				self.service.releaseHandler(callee.__self__)
				return result
			else:
				parameter = payload.get('parameter', None)
				self.service.prepareHandler(callee.__self__, request, parameter, self.hasDBSession)
				result = callee(request, *argument, **option, parameter=parameter)
				self.service.releaseHandler(callee.__self__)
				return result
		else:
			return "Unauthorized", 401
