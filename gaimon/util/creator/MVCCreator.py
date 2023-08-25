from gaimon.util.creator.ControllerCreator import ControllerCreator
from gaimon.util.creator.ModelCreator import ModelCreator
from gaimon.util.creator.JSProtocolCreator import JSProtocolCreator
from gaimon.util.creator.JSPageCreator import JSPageCreator

import os, json


class MVCCreator:
	def __init__(self):
		self.controllerCreator = ControllerCreator()
		self.modelCreator = ModelCreator()
		self.protocolCreator = JSProtocolCreator()
		self.pageCreator = JSPageCreator()

	def start(self):
		self.controllerCreator.getWorkingPath()
		self.controllerCreator.getParameter()

		self.modelCreator.copyParameter(self.controllerCreator)
		self.protocolCreator.copyParameter(self.controllerCreator)
		self.pageCreator.copyParameter(self.controllerCreator)

		self.controllerCreator.create()
		self.modelCreator.create()
		self.protocolCreator.create()
		self.pageCreator.create()

		self.configSubMenu()

	def configSubMenu(self):
		path = f'{self.controllerCreator.rootPath}/Extension.json'
		if not os.path.isfile(path):
			print(f"*** Error : {path} doest not exist.")
			print(
				f"*** Please, create Extension (gaimon-extension-create) before creating MVC."
			)
			return
		with open(path) as fd:
			config = json.load(fd)

		if self.controllerCreator.modelName not in config["role"]:
			config["role"].append(self.controllerCreator.modelName)

		if self.pageCreator.modelName not in config["backend"]["script"]:
			config["backend"]["script"].append(f"{self.pageCreator.modelName}Page.js")
			config["backend"]["script"].append(
				f"protocol/{self.pageCreator.modelName}Protocol.js"
			)

		hasSubmenu = False
		ID = f"{self.controllerCreator.modelName}Page"
		for i in config["backend"]["menu"][0]["child"]:
			if i["ID"] == ID:
				hasSubmenu = True
				break
		if not hasSubmenu:
			splitted = self.controllerCreator.modulePath.split(".")
			modulePath = splitted[-1]
			subMenu = {
				"ID": ID,
				"label": self.controllerCreator.label,
				"icon": f"{modulePath}.Default",
				"order": "1.0"
			}
			config["backend"]["menu"][0]["child"].append(subMenu)
		with open(path, "wt") as fd:
			json.dump(config, fd, indent=4, ensure_ascii=False)
