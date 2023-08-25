#!/usr/bin/python3

import os, sys, logging, json


class DockerPreparation:
	def __init__(self, rootPath: str):
		self.rootPath = rootPath

	def prepare(self, repo: str):
		if not self.checkPath(repo): return
		password = self.getPassword()
		self.checkCompose(password)
		if password is None: return
		self.checkProductionPath()
		self.copyConfig()
		self.setDB(password)
		self.setRedis(password)
		self.createVolume()

	def checkCompose(self, password: dict):
		path = f"{self.rootPath}/docker-compose.yml"
		if not os.path.isfile(path):
			masterPath = f"{self.rootPath}/docker-compose.example.yml"
			with open(masterPath, encoding="utf-8") as fd:
				master = fd.read()
			compose = master.format(DB_PASSWORD=password["DB"])
			with open(path, "wt") as fd:
				fd.write(compose)
		return True

	def checkPath(self, repo: str) -> bool:
		self.repoPath = f"{self.rootPath}/gaimon/config/{repo}/"
		if not os.path.isdir(self.repoPath):
			logging.error(f"Configuration path {self.repoPath} not found")
			return False
		return True

	def getPassword(self) -> dict:
		path = f"{self.repoPath}/Password.json"
		if not os.path.isfile(path):
			logging.error(f"Password file {path} not found")
			return None
		with open(path, encoding="utf-8") as fd:
			return json.load(fd)

	def checkProductionPath(self):
		self.productionPath = f"{self.rootPath}/docker-production/"
		if not os.path.isdir(self.productionPath):
			os.makedirs(self.productionPath)

	def setDB(self, password: dict):
		path = f"{self.repoPath}/Database.json"
		with open(path, encoding="utf-8") as fd:
			master = json.load(fd)
		master["password"] = password["DB"]
		path = f"{self.productionPath}/Database.json"
		with open(path, "wt") as fd:
			json.dump(master, fd, indent=4)

	def setRedis(self, password: dict):
		path = f"{self.repoPath}/Redis.json"
		with open(path, encoding="utf-8") as fd:
			master = json.load(fd)
		master["password"] = password["redis"]
		path = f"{self.productionPath}/Redis.json"
		with open(path, "wt") as fd:
			json.dump(master, fd, indent=4)

	def copyConfig(self):
		config = ['Gaimon.json']
		for i in config:
			command = f"cp {self.repoPath}/{i} {self.productionPath}"
			logging.info(command)
			os.system(command)

	def createVolume(self):
		path = '/var/gaimon-docker-volume'
		if not os.path.isdir(path):
			command = f"sudo mkdir {path}"
			logging.info(command)
			os.system(command)


if __name__ == '__main__':
	logging.basicConfig(
		level=logging.INFO,
		format="[%(asctime)s] %(levelname)s %(message)s"
	)
	repo = sys.argv[-1]
	prepare = DockerPreparation()
	prepare.prepare(repo)
