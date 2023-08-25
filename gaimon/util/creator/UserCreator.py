from gaimon.util.CommonDBBounded import CommonDBBounded
from gaimon.model.User import User
from gaimon.util.PathUtil import conform

import asyncio


class UserCreator(CommonDBBounded):
	def create(self, username: str, password: str) -> User:
		user = User()
		user.username = username
		salt = User.getSalt()
		user.salt = salt.hex()
		user.passwordHash = User.hashPassword(password.encode(), salt)
		user.isActive = 1
		return user

	def createRoot(self, username: str, password: str) -> User:
		user = self.create(username, password)
		user.userTypeID = 0
		user.isRoot = 1
		return user


if __name__ == '__main__':
	import json, sys, os, argparse
	__parser__ = argparse.ArgumentParser(description="User creator.")
	__parser__.add_argument("-n", "--namespace", help="Namespace of gaimon application.")
	__option__ = __parser__.parse_args(sys.argv[1:])
	__namespace__ = '' if __option__.namespace is None else __option__.namespace
	config = {}
	if len(__namespace__):
		path = conform(f'/etc/gaimon/namespace/{__namespace__}/Database.json')
	else:
		path = conform('/etc/gaimon/Database.json')
	with open(path, 'r', encoding='utf-8') as fd:
		config['DB'] = json.load(fd)
	creator = UserCreator(config)

	async def start(creator):
		await creator.connectDB()
		user = creator.createRoot('root', 'password')
		await creator.session.insertMultiple([user])

	asyncio.run(start(creator))
