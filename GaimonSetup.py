#!/usr/bin/env python3

import os, sys, site, getpass
from pathlib import Path

__help__ = """Gaimon setup script :
setup : Install dependencies of Gaimon.
install : Install Gaimon into machine.
link : Link package and script into machine, suitable for setting up developing environment.
uninstall : Uninstall Gaimon from machine (config & data will not be removed).
"""

IS_WINDOWS = sys.platform in ['win32', 'win64']
IS_VENV = sys.prefix != sys.base_prefix


def __conform__(path) :
	isRootPath = False
	splited = path.split("/")
	if len(splited) <= 1: return path
	rootPrefix = ('etc', 'var', 'usr')
	if splited[1] in rootPrefix: isRootPath = True
	if IS_WINDOWS:
		result = os.sep.join([i for i in splited if len(i)])
		if isRootPath: result = str(Path.home()) + os.sep + result
		if path[-1] == "/": result = result + os.sep
		return result
	result = "/"+("/".join([i for i in splited if len(i)]))
	if isRootPath: result = '/' + result
	if path[-1] == "/": result = result + "/"
	return result

def __link__(source, destination):
	source = __conform__(source)
	destination = __conform__(destination)
	command = f"ln -s {source} {destination}"
	if IS_WINDOWS: command = f"mklink /D {destination} {source}"
	print(command)
	os.system(command)

def __copy__(source, destination):
	source = __conform__(source)
	destination = __conform__(destination)
	command = f"cp -rfv {source} {destination}"
	if IS_WINDOWS: command = f"copy {source} {destination}"
	print(command)
	os.system(command)

def __linkEach__(source, destination):
	for i in os.listdir(source):
		target = f'{destination}{i}'
		if not os.path.exists(target):
			__link__(f'{source}/{i}', target)

def __copyEach__(source, destination):
	for i in os.listdir(source):
		target = f'{destination}{i}'
		if not os.path.exists(target):
			__copy__(f'{source}/{i}', target)

