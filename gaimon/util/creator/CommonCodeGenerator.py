import os, logging


class CommonCodeGenerator:
	def getWorkingPath(self):
		self.workingPath = os.path.dirname(os.path.abspath(__file__))
		print(self.workingPath, __file__)

	def getParameter(
		self,
		isPath: bool = True,
		isName: bool = True,
		isLabel: bool = True,
		isRoute: bool = True
	):
		current = os.path.abspath('.')
		while True:
			self.rootPath = input(f"Root path (empty for {current}) : ")
			if len(self.rootPath) == 0: self.rootPath = current
			if os.path.isdir(self.rootPath):
				break
			else:
				logging.error(f"*** Path {self.rootPath} does not exist.")

		if isPath:
			self.modulePath = input(f"Module path (e.g. gaimonerp.stock) : ")
			self.moduleName = self.modulePath.split(".")[-1]

		if isName:
			self.modelName = input(f"Model name e.g. StockItemType : ")
			self.path = f"{self.rootPath}/model/{self.modelName}"

		if isLabel:
			self.label = input(f'Label e.g. "Supplier Stock": ')

		if isRoute:
			self.route = input(f"Base route e.g. /stock/item : ")

	def copyParameter(self, master):
		self.modulePath = master.modulePath
		self.moduleName = master.moduleName
		self.modelName = master.modelName
		self.path = master.path
		self.route = master.route
		self.workingPath = master.workingPath
		self.rootPath = master.rootPath
