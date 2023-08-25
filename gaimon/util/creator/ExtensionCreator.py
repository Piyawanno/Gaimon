import os, logging


class ExtensionCreator:
	def start(self):
		from gaimon.util.creator.JSMainCreator import JSMainCreator
		self.workingPath = os.path.dirname(os.path.abspath(__file__))
		self.getParameter()
		self.mainCreator = JSMainCreator()
		self.mainCreator.workingPath = self.workingPath
		self.mainCreator.ID = self.ID
		self.mainCreator.rootPath = self.rootPath
		self.mainCreator.module = self.module
		self.mainCreator.name = self.name
		self.create()

	def getParameter(self):
		current = os.path.abspath('.')
		while True:
			self.rootPath = input(f"Root path (empty for {current}) : ")
			if len(self.rootPath) == 0: self.rootPath = current
			if os.path.isdir(self.rootPath):
				break
			else:
				logging.error(f"*** Path {self.rootPath} does not exist.")

		self.ID = input(f"Extension ID e.g. stock : ")
		self.path = f"{self.rootPath}/{self.ID}"
		if os.path.isdir(self.path):
			logging.warning(f"*** Path {self.path} already exists.")

		self.module = input(f"Extension module (empty for gaimon.extension.{self.ID}) : ")
		if len(self.module) == 0: self.module = f"gaimon.extension.{self.ID}"
		self.name = input(f"Extension name e.g. Stock : ")

	def create(self):
		if not os.path.isdir(self.path): os.makedirs(self.path)
		self.writeEmpty(f"{self.path}/__init__.py")
		self.writeExtensionFile()
		self.writeReadMe()
		self.writeExtensionLoader()
		self.checkPath(f"{self.path}/model/", '__init__.py')
		self.checkPath(f"{self.path}/util/", '__init__.py')
		self.checkPath(f"{self.path}/service/", '__init__.py')
		self.checkPath(f"{self.path}/document/", 'README.md')
		self.checkPath(f"{self.path}/locale/", 'README.md')
		self.checkPath(f"{self.path}/controller/", '__init__.py')
		self.checkPath(f"{self.path}/view/client", f'{self.name}.tpl')
		with open(f'{self.workingPath}/../../view/client/icon/More.tpl') as fd:
			self.checkPath(f"{self.path}/view/client/icon/", 'Default.tpl', fd.read())
		self.mainCreator.create()
		self.checkPath(f"{self.path}/share/css", f'{self.name}.css')
		self.checkPath(f"{self.path}/share/image", f'README.md')
		self.checkPath(f"{self.path}/share/icon", f'README.md')
		self.checkPath(f"{self.path}/file/", 'README.md')
		self.checkPath(f"{self.path}/script/", 'README.md')
		self.checkPath(f"{self.path}/config/global", f'{self.name}.json', '{}')
		self.checkPath(f"{self.path}/config/entity", f'{self.name}.json', '{}')
		self.checkPath(f"{self.path}/config/user", f'{self.name}.json', '{}')

	def writeExtensionFile(self):
		path = f"{self.path}/Extension.json"
		if os.path.isfile(path):
			print(f">>> {path} exists.")
			print(f">>> Extension file will not be generated.")
			return
		with open(
			f"{self.workingPath}/template/Extension.example.json",
			encoding="utf-8"
		) as fd:
			content = fd.read()
		content = content.format(
			ID=self.ID,
			name=self.name,
			extensionClass=f"{self.module}.{self.name}Extension.{self.name}Extension"
		)
		with open(path, "wt") as fd:
			fd.write(content)
		logging.info(f">>> Create {path}")

	def writeReadMe(self):
		path = f"{self.path}/README.md"
		if os.path.isfile(path):
			print(f">>> {path} exists.")
			print(f">>> README file will not be generated.")
			return
		with open(
			f"{self.workingPath}/template/ExtensionREADME.md",
			encoding="utf-8"
		) as fd:
			content = fd.read()

		content = content.format(extensionName=self.name)
		with open(path, "wt") as fd:
			fd.write(content)
		logging.info(f">>> Create {path}")

	def writeExtensionLoader(self):
		path = f"{self.path}/{self.name}Extension.py"
		if os.path.isfile(path):
			print(f">>> {path} exists.")
			print(f">>> ExtensionLoader will not be generated.")
			return
		with open(f"{self.workingPath}/template/Extension.tpl", encoding="utf-8") as fd:
			content = fd.read()

		content = content.format(ID=self.ID, name=self.name)
		with open(path, "wt") as fd:
			fd.write(content)
		logging.info(f">>> Create {path}")

	def checkPath(self, path: str, containedFile: str, content: str = None):
		if not os.path.isdir(path):
			os.makedirs(path)
			logging.info(f">>> Create {path}")
			filePath = f"{path}/{containedFile}"
			if content is None:
				self.writeEmpty(filePath)
				logging.info(f">>> Create {filePath}")
			else:
				if not os.path.isfile(filePath):
					with open(filePath, "wt") as fd:
						fd.write(content)
					logging.info(f">>> Create {filePath}")

	def writeEmpty(self, path: str):
		if not os.path.isfile(path):
			with open(path, "wt") as fd:
				fd.write("")
