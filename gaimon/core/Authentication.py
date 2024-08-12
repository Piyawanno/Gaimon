from xerial.AsyncDBSessionBase import AsyncDBSessionBase
from gaimon.model.User import User
from gaimon.model.UserGroupPermission import UserGroupPermission

from typing import Dict, List
from datetime import datetime, timezone, timedelta

import json, jwt

#TODO : Replace Redis with MicroService

class Authentication:
	def __init__(self, application):
		from gaimon.core.AsyncApplication import AsyncApplication
		self.application:AsyncApplication = application
		self.session = self.application.session
		self.redis = self.application.redis
		self.userHandler = self.application.userHandler
		self.AUTHENTICATION_REDIS_KEY = "GaimonAuthentication"
		self.ROLE_REDIS_KEY = "GaimonRole"
		self.GROUP_ROLE_KEY = "GaimonGroupRole"
		self.TOKEN_REDIS_KEY = "GaimonToken"
		self.TOKEN_TIME_REDIS_KEY = "GaimonTokenTime"
		# TODO get config over configuration handler
		self.SIGNING_KEY = self.application.config['JWTSigningKey']
		self.PERMISSION_REDIS_KEY = 'GaimonPermission'

	async def triggerRole(self, session: AsyncDBSessionBase, entity: str):
		models:List[UserGroupPermission] = await session.select(UserGroupPermission, '')
		result = {}
		for model in models:
			roles:List[str] = result.get(model.gid, [])
			roles.append(model.toString())
			result[model.gid] = roles
		redis = self.application.getRedis()
		await redis.hset(self.GROUP_ROLE_KEY, entity, json.dumps(result))

	async def getUserByID(
		self,
		userID: int,
	):
		if userID < 0: return None
		redis = self.application.getRedis()
		raw = await redis.hget(self.AUTHENTICATION_REDIS_KEY, userID)
		return json.loads(raw)

	async def checkUserInformation(
		self,
		session: AsyncDBSessionBase,
		userID: int,
		isForce: bool = False,
		entity: str = 'main'
	):
		if userID < 0: return None
		redis = self.application.getRedis()
		raw = await redis.hget(self.AUTHENTICATION_REDIS_KEY, userID)
		if not raw is None and not isForce: return json.loads(raw)
		user:User = await self.userHandler.getUserByID(session, userID, entity)
		if user is None: return None
		return await self.checkUserInformationByUser(session, user, isForce, entity)
	
	async def checkUserInformationByUser(
		self,
		session: AsyncDBSessionBase,
		user: User,
		isForce: bool = False,
		entity: str = 'main'
	):
		redis = self.application.getRedis()
		raw = await redis.hget(self.AUTHENTICATION_REDIS_KEY, user.id)
		if not raw is None and not isForce: return json.loads(raw)
		result = user.toDict()
		result['uid'] = user.id
		result['role'] = await self.processRole(session, user, entity)
		await redis.hset(self.AUTHENTICATION_REDIS_KEY, user.id, json.dumps(result))
		return result
	
	async def processRole(self, session:AsyncDBSessionBase, user: User, entity: str, isForce:bool=False):
		if isForce: await self.triggerRole(session, entity)
		if user.id < 0: return ['guest']
		if user.isRoot: return ['root']
		groupID = -1
		if not user.gid is None: groupID = int(user.gid)
		role = ["user"]
		redis = self.application.getRedis()
		result = await redis.hget(self.GROUP_ROLE_KEY, entity)
		if result is None: 
			await self.triggerRole(session, entity)
			result = await redis.hget(self.GROUP_ROLE_KEY, entity)
		if result is None: return role
		result:Dict[str, List[str]] = json.loads(result)
		return result.get(str(groupID), role)

	async def setUserInformationByToken(self, token, data, expireTime=None):
		redis = self.application.getRedis()
		await redis.hset(self.TOKEN_REDIS_KEY, token, json.dumps(data))
		if not expireTime is None:
			await redis.hset(self.TOKEN_TIME_REDIS_KEY, token, expireTime)

	async def refreshToken(self, session: AsyncDBSessionBase, token: dict):
		isExpire = await self.isExpire(token)
		if isExpire: return
		payload = await self.decodeJWT(token)
		if payload is None: return None
		now = datetime.now(timezone.utc)
		delta = now - datetime.fromtimestamp(payload['iat'], timezone.utc)
		if delta.days == 0: return token
		refreshToken = await self.saveSession(session, {'id': payload['id']})
		if refreshToken != token: await self.deleteSession(token)
		return refreshToken

	async def checkToken(self, token, expireTime=None):
		if token is None: return None
		isExpire = await self.isExpire(token)
		if isExpire: return None
		redis = self.application.getRedis()
		raw = await redis.hget(self.TOKEN_REDIS_KEY, token)
		if not raw is None: return json.loads(raw)
		return None

	async def isExpire(self, token):
		redis = self.application.getRedis()
		expireTime = await redis.hget(self.TOKEN_TIME_REDIS_KEY, token)
		if expireTime is not None:
			expireTime = float(expireTime)
			if expireTime < datetime.timestamp(datetime.now(timezone.utc)):
				await redis.hdel(self.TOKEN_REDIS_KEY, token)
				await redis.hdel(self.TOKEN_TIME_REDIS_KEY, token)
				return True
			else:
				return False
		else:
			return True

	async def deleteSession(self, token):
		if token is None: return
		redis = self.application.getRedis()
		await redis.hdel(self.TOKEN_REDIS_KEY, token)
		await redis.hdel(self.TOKEN_TIME_REDIS_KEY, token)

	async def saveSessionByUser(self, session: AsyncDBSessionBase, user: User, entity:str):
		now = datetime.now(timezone.utc)
		data = {}
		data['id'] = user.id
		data["iat"] = now
		data["exp"] = now + timedelta(days=7)
		token = self.encodeJWT(data)
		if type(token) == bytes: token = token.decode()
		payload = await self.decodeJWT(token)
		if payload is None: return None
		result = await self.checkUserInformationByUser(session, user, True, entity)
		await self.setUserInformationByToken(
			token,
			result,
			datetime.timestamp(data["exp"])
		)
		return token

	async def saveSession(self, session: AsyncDBSessionBase, data: dict, entity:str="main"):
		now = datetime.now(timezone.utc)
		data["iat"] = now
		data["exp"] = now + timedelta(days=7)
		token = self.encodeJWT(data)
		if type(token) == bytes: token = token.decode()
		payload = await self.decodeJWT(token)
		if payload is None: return None
		result = await self.checkUserInformation(session, int(payload['id']), True, entity)
		await self.setUserInformationByToken(
			token,
			result,
			datetime.timestamp(data["exp"])
		)
		return token

	def encodeJWT(self, data):
		return jwt.encode(data.copy(), self.SIGNING_KEY, algorithm="HS512")

	async def decodeJWT(self, token):
		try:
			payload = jwt.decode(token, self.SIGNING_KEY, algorithms=["HS512", "HS256"])
			return payload
		except jwt.exceptions.ExpiredSignatureError:
			redis = self.application.getRedis()
			await redis.hdel(self.TOKEN_REDIS_KEY, token)
			return None
		except jwt.exceptions.InvalidTokenError:
			return None
		return None

	async def getRoleByGroupID(self, groupID:int, entity:str):
		if groupID is None or groupID < 0: return []
		role = ["user"]
		redis = self.application.getRedis()
		result = await redis.hget(self.GROUP_ROLE_KEY, entity)
		if result is None: return role
		result:Dict[str, List[str]] = json.loads(result)
		return result.get(str(groupID), role)
