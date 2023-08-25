from gaimon.util.creator.CommonCodeGenerator import CommonCodeGenerator

import os


class DisplayCreator(CommonCodeGenerator):
	def start(self):
		self.getWorkingPath()
		self.getParameter(isPath=True, isName=True, isLabel=True, isRoute=False)
		self.create()

	def create(self):
		self.createController()
		self.createJSPage()
		self.createTemplate()

	def createController(self):
		targetPath = f'{self.rootPath}/controller/{self.modelName}DisplayController.py'
		if os.path.isfile(targetPath):
			print(f">>> {targetPath} exists.")
			print(f">>> Controller will not be created.")
			return

		path = f'{self.workingPath}/creator/template/DisplayController.tpl'
		with open(path, 'rt', encoding="utf-8") as fd:
			template = fd.read()

		code = template.format(
			modulePath=self.modulePath.split(".")[-1],
			modelName=self.modelName,
			label=self.label
		)

		with open(targetPath, 'wt') as fd:
			fd.write(code)

	def createJSPage(self):
		targetPath = f'{self.rootPath}/share/js/{self.modelName}Display.js'
		if os.path.isfile(targetPath):
			print(f">>> {targetPath} exists.")
			print(f">>> Display Page will not be created.")
			return

		path = f'{self.workingPath}/creator/template/JSDisplay.tpl'
		with open(path, 'rt', encoding="utf-8") as fd:
			template = fd.read()

		code = template.format(modelName=self.modelName, label=self.label)

		with open(targetPath, 'wt') as fd:
			fd.write(code)

	def createTemplate(self):
		targetPath = f'{self.rootPath}/view/{self.modelName}Display.tpl'
		if os.path.isfile(targetPath):
			print(f">>> {targetPath} exists.")
			print(f">>> Display Template will not be created.")
			return

		path = f'{self.workingPath}/creator/template/DisplayTemplate.tpl'
		with open(path, 'rt', encoding="utf-8") as fd:
			template = fd.read()

		code = template.format(modelName=self.modelName, label=self.label)

		with open(targetPath, 'wt') as fd:
			fd.write(code)
