from gaimon.util.creator.CommonCodeGenerator import CommonCodeGenerator

import logging, os, sys

__IS_WINDOWS__ = sys.platform == 'win32'


class ModuleCreator(CommonCodeGenerator):
	def start(self):
		self.getWorkingPath()
		self.getParameter()
		self.create()

	def getParameter(
		self,
		isPath: bool = True,
		isName: bool = True,
		isLabel: bool = True,
		isRoute: bool = True
	):
		current = os.path.abspath('.')
		self.rootPath = input(f"Root path (empty for {current}) : ")
		if len(self.rootPath) == 0: self.rootPath = current
		self.modulePath = input(f"Module path (e.g. gaimonerp) : ")
		self.moduleName = input(f"Module name (e.g. GaimonERP) : ")
		self.label = input(f'Label e.g. "ERP System": ')

	def create(self):
		if not os.path.isdir(self.rootPath):
			os.makedirs(self.rootPath)
		self.createDirectory()
		self.createREADME()
		self.createRequirements()
		self.createSetUp()
		self.createManifest()
		self.createGetIgnore()

	def createDirectory(self):
		pathList = [
			(self.modulePath, '__init__.py'),
			('script', 'README.md'),
			('document', 'README.md'),
		]

		for i, j in pathList:
			path = f"{self.rootPath}/{i}"
			if not os.path.isdir(path):
				os.makedirs(path)
			path = f"{self.rootPath}/{i}/{j}"
			if not os.path.isfile(path):
				with open(path, "wt") as fd:
					fd.write("")

	def createREADME(self):
		targetPath = f'{self.rootPath}/README.md'
		if os.path.isfile(targetPath):
			print(f">>> {targetPath} exists.")
			print(f">>> README file will not be created.")
		else:
			path = f'{self.workingPath}/template/README.tpl'
			with open(path, 'rt', encoding="utf-8") as fd:
				template = fd.read()

			code = template.format(moduleName=self.moduleName, )

			with open(targetPath, 'wt') as fd:
				fd.write(code)

	def createRequirements(self):
		targetPath = f'{self.rootPath}/requirements.txt'
		if os.path.isfile(targetPath):
			print(f">>> {targetPath} exists.")
			print(f">>> Requirement file will not be created.")
		else:
			path = f'{self.workingPath}/template/requirements.tpl'
			with open(path, 'rt', encoding="utf-8") as fd:
				template = fd.read()

			code = template.format()

			with open(targetPath, 'wt') as fd:
				fd.write(code)

		targetPath = f'{self.rootPath}/requirements-centos.txt'
		if os.path.isfile(targetPath):
			print(f">>> {targetPath} exists.")
			print(f">>> Requirement file for CenOS will not be created.")
		else:
			path = f'{self.workingPath}/template/requirements-centos.tpl'
			with open(path, 'rt', encoding="utf-8") as fd:
				template = fd.read()

			code = template.format()
			with open(targetPath, 'wt') as fd:
				fd.write(code)

		targetPath = f'{self.rootPath}/requirements-ubuntu-20.04.txt'
		if os.path.isfile(targetPath):
			print(f">>> {targetPath} exists.")
			print(f">>> Requirement file for Ubuntu will not be created.")
		else:
			path = f'{self.workingPath}/template/requirements-ubuntu-20.04.tpl'
			with open(path, 'rt', encoding="utf-8") as fd:
				template = fd.read()

			code = template.format()
			with open(targetPath, 'wt') as fd:
				fd.write(code)

	def createSetUp(self):
		targetPath = f'{self.rootPath}/setup.py'
		if os.path.isfile(targetPath):
			print(f">>> {targetPath} exists.")
			print(f">>> Setup file will not be created.")
		else:
			path = f'{self.workingPath}/template/setup.tpl'
			with open(path, 'rt', encoding="utf-8") as fd:
				template = fd.read()

			code = template.format(
				moduleName=self.moduleName,
				modulePath=self.modulePath,
			)
			with open(targetPath, 'wt') as fd:
				fd.write(code)

		if not __IS_WINDOWS__:
			command = f'chmod +x {self.rootPath}/setup.py'
			print(command)
			os.system(command)

	def createManifest(self):
		targetPath = f'{self.rootPath}/MANIFEST.in'
		if os.path.isfile(targetPath):
			print(f">>> {targetPath} exists.")
			print(f">>> Manifest file will not be created.")
		else:
			path = f'{self.workingPath}/template/MANIFEST.tpl'
			with open(path, 'rt', encoding="utf-8") as fd:
				template = fd.read()

			code = template.format()
			with open(targetPath, 'wt') as fd:
				fd.write(code)

	def createGetIgnore(self):
		targetPath = f'{self.rootPath}/.gitignore'
		if os.path.isfile(targetPath):
			print(f">>> {targetPath} exists.")
			print(f">>> GitIgnore file will not be created.")
		else:
			path = f'{self.workingPath}/template/gitignore.tpl'
			with open(path, 'rt', encoding="utf-8") as fd:
				template = fd.read()

			code = template.format()
			with open(targetPath, 'wt') as fd:
				fd.write(code)
