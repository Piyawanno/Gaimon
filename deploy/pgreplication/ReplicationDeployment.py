#!/usr/bin/env python

import os, json, logging

class ReplicationDeployment :
	def __init__(self, rootPath:str):
		self.rootPath = rootPath
	
	def deploy(self) :
		password = self.readPassword()
		if password is None : return
		self.generateCompose(password)
		self.generateSQL(password)
		self.run()
	
	def readPassword(self) -> dict :
		path = f"{self.rootPath}/Password.json"
		if os.path.isfile(path) :
			with open(path) as fd :
				return json.load(fd)
		else :
			logging.error(f"File {path} does not exist.")
			logging.error(f"Create Password.json first by using Password.example.json.")
			return None
	
	def generateCompose(self, password:dict) :
		path = f"{self.rootPath}/docker-compose.yml"
		if os.path.isfile(path) : return
		masterPath = f"{self.rootPath}/docker-compose.example.yml"
		with open(masterPath) as fd :
			master = fd.read()
		content = master.format(POSTGRES_PASSWORD=password["postgres"])
		with open(path, "wt") as fd :
			fd.write(content)
	
	def generateSQL(self, password:dict) :
		path = f"{self.rootPath}/createuser.sql"
		if os.path.isfile(path) : return
		masterPath = f"{self.rootPath}/createuser.example.sql"
		with open(masterPath) as fd :
			master = fd.read()
		content = master.format(
			ADMIN_PASSWORD=password["admin"],
			REPREP_PASSWORD=password["reprep"]
		)
		with open(path, "wt") as fd :
			fd.write(content)
	
	def run(self) :
		command = [
			"sudo docker-compose up -d",
			"sleep 5",
			"sudo docker exec pgprimary create-replica",
			"sudo docker restart pgprimary",
			"sleep 3",
			"sudo docker exec pgsecondary1 clear-data",
			"sudo docker exec pgsecondary1 prepare-replica",
			"sudo docker exec pgsecondary2 clear-data",
			"sudo docker exec pgsecondary2 prepare-replica",
		]
		for i in command :
			logging.info(i)
			os.system(i)

if __name__ == '__main__' :
	logging.basicConfig(level=logging.INFO)
	deployment = ReplicationDeployment(os.path.abspath('./'))
	deployment.deploy()
