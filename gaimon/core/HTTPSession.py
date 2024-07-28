from gaimon.util.UpdateDict import UpdateDict
from sanic import Sanic, Request
from sanic.response import HTTPResponse
from datetime import datetime, timezone
UTC = timezone.utc


import uuid, ujson, time, os


class HTTPSession:
	def __init__(self, application=None):
		from gaimon.core.AsyncApplication import AsyncApplication
		self.application: AsyncApplication = application
		self.cookieName = 'session'
		self.sessionName = 'session'
		self.prefix = ':session'
		self.expiry = 2592000
		self.httpOnly = True

	async def addSessionToRequest(self, request: Request) -> UpdateDict:
		sid = request.cookies.get(self.cookieName)
		if not sid:
			sid = uuid.uuid4().hex
			sessionData = UpdateDict(sid=sid)
		else:
			value = await self.getValue(sid)
			if value is not None:
				data = ujson.loads(value)
				sessionData = UpdateDict(data, sid=sid)
			else:
				sessionData = UpdateDict(sid=sid)

		container = self.getContainer(request)
		container[self.sessionName] = sessionData
		return sessionData
	
	async def saveSession(self, request: Request, response: HTTPResponse):
		container = self.getContainer(request)
		if self.sessionName not in container:
			return

		key = self.prefix + container[self.sessionName].sid
		if not container[self.sessionName]:
			await self.deleteKey(key)
			if container[self.sessionName].modified:
				self.deleteCookie(request, response)
			return

		value = ujson.dumps(dict(container[self.sessionName]))
		await self.setValue(key, value)
		self.setCookie(request, response)

	async def getValue(self, key: str):
		redis = self.application.getRedis()
		return await redis.get(f'{self.prefix}{key}')
	
	async def setValue(self, key: str, value: str):
		redis = self.application.getRedis()
		await redis.setex(key, self.expiry, value)

	async def deleteKey(self, key: str):
		redis = self.application.getRedis()
		await redis.delete([key])
	
	def deleteCookie(self, request: Request, response: HTTPResponse):
		container = self.getContainer(request)
		if hasattr(response.cookies, 'add_cookie'):
			response.cookies.add_cookie(
				self.cookieName,
				container[self.sessionName].sid,
				httponly=self.httpOnly,
				expires=datetime.now(UTC),
				max_age=0,
				secure=True,
			)
		else:
			response.cookies[self.cookieName] = container[self.sessionName].sid
			response.cookies[self.cookieName].httponly = self.httpOnly
			response.cookies[self.cookieName].expires = datetime.now(UTC)
			response.cookies[self.cookieName].max_age = 0
			response.cookies[self.cookieName].secure = True

	def setCookie(self, request: Request, response: HTTPResponse):
		container = self.getContainer(request)
		if hasattr(response.cookies, 'add_cookie'):
			response.cookies.add_cookie(
				self.cookieName,
				container[self.sessionName].sid,
				httponly=self.httpOnly,
				expires=self.getExpire(),
				max_age=self.expiry,
				secure=True,
			)
		else:
			response.cookies[self.cookieName] = container[self.sessionName].sid
			response.cookies[self.cookieName].httponly = self.httpOnly
			response.cookies[self.cookieName].expires = self.getExpire()
			response.cookies[self.cookieName].max_age = self.expiry
			response.cookies[self.cookieName].secure = True
	
	def getExpire(self) -> datetime:
		return datetime.fromtimestamp(time.time()+self.expiry)

	def getContainer(self, request: Request):
		return request.ctx.__dict__ if hasattr(request, "ctx") else request
