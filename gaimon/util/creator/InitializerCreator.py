from gaimon.util.creator.CommonCodeGenerator import CommonCodeGenerator

import os


class InitializerCreator(CommonCodeGenerator):
	def start(self):
		self.getWorkingPath()
		self.getParameter(isPath=True, isName=True, isLabel=False, isRoute=False)
		self.create()

	def create(self):
		targetPath = f'{self.rootPath}/{self.modelName}Initializer.py'
		if os.path.isfile(targetPath):
			print(f">>> {targetPath} exists.")
			print(f">>> Initializer will not be created.")
			return

		path = f'{self.workingPath}/creator/template/Initializer.tpl'
		with open(path, 'rt', encoding="utf-8") as fd:
			template = fd.read()

		code = template.format(
			fullModulePath=self.modulePath,
			modulePath=self.modulePath.split(".")[-1],
			modelName=self.modelName,
		)

		with open(targetPath, 'wt') as fd:
			fd.write(code)
