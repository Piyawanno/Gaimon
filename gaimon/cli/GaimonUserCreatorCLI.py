from gaimon.util.CLIBase import CLIBase
from gaimon.util.PathUtil import conform
from gaimon.util.creator.UserCreator import UserCreator
from typing import List, Dict, Any

import argparse, sys, json, getpass, asyncio

def run():
	GaimonUserCreatorCLI().run(sys.argv[1:])

class GaimonUserCreatorCLI (CLIBase):
	def initParser(self):
		self.parser = argparse.ArgumentParser(description="Gaimon User creator.")
		self.parser.add_argument("-n", "--namespace", help="Namespace of gaimon application.")
		self.parser.add_argument("-u", "--username", help="User name to create.")
		return self.parser
	
	def run(self, argv: List[str]):
		self.getOption(argv)
		self.config = GaimonUserCreatorCLI.readConfig(self.namespace)
		self.getParameter()
		asyncio.run(self.create())
	
	async def create(self):
		self.creator: UserCreator = UserCreator(self.config)
		await self.creator.connectDB()
		user = self.creator.createRoot(self.username, self.password)
		await self.creator.session.insert(user)
		print(f'>>> User {self.username} is created.')

	def getParameter(self):
		if self.option.username is None :
			self.username = input("User name : ")
		else :
			self.username = self.option.username

		while True :
			self.password = getpass.getpass("Password : ")
			confirm = getpass.getpass("Confirm password : ")
			if self.password != confirm :
				print("*** Error : Password and confirmed password do not match.")
				print("*** Try again")
			else :
				break

	@staticmethod
	def readConfig(namespace:str) -> Dict[str, Any]:
		config = {}
		if len(namespace): path = conform(f'/etc/gaimon/namespace/{namespace}/Database.json')
		else : path = conform('/etc/gaimon/Database.json')

		with open(path, 'r', encoding='utf-8') as fd :
			config['DB'] = json.load(fd)
		return config

if __name__ == '__main__': run()
