from gaimon.util.creator.CommonCodeGenerator import CommonCodeGenerator

import os


class ModelCreator(CommonCodeGenerator):
	def start(self):
		self.getWorkingPath()
		self.getParameter()
		self.create()

	def create(self):
		targetPath = f'{self.rootPath}/model/{self.modelName}.py'
		if os.path.isfile(targetPath):
			print(f">>> {targetPath} exists.")
			print(f">>> Model will not be created.")
			return

		path = f'{self.workingPath}/creator/template/Model.tpl'
		with open(path, 'rt', encoding="utf-8") as fd:
			template = fd.read()

		code = template.format(modelName=self.modelName, )
		with open(targetPath, 'wt') as fd:
			fd.write(code)
