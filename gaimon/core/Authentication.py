from xerial.AsyncDBSessionBase import AsyncDBSessionBase
from gaimon.model.User import User
from gaimon.model.UserGroupPermission import UserGroupPermission

from typing import List
from datetime import datetime, timezone, timedelta

import json, jwt

#TODO : Replace Redis with MicroService

class Authentication:
	def __init__(self, session, redis):
		self.session = session
		self.redis = redis
		self.AUTHENTICATION_REDIS_KEY = "GaimonAuthentication"
		self.ROLE_REDIS_KEY = "GaimonRole"
		self.TOKEN_REDIS_KEY = "GaimonToken"
		self.TOKEN_TIME_REDIS_KEY = "GaimonTokenTime"
		self.SIGNING_KEY = "sx5AL5uk0CkfmFQ8Kda7HbWDdupLaOksEj3sXMvY9tM="
		self.PERMISSION_REDIS_KEY = 'GaimonPermission'

	async def checkUserInformation(
		self,
		session: AsyncDBSessionBase,
		userID: int,
		isForce: bool = False
	):
		if userID < 0: return None
		raw = await self.redis.hget(self.AUTHENTICATION_REDIS_KEY, userID)
		if not raw is None and not isForce: return json.loads(raw)
		userList: List[User] = await session.select(User, f'WHERE id={userID}', limit=1)
		if len(userList) == 0: return None
		return await self.checkUserInformationByUser(session, userList[0], isForce)
	
	async def checkUserInformationByUser(
		self,
		session: AsyncDBSessionBase,
		user: User,
		isForce: bool = False
	):
		raw = await self.redis.hget(self.AUTHENTICATION_REDIS_KEY, user.id)
		if not raw is None and not isForce: return json.loads(raw)
		result = user.toDict()
		result['uid'] = user.id
		result['role'] = await self.checkRole(session, user)
		await self.redis.hset(self.AUTHENTICATION_REDIS_KEY, user.id, json.dumps(result))
		return result

	async def setUserInformationByToken(self, token, data, expireTime=None):
		await self.redis.hset(self.TOKEN_REDIS_KEY, token, json.dumps(data))
		if not expireTime is None:
			await self.redis.hset(self.TOKEN_TIME_REDIS_KEY, token, expireTime)

	async def checkRole(self, session: AsyncDBSessionBase, user: User):
		from gaimon.core.PermissionChecker import PermissionChecker
		role = await PermissionChecker.processRole(session, user)
		await self.redis.hset(self.ROLE_REDIS_KEY, user.id, json.dumps(role))
		return role

	async def refreshToken(self, session: AsyncDBSessionBase, token: dict):
		isExpire = await self.isExpire(token)
		if isExpire: return
		payload = await self.decodeJWT(token)
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
		raw = await self.redis.hget(self.TOKEN_REDIS_KEY, token)
		if not raw is None: return json.loads(raw)
		return None

	async def isExpire(self, token):
		expireTime = await self.redis.hget(self.TOKEN_TIME_REDIS_KEY, token)
		if expireTime is not None:
			expireTime = float(expireTime)
			if expireTime < datetime.timestamp(datetime.now(timezone.utc)):
				await self.redis.hdel(self.TOKEN_REDIS_KEY, token)
				await self.redis.hdel(self.TOKEN_TIME_REDIS_KEY, token)
				return True
			else:
				return False
		else:
			return True

	async def deleteSession(self, token):
		if token is None: return
		await self.redis.hdel(self.TOKEN_REDIS_KEY, token)
		await self.redis.hdel(self.TOKEN_TIME_REDIS_KEY, token)

	async def saveSessionByUser(self, session: AsyncDBSessionBase, user: User):
		now = datetime.now(timezone.utc)
		data = {}
		data['id'] = user.id
		data["iat"] = now
		data["exp"] = now + timedelta(days=7)
		token = self.encodeJWT(data)
		if type(token) == bytes: token = token.decode()
		payload = await self.decodeJWT(token)
		if payload is None: return None
		result = await self.checkUserInformationByUser(session, user, True)
		await self.setUserInformationByToken(
			token,
			result,
			datetime.timestamp(data["exp"])
		)
		return token

	async def saveSession(self, session: AsyncDBSessionBase, data: dict):
		now = datetime.now(timezone.utc)
		data["iat"] = now
		data["exp"] = now + timedelta(days=7)
		token = self.encodeJWT(data)
		if type(token) == bytes: token = token.decode()
		payload = await self.decodeJWT(token)
		if payload is None: return None
		result = await self.checkUserInformation(session, int(payload['id']), True)
		await self.setUserInformationByToken(
			token,
			result,
			datetime.timestamp(data["exp"])
		)
		return token

	async def saveSessionByID(self, id: int):
		result = await self.checkUserInformation(int(id))
		return result

	def encodeJWT(self, data):
		return jwt.encode(data.copy(), self.SIGNING_KEY, algorithm="HS512")

	async def decodeJWT(self, token):
		try:
			payload = jwt.decode(token, self.SIGNING_KEY, algorithms=["HS512", "HS256"])
			return payload
		except jwt.exceptions.ExpiredSignatureError:
			await self.redis.hdel(self.TOKEN_REDIS_KEY, token)
			return None
		except jwt.exceptions.InvalidTokenError:
			return None
		return None

	async def getRoleByGroupID(self, session, groupID, isForce=True):
		if groupID is None or groupID < 0: return []
		if not isForce:
			raw = await self.redis.hget(self.PERMISSION_REDIS_KEY, groupID)
			if not raw is None:
				return json.loads(raw)
		permissionList: List[UserGroupPermission] = await session.select(
			UserGroupPermission,
			f'WHERE gid={groupID}'
		)
		role = [i.toString() for i in permissionList]
		await self.redis.hset(self.PERMISSION_REDIS_KEY, groupID, json.dumps(role))
		return role

	async def processRole(self, session, user):
		if user.id < 0: return ['guest']
		if user.isRoot: return ['root']
		groupID = -1
		if not user.gid is None: groupID = int(user.gid)
		role = ['user']
		if groupID < 0: return role
		role.extend(await self.getRoleByGroupID(session, groupID))
		return role
