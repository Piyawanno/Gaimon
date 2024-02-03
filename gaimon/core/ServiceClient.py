from gaimon.core.ServicePermissionChecker import ServicePermissionChecker, SALT_LENGTH

import json, requests, time, secrets, struct


class ServiceClient:
	def __init__(self, config: dict):
		self.config = config
		isHTTPS = config.get('isHTTPS', False)
		if isHTTPS:
			self.rootURL = f"https://{config['host']}/"
		else:
			self.rootURL = f"http://{config['host']}:{config['port']}/"
		user = config.get('user', None)
		password = config.get('password', None)
		if user is None:
			self.isCheckPermission = False
		else:
			self.user = user
			self.password = password.encode()
			self.isCheckPermission = True
		self.ID = config.get('ID', None)
		self.lastCheck = -1.0

	def call(self, route, parameter=None, payload=None, headers=None, entity:str='main'):
		headers = {} if headers is None else headers
		if self.isCheckPermission:
			body = json.dumps(self.getPermissionPayLoad(parameter))
			response = requests.post(self.rootURL + route[1:], data=body, headers=headers)
		else:
			if payload is None:
				body = json.dumps({'parameter': parameter})
				response = requests.post(
					self.rootURL + route[1:],
					data=body,
					headers=headers
				)
			else:
				response = requests.post(
					self.rootURL + route[1:],
					json=payload,
					headers=headers
				)
		if response.status_code == 200:
			return json.loads(response.text)
		else:
			print("*** Error : ", response.status_code)

	def getPermissionPayLoad(self, parameter: dict):
		now = time.time()
		encodedTime = struct.pack('<d', now)
		salt = secrets.token_bytes(SALT_LENGTH)
		hashed = ServicePermissionChecker.getHash(self.password, salt, encodedTime)
		return {
			'user': self.user,
			'hashed': hashed,
			'salt': salt.hex(),
			'time': encodedTime.hex(),
			'parameter': parameter
		}
