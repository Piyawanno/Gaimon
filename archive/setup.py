#!/usr/bin/env python

import os, sys, site, getpass
from pathlib import Path

__help__ = """Gaimon setup script :
setup : Install dependencies of Gaimon.
install : Install Gaimon into machine.
link : Link package and script into machine, suitable for setting up developing environment.
bdist_wheel : Build wheel file into ./dist
"""

def __conform__(path) :
	isRootPath = False
	splited = path.split("/")
	if len(splited) <= 1: return path
	rootPrefix = ('etc', 'var', 'usr')
	if splited[1] in rootPrefix: isRootPath = True
	if sys.platform == 'win32':
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
	if sys.platform == 'win32': command = f"mklink /D {destination} {source}"
	print(command)
	os.system(command)

def __copy__(source, destination):
	source = __conform__(source)
	destination = __conform__(destination)
	command = f"cp -rfv {source} {destination}"
	if sys.platform == 'win32': command = f"copy {source} {destination}"
	print(command)
	os.system(command)

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
			'gaimon-pdf-to-svg',
		]

		self.extensionScript = [
		]

		self.copyCommand = 'cp'
		if sys.platform == 'win32': self.copyCommand = "copy"
		self.gaimonConfigPath = __conform__('/etc/gaimon/Gaimon.json')
		self.requirePath = [
			'/etc/gaimon',
			'/etc/gaimon/extension',
			'/var/gaimon',
			'/var/gaimon/user',
			'/var/gaimon/log',
		]

		self.installPathList = [
			(f"{self.rootPath}/gaimon", f"{self.sitePackagesPath}/gaimon"),
			(f"{self.rootPath}/gaimon/view", "/var/gaimon/view"),
			(f"{self.rootPath}/gaimon/share", "/var/gaimon/share"),
			(f"{self.rootPath}/gaimon/document", "/var/gaimon/document"),
		]

		self.copyPathList = [
			(f"{self.rootPath}/gaimon/file", "/var/gaimon/file"),
		]
		
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
		elif operation == 'bdist_wheel' :
			self.createWheel()
	
	def createWheel(self) :
		import setuptools
		with open("README.md", encoding="utf-8") as fd :
			description = fd.read()
		
		with open("requirements.txt", encoding="utf-8") as fd :
			requires = fd.read().split("\n")

		setuptools.setup(
			name="gaimon",
			version="0.1",
			author="Kittipong Piyawanno",
			author_email="k.piyawanno@gmail.com",
			description="Gaimon is an open-source ERP application.",
			long_description=description,
			long_description_content_type="text/markdown",
			packages=setuptools.find_packages(),
			include_package_data=True,
			install_requires=requires,
			classifiers=[
				"Programming Language :: Python :: 3",
				"Development Status :: 2 - Pre-Alpha",
				"License :: OSI Approved :: GNU General Public License v2 (GPLv2)",
				"Operating System :: OS Independent",
				"Environment :: Web Environment",
			],
			scripts=[f'script/{i}' for i in self.script] + self.extensionScript,
			python_requires='>=3.8',
		)
	
	def setup(self, platform):
		self.setupBase(platform)
		self.setupPIP()
	
	def setupBase(self, platform) :
		if platform == 'oracle' :
			with open('requirements-centos.txt', encoding="utf-8") as fd :
				content = fd.read()
			self.setupYum(content.replace("\n", " "))
		elif platform == 'debian10' or platform == 'ubuntu20.04':
			with open('requirements-ubuntu-20.04.txt', encoding="utf-8") as fd :
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
		if sys.platform != 'win32': self.installScript()
		self.setData()
		for source, destination in self.installPathList  :
			destination = __conform__(destination)
			source = __conform__(source)
			if not os.path.isdir(destination) :
				__link__(source, destination)
		for source, destination in self.copyPathList  :
			destination = __conform__(destination)
			source = __conform__(source)
			if not os.path.isdir(destination) :
				__copy__(source, destination)
		
	def install(self) :
		self.checkPath()
		print(">>> Installing Gaimon.")
		if '-s' not in sys.argv : self.installConfig()
		else : os.system(f'{self.copyCommand} gaimon/config/Gaimon.example.json {self.gaimonConfigPath}')
		self.installScript()
		self.setData()
		
		pathList = self.installPathList + self.copyPathList
		for source, destination in pathList :
			destination = __conform__(destination)
			source = __conform__(source)
			if not os.path.isdir(destination) :
				__copy__(source, destination)
		
		
	def installConfig(self) :
		path = __conform__("/etc/gaimon")
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
		configPath = __conform__(f"{self.rootPath}/gaimon/config/Database.example.json")
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
		if not os.path.isdir(__conform__('/usr/bin')):
			print(__conform__('/usr/bin'))
			os.makedirs(__conform__('/usr/bin'))
	
	def installScript(self) :
		for i in self.script :
			if not os.path.isfile(f"/usr/bin/{i}") :
				__link__(f"{self.rootPath}/script/{i}", f"/usr/bin/{i}")
		
		for i in self.extensionScript :
			fileName = i.split("/")[-1]
			if not os.path.isfile(f"/usr/bin/{fileName}") :
				item = __conform__(i)
				__link__(f"{self.rootPath}/{item}", f"/usr/bin/{fileName}")
	
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
		path = __conform__("/var/gaimon/")
		if not os.path.isdir(dataPath) :
			os.makedirs(dataPath)
		for i in os.listdir(dataPath) :
			target = f'{path}{i}'
			if not os.path.isfile(target) :
				origin = __conform__(f"{dataPath}/{i}")
				command = f"{self.copyCommand} {origin} {target}"
				print(command)
				os.system(command)
	
def run():
	from argparse import RawTextHelpFormatter
	import argparse
	parser = argparse.ArgumentParser(description=__help__, formatter_class=RawTextHelpFormatter)
	parser.add_argument("operation", help="Operation of setup", choices=['setup', 'install', 'link', 'bdist_wheel'])
	parser.add_argument("-p", "--platform", help="Platform for installation of base environment.", choices=['oracle', 'centos', 'debian10', 'ubuntu20.04'])
	option = parser.parse_args(sys.argv[1:])
	if option.platform is None: option.platform = 'ubuntu20.04'
	if option.operation is None: option.operation = 'build'
	setup = GaimonSetup()
	setup.operate(option.operation, option.platform)

if __name__ == '__main__': run()
