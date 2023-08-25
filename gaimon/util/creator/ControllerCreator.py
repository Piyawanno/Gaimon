from gaimon.util.creator.CommonCodeGenerator import CommonCodeGenerator

import os


class ControllerCreator(CommonCodeGenerator):
	def start(self):
		self.getWorkingPath()
		self.getParameter()
		self.create()

	def create(self):
		targetPath = f'{self.rootPath}/controller/{self.modelName}Controller.py'
		if os.path.isfile(targetPath):
			print(f">>> {targetPath} exists.")
			print(f">>> Controller will not be created.")
			return

		path = f'{self.workingPath}/creator/template/Controller.tpl'
		with open(path, 'rt', encoding="utf-8") as fd:
			template = fd.read()

		code = template.format(
			modulePath=self.modulePath,
			modelName=self.modelName,
			route=self.route
		)

		with open(targetPath, 'wt') as fd:
			fd.write(code)
