from gaimon.model.User import User
import requests, time, struct


class RESTHandler:
	def __init__(self, rootURL: str):
		self.rootURL = rootURL
		self.session = requests.Session()

	def login(self, user: str, password: str):
		self.user = user
		self.password = password.encode()
		self.loginTime = time.time()
		self.encodedTime = struct.pack('<d', self.loginTime)
		self.getSalt()
		self.saltedPassword = bytes.fromhex(
			User.hashPassword(self.password,
								self.userSalt)
		)
		self.salt = User.getSalt()
		self.hashedPassword = User.hashSaltedPassword(
			self.saltedPassword,
			self.salt,
			self.encodedTime
		)
		data = {
			'username': self.user,
			'hashed': self.hashedPassword.hex(),
			'salt': self.salt.hex(),
			'encodedTime': self.encodedTime.hex()
		}
		url = f"{self.rootURL}authentication/login/checkPermission"
		response = self.session.post(url, json=data)
		result = response.json()
		self.responseToken = result['token']
		return result['isSuccess']

	def getSalt(self):
		data = {'username': self.user}
		url = f"{self.rootURL}authentication/login/getSalt"
		response = self.session.post(url, json=data)
		result = response.json()
		if result['isSuccess']:
			self.userSalt = bytes.fromhex(result['salt'])
		else:
			raise ValueError(result['message'])

	def post(self, URL: str, data: dict):
		headers = {'Authorization': f'Bearer {self.responseToken}'}
		response = self.session.post(URL, json=data, headers=headers)
		if response.status_code != 200:
			raise ValueError(
				f"*** Error from server {response.status_code} {response.text}"
			)
		return response.json()

	def postForm(self, URL: str, data: dict):
		headers = {'Authorization': f'Bearer {self.responseToken}'}
		response = self.session.post(URL, data=data, headers=headers)
		if response.status_code != 200:
			raise ValueError(
				f"*** Error from server {response.status_code} {response.text}"
			)
		return response.json()
