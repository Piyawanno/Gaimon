from gaimon.util.creator.ExtensionCreator import ExtensionCreator

import os


class JSMainCreator(ExtensionCreator):
	def start(self):
		self.workingPath = os.path.dirname(os.path.abspath(__file__))
		self.getParameter()
		self.create()

	def create(self):
		targetPath = f'{self.rootPath}/{self.ID}/share/js/{self.name}.js'
		if os.path.isfile(targetPath):
			print(f">>> {targetPath} exists.")
			print(f">>> JS-Main will not be created.")
			return

		path = f'{self.workingPath}/template/JSMain.tpl'
		with open(path, 'rt', encoding="utf-8") as fd:
			template = fd.read()

		code = template.format(moduleName=self.name, modulePath=self.ID, )

		path = f'{self.rootPath}/{self.ID}/share/js/'
		if not os.path.isdir(path):
			os.makedirs(path)

		with open(targetPath, 'wt') as fd:
			fd.write(code)
