from gaimon.util.creator.CommonCodeGenerator import CommonCodeGenerator

import os


class JSPageCreator(CommonCodeGenerator):
	def start(self):
		self.getWorkingPath()
		self.getParameter()
		self.create()

	def create(self):
		targetPath = f'{self.rootPath}/share/js/{self.modelName}Page.js'
		if os.path.isfile(targetPath):
			print(f">>> {targetPath} exists.")
			print(f">>> JS-Page will not be created.")
			return

		path = f'{self.workingPath}/creator/template/JSPage.tpl'
		with open(path, 'rt', encoding="utf-8") as fd:
			template = fd.read()

		code = template.format(
			moduleName=self.moduleName,
			modelName=self.modelName,
			route=self.route
		)

		with open(targetPath, 'wt') as fd:
			fd.write(code)
