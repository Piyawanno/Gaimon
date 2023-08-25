#!/usr/bin/python3

import os, sys, site, setuptools
from gaimon.util.PathUtil import conform, link, copy

__help__ = """{moduleName} setup script :
setup : Install dependencies of Gaimon.
install : Install {moduleName} into machine.
link : Link package and script into machine, suitable for setting up developing environment.
bdist_wheel : Build wheel file into ./dist
"""

class {moduleName}Setup :
	def __init__(self) :
		self.rootPath = os.path.dirname(os.path.abspath(__file__))
		self.sitePackagesPath = ''
		for path in site.getsitepackages()[::-1]:
			if os.path.isdir(path): 
				self.sitePackagesPath = path
				break
		self.script = [
		]

		self.extensionScript = [
		]
		
		self.requirePath = [
			'/etc/gaimon/extension',
		]

		self.installPathList = [
			(f"{{self.rootPath}}/{modulePath}", f"{{self.sitePackagesPath}}/{modulePath}"),
		]

		self.configList = [
		]

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
		with open("README.md") as fd :
			description = fd.read()
		
		with open("requirements.txt") as fd :
			requires = fd.read().split("\n")

		setuptools.setup(
			name="talk",
			version="0.1",
			author="Kittipong Piyawanno",
			author_email="k.piyawanno@gmail.com",
			description="{moduleName}",
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
			scripts=[f'script/{{i}}' for i in self.script] + self.extensionScript,
			python_requires='>=3.8',
		)
	
	def setup(self, platform):
		self.setupBase(platform)
		self.setupPIP()
	
	def setupBase(self, platform) :
		if platform == 'oracle' :
			with open('requirements-centos.txt') as fd :
				content = fd.read()
			if len(content) :
				self.setupYum(content.replace("\n", " "))
		elif platform == 'debian10' or platform == 'ubuntu20.04':
			with open('requirements-ubuntu-20.04.txt') as fd :
				content = fd.read()
			if len(content) :
				self.setupAPT(content.replace("\n", " "))
		else :
			print("*** Error Not support for platform")
			print("*** Supported platform : debian10, ubuntu20.04, oracle")
			print("*** Example : ./setup.py setup debian10")
	
	def setupYum(self, packageList) :
		command = 'yum install %s'%(" ".join(packageList))
		print(command)
		os.system(command)

	def setupAPT(self, packageList) :
		command = 'apt-get install %s'%(" ".join(packageList))
		print(command)
		os.system(command)

	def setupPIP(self) :
		print(">>> Installing pip package.")
		with open('requirements.txt') as fd :
			content = fd.read()
		if len(content) :
			command = "pip3 install %s"%(content.replace("\n", " "))
			print(command)
			os.system(command)
		
	def link(self) :
		self.checkPath()
		self.installConfig()
		self.installScript()
		self.setData()
		for source, destination in self.installPathList  :
			print(source, destination)
			if not os.path.isdir(conform(destination)) :
				link(source, destination)
		
	def install(self) :
		self.checkPath()
		self.installScript()
		self.setData()
		for source, destination in self.installPathList  :
			if not os.path.isdir(conform(destination)) :
				copy(source, destination)
		
		
	def installConfig(self) :
		path = conform("/etc/gaimon")
		if not os.path.isdir(path) :
			os.makedirs(path)
		for source, destination in self.configList :
			destinationPath = conform(f"/etc/gaimon/{{destination}}")
			if not os.path.isfile(destinationPath) :
				sourcePath = conform(f"{{self.rootPath}}/gaimon/config/{{source}}")
				copy(sourcePath, destinationPath)
	
	def checkPath(self) :
		for i in self.requirePath :
			i = conform(i)
			if not os.path.isdir(i) :
				os.makedirs(i)
	
	def installScript(self) :
		for i in self.script :
			if not os.path.isfile(conform(f"/usr/bin/{{i}}")) :
				link(f"{{self.rootPath}}/script/{{i}}",  f"/usr/bin/{{i}}")
		
		for i in self.extensionScript :
			i = conform(i)
			fileName = i.split(os.sep)[-1]
			if not os.path.isfile(conform(f"/usr/bin/{{fileName}}")) :
				link(f"{{self.rootPath}}/{{i}}", f"/usr/bin/{{fileName}}")
	

	def setData(self) :
		pass

if __name__ == '__main__' :
	from argparse import RawTextHelpFormatter
	import argparse
	parser = argparse.ArgumentParser(description=__help__, formatter_class=RawTextHelpFormatter)
	parser.add_argument("operation", help="Operation of setup", choices=['setup', 'install', 'link', 'bdist_wheel'])
	parser.add_argument("-p", "--platform", help="Platform for installation of base environment.", choices=['oracle', 'debian10', 'ubuntu20.04'])
	option = parser.parse_args(sys.argv[1:])
	setup = {moduleName}Setup()
	setup.operate(option.operation, option.platform)
