from gaimon.util.PathUtil import conform, copy

import os, getpass

class GaimonInitializer:
	def __init__(
		self,
		namespace: str = '',
		wheelPath: str = '',
		isConfig=True,
		isInteractive=False
	):
		self.setNamespace(namespace)
		self.wheelPath = wheelPath
		self.isConfig = isConfig
		self.isInteractive = isInteractive
		self.path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
		self.resourceList = ['/view', '/share', '/file']
		self.configList = [
			(f'Gaimon.example.json', 'Gaimon.json'),
			(f'Redis.example.json', 'Redis.json'),
			(f'Notification.example.json','Notification.json'),
		]

	def setNamespace(self, namespace: str):
		self.namespace = namespace
		if namespace is not None and len(self.namespace):
			self.configPath = conform(f'/etc/gaimon/namespace/{self.namespace}/')
			self.resourcePath = conform(f"/var/gaimon/namespace/{self.namespace}/")
			self.hasNamespace = True
		else:
			self.configPath = '/etc/gaimon/'
			self.resourcePath = '/var/gaimon/'
			self.hasNamespace = False

	def init(self):
		self.installWheel()
		if not os.path.isdir(self.configPath):
			os.makedirs(self.configPath)
		if not os.path.isdir(self.resourcePath):
			os.makedirs(self.resourcePath)
		if self.isConfig: self.installConfig()
		self.setResourcePath()

	def installWheel(self):
		import pip
		if not self.hasNamespace: return
		if not os.path.isdir(self.wheelPath):
			raise RuntimeError(f"Wheel path {self.wheelPath} not found.")
		packagePath = f'/var/gaimon/package/{self.namespace}'
		if not os.path.isdir(packagePath): os.makedirs(packagePath)
		parameter = [
			'install',
			'--force-reinstall',
			'-t',
			packagePath,
			'--upgrade',
			'--find-links',
			self.wheelPath
		]
		parameter.extend([f'{self.wheelPath}/{i}' for i in os.listdir(self.wheelPath)])
		print(parameter)
		pip.main(parameter)

	def setResourcePath(self):
		if not os.path.isdir(self.resourcePath):
			os.makedirs(self.resourcePath)

		for i in self.resourceList:
			target = f'{self.resourcePath}/{i}'
			if not os.path.isdir(target):
				copy(f"{self.path}/{i}", target, True)

	def installConfig(self):
		if not os.path.isdir(self.configPath):
			os.makedirs(self.configPath)
		self.setDBConfig()
		for source, destination in self.configList:
			targetPath = conform(f"{self.configPath}/{destination}")
			if not os.path.isfile(targetPath):
				sourcePath = conform(f"{self.path}/config/{source}")
				copy(sourcePath, targetPath)

	def setDBConfig(self):
		path = f"{self.configPath}/Database.json"
		if os.path.isfile(path): return
		if self.isInteractive:
			parameter = self.getParameter()
		else:
			parameter = self.getENVParameter()
		with open(
			"%s/config/Database.example.json" % (self.path),
			"rt",
			encoding="utf-8"
		) as source:
			raw = source.read()
			raw = raw.replace('"DB_PORT"', "DB_PORT")
			raw = raw.replace('"DB_VENDOR"', "DB_VENDOR")
			for k, v in parameter.items():
				raw = raw.replace(k, v)
			with open(path, "wt") as target:
				target.write(raw)

	def getENVParameter(self):
		parameter = {}
		parameter['DB_HOST'] = os.environ["GAIMON_DB_HOST"]
		parameter['DB_PORT'] = os.environ["GAIMON_DB_PORT"]
		parameter['DB_NAME'] = os.environ["GAIMON_DB_NAME"]
		parameter['DB_USER'] = os.environ["GAIMON_DB_USER"]
		parameter['DB_PASSWORD'] = os.environ["GAIMON_DB_PASSWORD"]
		parameter['DB_VENDOR'] = os.environ["GAIMON_DB_VENDOR"]

	def getParameter(self):
		parameter = {}
		parameter['DB_HOST'] = input("DB host : ")
		parameter['DB_PORT'] = input("DB port : ")
		parameter['DB_NAME'] = input("DB : ")
		parameter['DB_USER'] = input("DB user : ")
		parameter['DB_PASSWORD'] = getpass.getpass("DB password : ")
		vendor = input("DB vendor (1=PostgeSQL, 2=MariaDB, 3=MySQL, 4=Oracle) : ")
		try:
			vendor = int(vendor)
			if vendor > 4:
				print(
					"*** Warning : Vendor %d is not defined, will be set to MariaDB." %
					(vendor)
				)
				parameter['DB_VENDOR'] = "2"
			else:
				parameter['DB_VENDOR'] = str(vendor)
		except:
			print("*** Warning : Vendor cannot be parsed, will be set to MariaDB.")
			parameter['DB_VENDOR'] = "2"
		if parameter['DB_VENDOR'] == "4":
			parameter['DB_DOMAIN'] = input("DB domain : ")
		return parameter

if __name__ == '__main__' :
	initializer = GaimonInitializer(namespace='production', wheelPath='/usr/lib/python3/dist-packages/')
	initializer.installWheel()