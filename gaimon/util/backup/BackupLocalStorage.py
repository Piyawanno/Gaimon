# NOTE
# This module should have the least dependencies,
# because it will be used in local machine without
# Gaimon and its dependencies.

from datetime import datetime
import requests, struct, time, secrets, hashlib, logging, os, zlib, json

HASH_ITERATION = 1_000
HASH_LENGTH = 64
SALT_LENGTH = 64


class BackupLocalStorage:
	def __init__(self, config):
		self.config = config
		self.rootURL = config['rootURL']
		self.user = config['user']
		self.password = config['password'].encode()
		self.storePath = config['storePath']
		self.entity = config['entity']

	def start(self):
		self.checkPath()
		self.session = requests.Session()
		if not self.login():
			logging.error("*** Error by logging in")
			return
		fetched = self.fetch()
		self.store(fetched)

	def fetch(self):
		url = f"{self.rootURL}backup/get"
		data = {
			'entity': self.entity,
			'start': self.getStartDate(),
			'end': datetime.now().strftime('%Y-%m-%d')
		}
		response = self.session.post(url, json=data)
		return json.loads(zlib.decompress(response.content))

	def store(self, data):
		for date, mapped in data.items():
			storePath = f"{self.storePath}/{date}"
			if not os.path.isdir(storePath): os.makedirs(storePath)
			for modelName, rawList in mapped.items():
				path = f"{storePath}/{modelName}-0.zip"
				with open(path, 'wb') as fd:
					fd.write(zlib.compress(json.dumps(rawList).encode()))
				logging.info(f">>> Store {path}")

	def checkPath(self):
		if not os.path.isdir(self.storePath):
			os.makedirs(self.storePath)

	def getStartDate(self):
		path = self.storePath
		yearList = [
			int(i) for i in os.listdir(path)
			if os.path.isdir(f"{path}/{i}") and i.isdigit()
		]
		if len(yearList) == 0: return None
		year = max(yearList)
		path = f"{path}/{year}"
		monthList = [
			int(i) for i in os.listdir(path)
			if os.path.isdir(f"{path}/{i}") and i.isdigit()
		]
		if len(monthList): return None
		month = max(monthList)
		path = f"{path}/{month:02}"
		dayList = [
			int(i) for i in os.listdir(path)
			if os.path.isdir(f"{path}/{i}") and i.isdigit()
		]
		if len(dayList): return None
		day = max(dayList)
		return f"{year}-{month:02}-{day:02}"

	def login(self):
		self.loginTime = time.time()
		self.encodedTime = struct.pack('<d', self.loginTime)
		self.getSalt()
		self.saltedPassword = bytes.fromhex(
			self.hashPassword(self.password,
								self.userSalt)
		)
		self.salt = self.generateSalt()
		self.hashedPassword = self.hashSaltedPassword(
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
		result = RESTResponse()
		return result['isSuccess']

	def hashSaltedPassword(self, saltedPassword, salt, encodedTime):
		joined = b''.join([salt, encodedTime])
		return hashlib.pbkdf2_hmac(
			'SHA512',
			saltedPassword,
			joined,
			HASH_ITERATION,
			HASH_LENGTH
		)

	def hashPassword(self, password, salt):
		return hashlib.pbkdf2_hmac('SHA512',
									password,
									salt,
									HASH_ITERATION,
									HASH_LENGTH).hex()

	def generateSalt(self):
		return secrets.token_bytes(SALT_LENGTH)

	def getSalt(self):
		data = {'username': self.user}
		url = f"{self.rootURL}authentication/login/getSalt"
		response = self.session.post(url, json=data)
		result = RESTResponse()
		if result['isSuccess']:
			self.userSalt = bytes.fromhex(result['salt'])
		else:
			raise ValueError(result['message'])
