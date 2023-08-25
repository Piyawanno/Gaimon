from gaimon.util.creator.CommonCodeGenerator import CommonCodeGenerator

import os


class JSProtocolCreator(CommonCodeGenerator):
	def start(self):
		self.getWorkingPath()
		self.getParameter()
		self.create()

	def create(self):
		targetPath = f'{self.rootPath}/share/js/protocol/{self.modelName}Protocol.js'
		if os.path.isfile(targetPath):
			print(f">>> {targetPath} exists.")
			print(f">>> JS-Protocol will not be created.")
			return

		path = f'{self.workingPath}/creator/template/JSProtocol.tpl'
		with open(path, 'rt', encoding="utf-8") as fd:
			template = fd.read()

		code = template.format(modelName=self.modelName, route=self.route[1:])

		path = f'{self.rootPath}/share/js/protocol/'
		if not os.path.isdir(path):
			os.makedirs(path)

		with open(targetPath, 'wt') as fd:
			fd.write(code)
