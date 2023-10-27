from gaimon.util.PathUtil import conform, copy, link

import os, sys, gaimon, pip, json, importlib


class NameSpaceInitializer:
	def __init__(self, namespace: str):
		self.namespace = namespace
		self.gaimonConfigPath = conform(
			f'/etc/gaimon/namespace/{self.namespace}/Gaimon.json'
		)

		self.rootPath = None
		for i in gaimon.__path__:
			if os.path.isdir(i):
				self.rootPath = i
				break
		if self.rootPath is None:
			raise RuntimeError("Root path of Gaimon does not exist.")

		self.configList = [
			(f'Gaimon.example.json', 'Gaimon.json'),
			(f'Export.example.json', 'Export.json'),
			(f'Redis.example.json', 'Redis.json'),
			(f'Notification.example.json', 'Notification.json'),
			(f'BackupCron.example.json', 'BackupCron.json'),
			(f'BackupLocal.example.json', 'BackupLocal.json'),
			(f'BusinessLog.example.json', 'BusinessLog.json'),
			(f'ServiceStarter.example.json', 'ServiceStarter.json'),
			(f'ServiceMonitor.example.json', 'ServiceMonitor.json'),
		]

		self.requirePath = [
			f'/etc/gaimon/namespace/{self.namespace}',
			f'/etc/gaimon/namespace/{self.namespace}/extension',
			f'/var/gaimon/namespace/{self.namespace}',
			f'/var/gaimon/namespace/{self.namespace}/user',
			f'/var/gaimon/namespace/{self.namespace}/log',
		]

		self.installPathList = [
			(f"{self.rootPath}/view",
				f"/var/gaimon/namespace/{self.namespace}/view"),
			(f"{self.rootPath}/share",
				f"/var/gaimon/namespace/{self.namespace}/share"),
			(
				f"{self.rootPath}/document",
				f"/var/gaimon/namespace/{self.namespace}/document"
			),
		]

		self.copyPathList = [
			(f"{self.rootPath}/file",
				f"/var/gaimon/namespace/{self.namespace}/file"),
		]

	def installPackage(self, requirementPath:str) :
		self.installPIP(requirementPath)
		self.linkPackage()
	
	def linkPackage(self) :
		with open('/etc/gaimon/Gaimon.json') as fd :
			config = json.load(fd)

		extension = config['extension']
		path = '/etc/gaimon/Extension.json'
		if os.path.isfile(path) :
			with open(path) as fd :
				extension.extend(json.load(fd))

		module = set()
		for i in extension :
			module.add(i.split('.')[0])

		for i in module :
			targetPath = f'/var/gaimon/package/{self.namespace}/{i}'
			if os.path.exists(targetPath) : continue
			imported = importlib.import_module(i)
			for j in imported.__path__ :
				if not os.path.isdir(j) : continue
				link(j, targetPath)
				break

	def installPIP(self, requirementPath:str) :
		command = ' '.join([
			'pip3',
			'install',
			'-r',
			requirementPath,
			'--force-reinstall',
			'--ignore-installed',
			'--upgrade',
			f'--target=/var/gaimon/package/{self.namespace}/'
		])
		print(command)
		os.system(command)

	def operate(self, operation):
		if operation == 'link':
			self.link()
		elif operation == 'install':
			self.install()

	def link(self):
		self.checkPath()
		self.installConfig()
		self.setData()
		for source, destination in self.installPathList:
			destination = conform(destination)
			source = conform(source)
			if not os.path.isdir(destination):
				link(source, destination)
		for source, destination in self.copyPathList:
			destination = conform(destination)
			source = conform(source)
			if not os.path.isdir(destination):
				copy(source, destination, isFolder=True)

	def install(self):
		self.checkPath()
		print(">>> Installing Gaimon.")
		if '-s' not in sys.argv: self.installConfig()
		else:
			os.system(
				f'{self.copyCommand} gaimon/config/Gaimon.example.json {self.gaimonConfigPath}'
			)
		self.setData()

		pathList = self.installPathList + self.copyPathList
		for source, destination in pathList:
			destination = conform(destination)
			source = conform(source)
			if not os.path.isdir(destination):
				copy(source, destination, isFolder=True)

	def checkPath(self):
		for i in self.requirePath:
			i = conform(i)
			if not os.path.isdir(i):
				os.makedirs(i)

	def installConfig(self):
		path = conform(f"/etc/gaimon/namespace/{self.namespace}/")
		if os.path.isfile(path): os.makedirs(path)

		for source, destination in self.configList:
			destinationPath = conform(f"{path}/{destination}")
			if not os.path.isfile(destinationPath):
				sourcePath = conform(f"{self.rootPath}/config/{source}")
				copy(sourcePath, destinationPath)

		if os.path.isfile(self.gaimonConfigPath):
			return
		parameter = self.getParameter()
		configPath = conform(f"{self.rootPath}/config/Database.example.json")
		with open(configPath, "rt", encoding="utf-8") as source:
			raw = source.read()
			raw = raw.replace('"DB_PORT"', "DB_PORT")
			raw = raw.replace('"DB_VENDOR"', "DB_VENDOR")
			for k, v in parameter.items():
				raw = raw.replace(k, v)
			dbConfigPath = conform(f'{path}/Database.json')
			with open(dbConfigPath, "wt") as target:
				target.write(raw)

	def setData(self):
		dataPath = conform(f'{self.rootPath}/data/')
		path = conform(f"/var/gaimon/namespace/{self.namespace}/")
		print(f">>> Data path {dataPath}")
		if not os.path.isdir(dataPath):
			print("*** Data path does not exist.")
			return
		for i in os.listdir(dataPath):
			target = conform(f'{path}/{i}')
			if not os.path.isfile(target):
				origin = conform(f"{dataPath}/{i}")
				if os.path.isfile(origin):
					copy(origin, target)
				elif os.path.isdir(origin):
					copy(origin, target, isFolder=True)
			else:
				print(f">>> Data {target} already exists.")
