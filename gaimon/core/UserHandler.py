from typing import List
from xerial.AsyncDBSessionBase import AsyncDBSessionBase
from gaimon.model.User import User

from gaimon.util.RequestUtil import (
	createInsertHandler,
	createUpdateHandler,
	createSelectHandler,
	createSelectWithPageHandler,
	createDropHandler,
	createSelectByIDHandler,
	createOptionByIDHandler,
	processRequestQuery,
	calculatePage
)

class UserHandler :
	def __init__(self, application) :
		from gaimon.core.AsyncApplication import AsyncApplication
		self.application: AsyncApplication = application
		self.selectByID = createSelectByIDHandler(User)
		self.select = createSelectHandler(User)
		self.selectWithPage = createSelectWithPageHandler(User)
		self.insert = createInsertHandler(User)
		self.update = createUpdateHandler(User)
		self.drop = createDropHandler(User)
		self.getOptionByIDList = createOptionByIDHandler(User)
	
	async def getUserByID(self, session: AsyncDBSessionBase, ID: int, entity:str=None) -> User:
		return await session.selectByID(User, ID)
	
	async def isUsernameExist(self, session: AsyncDBSessionBase, username: str, entity:str=None) -> bool:
		count = await session.count(User, "WHERE username = ?", parameter=[username])
		return count > 0
	
	async def isEmailExist(self, session: AsyncDBSessionBase, email: str, entity:str=None) -> bool:
		count = await session.count(User, "WHERE email = ?", parameter=[email])
		return count > 0
	
	async def getAllUser(self, session: AsyncDBSessionBase, entity:str=None) -> List[User]:
		users: List[User] = await session.select(User, "WHERE isDrop = 0")
		return users
	
	async def getUserByCondition(self, session: AsyncDBSessionBase, parameter: dict, entity:str=None) -> List[User]:
		clause, parameter, limit, offset = processRequestQuery(parameter, User)
		users: List[User] = await session.select(
			User,
			clause,
			parameter=parameter,
			limit=limit,
			offset=offset
		)
		return users
	
	async def getUserByConditionWithPage(self, session: AsyncDBSessionBase, parameter: dict, entity:str=None) -> dict:
		clause, parameter, limit, offset = processRequestQuery(parameter, User)
		users: List[User] = await session.select(
			User,
			f'{clause} ORDER BY id DESC',
			parameter=parameter,
			limit=limit,
			offset=offset
		)
		count = await session.count(User, clause, parameter=parameter)
		return {
			'data': users,
			'count': calculatePage(count, limit)
		}
	
	async def getUserByWildcard(self, session: AsyncDBSessionBase, parameter: dict, entity:str=None) -> List[User]:
		wildcard = parameter['name']+'%'
		limit = None
		if 'limit' in parameter: limit = int(parameter['limit'])
		users = await session.select(
			User,
			"WHERE (username LIKE ? OR displayName LIKE ? OR firstName LIKE ? OR lastName LIKE ?) AND isDrop = 0",
			parameter=[wildcard, wildcard, wildcard, wildcard],
			limit=limit
		)
		return users
	
	async def insertUser(self, session: AsyncDBSessionBase, data: dict, entity:str=None) -> User:
		user = User()
		user.username = data['username']
		user.email = data['email']
		user.firstName = data['firstName']
		user.lastName = data['lastName']
		user.displayName = data['displayName']
		user.isActive = True
		if 'avatar' in data: user.avatar = data['avatar']
		user.gid = -1
		if 'gid' in data: user.gid = int(data['gid'])
		if len(data['passwordHash']) and data['passwordHash'] == data['confirm_passwordHash']:
			salt = User.getSalt()
			user.salt = salt.hex()
			user.passwordHash = User.hashPassword(data['passwordHash'].encode(), salt)
		await session.insert(user)
		return user
	
	async def updateUser(self, session: AsyncDBSessionBase, data: dict, entity:str=None) -> User:
		user:User = await self.selectByID(session, int(data['id']))
		if user is None: return
		user.username = data['username']
		user.email = data['email']
		user.firstName = data['firstName']
		user.lastName = data['lastName']
		user.displayName = data['displayName']
		if 'avatar' in data: user.avatar = data['avatar']
		try :
			if 'gid' in data: user.gid = int(data['gid'])
		except ValueError:
			user.gid = -1
		if len(data['passwordHash']) and data['passwordHash'] == data['confirm_passwordHash']:
			salt = User.getSalt()
			user.salt = salt.hex()
			user.passwordHash = User.hashPassword(data['passwordHash'].encode(), salt)
		await session.update(user)
		return user
	
	async def dropUser(self, session: AsyncDBSessionBase, data: dict, entity:str=None) -> User:
		return await self.drop(session, data)
	
	async def getUserOptionByIDList(self, session: AsyncDBSessionBase, IDList: List[int], entity:str=None):
		return await self.getOptionByIDList(session, IDList)