class GaimonSetup :
	def __init__(self) :
		self.rootPath = os.path.dirname(os.path.abspath(__file__))
		self.getSitePackagePath()
		self.script = [
			'gaimon',
			'gaimon-notification',
			'gaimon-docker-prepare',
			'gaimon-module-create',
			'gaimon-extension-create',
			'gaimon-extension-init',
			'gaimon-extension-enable',
			'gaimon-mvc-create',
			'gaimon-display-create',
			'gaimon-user-create',
			'gaimon-initializer-create',
			'gaimon-backup-cron',
			'gaimon-backup-restore',
			'gaimon-backup-local',
			'gaimon-controller-create',
			'gaimon-businesslog',
			'gaimon-init',
			'gaimon-export',
			'gaimon-monitor',
			'gaimon-generate-registration',
			'gaimon-password-renew',
			'gaimon-log-analyze',
			'gaimon-service',
			'gaimon-namespace-init',
			'gaimon-namespace-package',
			'gaimon-code-format',
			'gaimon-checkout',
			'gaimon-model-freeze',
			'gaimon-backup-full'
		]

		self.extensionScript = [
		]

		self.checkBasePath()
		self.copyCommand = 'cp'
		if IS_WINDOWS: self.copyCommand = "copy"
		self.gaimonConfigPath = __conform__(f'{self.configPath}/gaimon/Gaimon.json')
		self.requirePath = [
			f'{self.configPath}/gaimon',
			f'{self.configPath}/gaimon/extension',
			f'{self.resourcePath}/gaimon',
			f'{self.resourcePath}/gaimon/share/',
			f'{self.resourcePath}/gaimon/file/',
			f'{self.resourcePath}/gaimon/document/',
			f'{self.resourcePath}/gaimon/view/',
			f'{self.resourcePath}/gaimon/config',
			f'{self.resourcePath}/gaimon/user',
			f'{self.resourcePath}/gaimon/user/config',
			f'{self.resourcePath}/gaimon/log',
			f'{self.resourcePath}/gaimon/extension',
			f'{self.resourcePath}/gaimon/database',
			f'{self.resourcePath}/gaimon/namespace',
		]

		self.installPathList = [
			(f"{self.rootPath}/gaimon/view", f"{self.resourcePath}/gaimon/view/"),
			(f"{self.rootPath}/gaimon/share", f"{self.resourcePath}/gaimon/share/"),
			(f"{self.rootPath}/gaimon/file", f"{self.resourcePath}/gaimon/file/"),
			(f"{self.rootPath}/gaimon/document", f"{self.resourcePath}/gaimon/document/"),
		]

		self.copyPathList = [
			(f"{self.rootPath}/gaimon/file", f"{self.resourcePath}/gaimon/file"),
		]
		
		self.configList = [
			(f'Gaimon.json', 'Gaimon.json'),
			(f'Export.json', 'Export.json'),
			(f'Redis.json', 'Redis.json'),
			(f'Notification.json', 'Notification.json'),
			(f'BackupCron.json', 'BackupCron.json'),
			(f'BackupLocal.json', 'BackupLocal.json'),
			(f'BusinessLog.json', 'BusinessLog.json'),
			(f'ServiceStarter.json', 'ServiceStarter.json'),
			(f'ServiceMonitor.json', 'ServiceMonitor.json'),
			# (f'GaimonCheckout.json', 'GaimonCheckout.json'),
		]
	
	def checkBasePath(self):
		if IS_VENV :
			self.configPath = __conform__(f'{sys.prefix}/etc')
			self.resourcePath = __conform__(f'{sys.prefix}/var')
			self.scriptPath = __conform__(f'{sys.prefix}/bin')
			if not os.path.isdir(self.configPath): os.makedirs(self.configPath)
			if not os.path.isdir(self.resourcePath): os.makedirs(self.resourcePath)
		else:
			self.configPath = '/etc'
			self.resourcePath = '/var'
			self.scriptPath = '/usr/bin'

	def getSitePackagePath(self) :
		self.sitePackagesPath = ''
		for path in site.getsitepackages()[::-1]:
			if os.path.isdir(path): 
				self.sitePackagesPath = path
				break
		return self.sitePackagesPath

	def operate(self, operation, platform) :
		if operation == 'setup' :
			self.setup(platform)
		elif operation == 'link' :
			self.link()
		elif operation == 'install' :
			self.install()
		elif operation == 'uninstall' :
			self.uninstall()

	def uninstall(self):
		self.uninstallScript()
		self.uninstallLibrary()
	
	def uninstallScript(self):
		for i in self.script :
			if IS_WINDOWS: continue
			if os.path.exists(f"{self.scriptPath}/{i}"):
				print(f">>> Remove {self.scriptPath}/{i}")
				os.unlink(f"{self.scriptPath}/{i}")
		
		for i in self.extensionScript :
			fileName = i.split("/")[-1]
			if IS_WINDOWS: continue
			if os.path.exists(f"{self.scriptPath}/{fileName}"):
				print(f">>> Remove {self.scriptPath}/{fileName}")
				os.unlink(f"{self.scriptPath}/{fileName}")

	def uninstallLibrary(self):
		packagePath = f"{self.sitePackagesPath}/gaimon"
		if os.path.exists(packagePath):
			print(f'>>> Remove {packagePath}')
			os.unlink(packagePath)
	
	def setup(self, platform):
		self.setupBase(platform)
		self.setupPIP()
	
	def setupBase(self, platform) :
		if 'oracle' in platform or 'centos' in platform:
			with open('requirements-centos.txt', encoding="utf-8") as fd :
				content = fd.read()
			self.setupYum(content.replace("\n", " "))
		elif 'debian' in platform or 'ubuntu' in platform:
			with open('requirements-ubuntu.txt', encoding="utf-8") as fd :
				content = fd.read()
			self.setupAPT(content.split("\n"))
		else :
			print("*** Error Not support for platform")
			print("*** Supported platform : debian10, ubuntu20.04, oracle")
			print("*** Example : ./setup.py setup debian10")
	
	def setupYum(self, packageList) :
		command = 'yum install %s'%(" ".join(packageList))
		print(command)
		os.system(command)

	def setupAPT(self, packageList) :
		command = 'apt-get install -y %s'%(" ".join(packageList))
		print(command)
		os.system(command)

	def setupPIP(self) :
		print(">>> Installing pip package.")
		with open('requirements.txt', encoding="utf-8") as fd :
			content = fd.read()

		import platform
		subversion = int(platform.python_version().split('.')[1])
		if subversion >= 11:
			command = "pip3 install --break-system-packages %s"%(content.replace("\n", " "))
		else:
			command = "pip3 install %s"%(content.replace("\n", " "))

		print(command)
		os.system(command)
		
	def link(self) :
		self.checkPath()
		self.installConfig()
		self.installScript(isLink=True)
		self.setData()
		packagePath = f"{self.sitePackagesPath}/gaimon"
		if not os.path.isdir(packagePath):
			__link__(f"{self.rootPath}/gaimon", packagePath)

		for source, destination in self.installPathList  :
			destination = __conform__(destination)
			source = __conform__(source)
			print(source, destination)
			__linkEach__(source, destination)
		
	def install(self) :
		self.checkPath()
		print(">>> Installing Gaimon.")
		self.installConfig()
		self.installScript(isLink=False)
		self.setData()

		packagePath = f"{self.sitePackagesPath}/gaimon"
		if not os.path.isdir(packagePath):
			__copy__(f"{self.rootPath}/gaimon", packagePath)
		
		for source, destination in self.installPathList :
			destination = __conform__(destination)
			source = __conform__(source)
			if not os.path.isdir(destination) :
				__copyEach__(source, destination)
		
	def installConfig(self) :
		path = __conform__(f"{self.configPath}/gaimon")
		for source, destination in self.configList :
			destinationPath = __conform__(f"{path}/{destination}")
			if not os.path.isfile(destinationPath) :
				sourcePath = __conform__(f"{self.rootPath}/gaimon/config/{source}")
				command = f"{self.copyCommand} {sourcePath} {destinationPath}"
				print(command)
				os.system(command)

		if not os.path.isdir(path) :
			os.makedirs(path)
		if os.path.isfile(f'{path}/Database.json') : 
			return
		parameter = self.getParameter()
		configPath = __conform__(f"{self.rootPath}/gaimon/config/Database.json")
		with open(configPath, "rt", encoding="utf-8") as source :
			raw = source.read()
			raw = raw.replace('"DB_PORT"', "DB_PORT")
			raw = raw.replace('"DB_VENDOR"', "DB_VENDOR")
			for k, v in parameter.items() :
				raw = raw.replace(k, v)
			dbConfigPath = __conform__(f'{path}/Database.json')
			with open(dbConfigPath, "wt") as target :
				target.write(raw)
		
	def checkPath(self) :
		for i in self.requirePath :
			i = __conform__(i)
			if not os.path.isdir(i) :
				os.makedirs(i)
		if not os.path.isdir(__conform__(self.scriptPath)):
			print(__conform__(self.scriptPath))
			os.makedirs(__conform__(self.scriptPath))
	
	def installScript(self, isLink=True) :
		for i in self.script :
			if not os.path.isfile(f"{self.scriptPath}/{i}") :
				if IS_WINDOWS: continue
				if isLink: __link__(f"{self.rootPath}/script/{i}", f"{self.scriptPath}/{i}")
				else: __copy__(f"{self.rootPath}/script/{i}", f"{self.scriptPath}/{i}")
		
		for i in self.extensionScript :
			fileName = i.split("/")[-1]
			if not os.path.isfile(f"{self.scriptPath}/{fileName}") :
				item = __conform__(i)
				if IS_WINDOWS: continue
				if isLink: __link__(f"{self.rootPath}/{item}", f"{self.scriptPath}/{fileName}")
				else: __copy__(f"{self.rootPath}/{item}", f"{self.scriptPath}/{fileName}")
	
	def getParameter(self) :
		parameter = {}
		parameter['DB_HOST'] = input("DB host : ")
		parameter['DB_PORT'] = input("DB port : ")
		parameter['DB_NAME'] = input("DB : ")
		parameter['DB_USER'] = input("DB user : ")
		parameter['DB_PASSWORD'] = getpass.getpass("DB password : ")
		vendor = input("DB vendor (1=PostgeSQL, 2=MariaDB, 3=MySQL, 4=Oracle) : ")
		try :
			vendor = int(vendor)
			if vendor > 4 :
				print("*** Warning : Vendor %d is not defined, will be set to MariaDB."%(vendor))
				parameter['DB_VENDOR'] = "2"
			else :
				parameter['DB_VENDOR'] = str(vendor)
		except :
			print("*** Warning : Vedor cannot be parsed, will be set to MariaDB.")
			parameter['DB_VENDOR'] = "2"
		if parameter['DB_VENDOR'] == "4" :
			parameter['DB_DOMAIN'] = input("DB domain : ")
		return parameter

	def setData(self) :
		dataPath = __conform__(f'{self.rootPath}/gaimon/data/')
		path = __conform__(f"{self.resourcePath}/gaimon/")
		if not os.path.isdir(dataPath) :
			os.makedirs(dataPath)
		for i in os.listdir(dataPath) :
			target = f'{path}{i}'
			if not os.path.isfile(target) :
				origin = __conform__(f"{dataPath}/{i}")
				command = f"{self.copyCommand} {origin} {target}"
				print(command)
				os.system(command)
	

if __name__ == '__main__' :
	from argparse import RawTextHelpFormatter
	import argparse
	parser = argparse.ArgumentParser(description=__help__, formatter_class=RawTextHelpFormatter)
	parser.add_argument("operation", help="Operation of setup", choices=['setup', 'install', 'link', 'uninstall'])
	parser.add_argument("-p", "--platform", help="Platform for installation of base environment.", choices=['oracle', 'centos', 'debian', 'ubuntu'])
	option = parser.parse_args(sys.argv[1:])
	if option.platform is None : option.platform = 'ubuntu20.04'
	setup = GaimonSetup()
	setup.operate(option.operation, option.platform)
