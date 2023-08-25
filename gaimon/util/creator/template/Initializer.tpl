from gaimon.core.BaseInitializer import BaseInitializer
from {fullModulePath}.model.{modelName} import {modelName}
from xerial.DBMigration import DBMigration

import json, os

class {modelName}Initializer (BaseInitializer) :
	async def reset(self, session) :
		print(">>> Reset")
	
	async def upgrade(self, session) :
		print(">>> Upgrade")

	async def resetAutoIncreasement(self):
		for sqlCommand in self.alterSequence:
			os.system(f"sudo -u postgres psql -d {{self.config['DB']['database']}} -c '{{sqlCommand}}'")

	async def createRole(self, session) :
		print(">>> Create Role")
		print(self.config["extensionConfig"]["role"])

	async def insert(self, session) :
		URL = f"{{self.rootURL}}{{modulePath}}/insert"
		path = f"{{self.dataPath}}/{{modelName}}.json"
		with open(path, "rt") as fd :
			data = json.load(fd)
		for i in data :
			response = self.handler.post(URL, {{'data' : i}})
			if not response['isSuccess'] :
				raise RuntimeError(f"*** Error by {modelName}Initializer.insert : {{response['message']}}")

	async def drop(self, session) :
		URL = f"{{self.rootURL}}{modulePath}/delete"
		models = await session.select({modelName}, '', isChildren=True)
		result = [i.toDict() for i in models]
		for i in result :
			response = self.handler.post(URL, {{'id' : i['id']}})
			if not response['isSuccess'] :
				raise RuntimeError(f"*** Error by {modelName}Initializer.drop : {{response['message']}}")

	async def get(self, session) :
		URL = f"{{self.rootURL}}{modulePath}/all"
		data = {{
			"pageNumber": 1,
			"limit": 10,
			"data" : {{}}
		}}
		response = self.handler.post(URL, data)
		if not response['isSuccess'] :
			raise RuntimeError(f"*** Error by {modelName}Initializer.get : {{response['message']}}")
