from xerial.AsyncDBSessionBase import AsyncDBSessionBase
from gaimon.core.EmailSender import EmailSender
from gaimon.core.HTMLPage import HTMLPage
from gaimon.core.Route import GET, POST
from gaimon.model.User import User
from gaimon.model.PasswordRenew import PasswordRenew
from gaimon.core.RESTResponse import (
	RESTResponse,
	SuccessRESTResponse as Success,
)
from sanic import response, Request
from datetime import datetime
from typing import List

import struct, time, pystache, re, string, random, logging
import redis.asyncio as redis


__SALT_TIME_LIMIT__ = 300.0
__CACHED_PAGE__ = {}

EMAIL_PATTERN = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'

#TODO : Replace Redis with MicroService

__JS__ = [
	'utils/Utils.js',
	'LoginPage.js',
	'Authentication.js',
]

__CSS__ = [
	'AlertDialog.css',
	'Login.css',
]

__INCOMPRESSIBLE_CSS__ = [
	'FontFamily.css',
]
class AuthenticationController:
	def __init__(self, application):
		from gaimon.core.AsyncApplication import AsyncApplication
		from gaimon.core.Authentication import Authentication
		self.application: AsyncApplication = application
		self.page = self.application.createPage()
		self.resourcePath = self.application.resourcePath
		self.renderer = pystache.Renderer()
		self.title = self.application.title
		self.letter = string.ascii_lowercase + string.ascii_uppercase + string.digits
		self.RESET_PASSWORD_KEY = "GaimonResetPassword"
		self.authen: Authentication = None
		self.session: AsyncDBSessionBase = None
		email = self.application.config.get('email', None)
		if email is not None: self.emailSender = EmailSender(email)
		else: self.emailSender = None
		self.icon = self.application.icon
		self.favicon = self.application.favicon
		self.fullTitle = self.application.fullTitle

	@POST("/authentication/login/check", role=['guest'])
	async def checkLoggedIn(self, request):
		session = request.ctx.session
		if 'uid' in session and session['uid'] != -1:
			token = None
			if request.credentials:
				token = await self.authen.refreshToken(
					self.session,
					request.credentials.token
				)
			parameter = [session['uid']]
			userList = await self.session.select(
				User,
				"WHERE id=?",
				parameter=parameter,
				limit=1
			)
			if len(userList) == 0: return RESTResponse({'isSuccess': False})
			results = userList[0].toTransportDict()
			results['role'] = session['role']
			permissions = await self.authen.processRole(self.session, userList[0], self.entity)
			results['permissions'] = permissions
			return RESTResponse({
				'isSuccess': True,
				'results': results,
				'token': token
			}, ensure_ascii=False)
		else:
			return RESTResponse({'isSuccess': False})

	@POST("/authentication/login/getSalt", role=['guest'])
	async def getSalt(self, request):
		username = request.json['username']
		userList = await self.session.select(
			User,
			"WHERE lower(username)=lower(?) OR lower(email)=lower(?) ORDER BY id DESC",
			parameter=[username, username],
			limit=1
		)
		from pprint import pprint
		if len(userList):
			if userList[0].username.lower() == username.lower() or userList[0].email.lower() == username.lower():
				return RESTResponse({"isSuccess": True, "salt": userList[0].salt})
			else:
				return RESTResponse({
					"isSuccess": False,
						"message": "User %s cannot be found." % (username)
					})
		else:
			return RESTResponse({
				"isSuccess": False,
				"message": "User %s cannot be found." % (username)
			})
	
	@POST("/authentication/user/autoComplete/get", role=['guest'])
	async def getUserAutoComplete(self, request) :
		username = request.json['username']
		userList:List[User] = await self.session.select(
			User,
			"WHERE username LIKE ? AND isActive=1",
			parameter=[f'{username}%'],
			limit = int(request.json['limit'])
		)
		return RESTResponse({
			'isSuccess': True,
			'result': [i.toTransportDict() for i in userList]
		}, ensure_ascii=False)

	@GET("/authentication/login", role=['guest'], hasDBSession=False)
	async def login(self, request):
		request.ctx.session['uid'] = -1
		request.ctx.session['role'] = ['guest']
		cached = __CACHED_PAGE__.get('authentication', None)
		if cached is not None: return response.html(cached)
		self.page.setRequest(request)
		self.page.reset()
		self.page.title = f"{self.title} - LOGIN"
		await self.setIcon(self.page)
		await self.setFavIcon(self.page)
		self.page.enableCrypto()
		self.page.enableLogIn()
		self.page.extendJS(__JS__)
		self.page.extendIncompressibleCSS(__INCOMPRESSIBLE_CSS__)
		self.page.extendCSS(__CSS__)
		template = self.theme.getTemplate('Login.tpl')
		data = {
			'rootURL': self.page.rootURL,
			'title': self.title,
			'icon': self.icon,
			'fullTitle': self.fullTitle,
			'language': await self.application.getLanguage(),
		}
		self.setExternalLogin()
		self.page.body = self.renderer.render(template, data)
		rendered = self.page.render(ID='authentication')
		__CACHED_PAGE__['authentication'] = rendered
		return response.html(rendered)

	@GET("/authentication/logout/flush", role=['guest'], hasDBSession=False)
	async def logout(self, request):
		if request.ctx.session['uid'] == -1: return RESTResponse({"isSuccess": True})
		request.ctx.session['uid'] = -1
		request.ctx.session['role'] = ['guest']
		if request.credentials:
			await self.authen.deleteSession(request.credentials.token)
		return RESTResponse({"isSuccess": True})

	@GET("/authentication/renewPassword/<code>", role=['guest'])
	async def renderRenewPasswordPage(self, request, code):
		request.ctx.session['uid'] = -1
		request.ctx.session['role'] = ['guest']
		requested = PasswordRenew.decode(code)
		clause = f"WHERE id=?"
		fetched = await self.session.select(
			PasswordRenew,
			clause=clause,
			parameter=[requested.id],
			isRelated=True
		)
		status = 403
		if len(fetched) == 0:
			page = self.page.renderError(status, "User cannot be found.")
			return response.html(page, status=status)
		reference: PasswordRenew = fetched[0]
		if not reference.checkCode(requested.token):
			page = self.page.renderError(status, "The given code is incorrect.")
			return response.html(page, status=status)
		now = datetime.now()
		if reference.isActivated:
			page = self.page.renderError(
				code,
				"The given code is already activated and cannot be reused."
			)
			# return response.html(page, status=status)
			return response.redirect('/')
		if reference.expireDate < now.date():
			page = self.page.renderError(
				status,
				"The given code is expired and cannot be used."
			)
			return response.html(page, status=status)
		await self.setUserSession(request, reference.uid)
		self.page.setRequest(request)
		return await self.renderRenewPassword(reference.uid, code)

	@POST("/authentication/check/renewPassword", role=['guest'])
	async def checkRenewPassword(self, request):
		result = {'isSuccess': False}
		code = request.json['code']
		requested = PasswordRenew.decode(code)
		clause = f"WHERE id=?"
		fetched = await self.session.select(
			PasswordRenew,
			clause=clause,
			parameter=[requested.id],
			isRelated=True
		)
		if len(fetched) == 0:
			result['message'] = 'User cannot be found.'
			return RESTResponse(result, ensure_ascii=False)
		reference: PasswordRenew = fetched[0]
		if not reference.checkCode(requested.token):
			result['message'] = "The given code is incorrect."
			return RESTResponse(result, ensure_ascii=False)
		now = datetime.now()
		if reference.isActivated:
			result['message'
					] = "The given code is already activated and cannot be reused."
			return RESTResponse(result, ensure_ascii=False)
		if reference.expireDate < now.date():
			result['message'] = "The given code is expired and cannot be used."
			return RESTResponse(result, ensure_ascii=False)

		user: User = reference.uid
		user.passwordHash = request.json['passwordHash']
		await self.session.update(user)
		result['isSuccess'] = True
		result['token'] = await self.authen.saveSession(self.session, {'id': user.id}, self.entity)
		await self.setUserSession(request, user)
		reference.isActivated = 1
		await self.session.update(reference)
		return RESTResponse(result, ensure_ascii=False)

	@POST("/authentication/forgot/password", role=['guest'])
	async def forgotPassword(self, request):
		email = request.json['email']
		isValid = self.isValidEmail(email)
		if not isValid:
			return RESTResponse({"isSuccess": False, "message": "Email is invalid."})
		users: List[User] = await self.session.select(
			User,
			f"WHERE email=?",
			parameter=[email],
			limit=1
		)
		if len(users) == 0:
			return RESTResponse({"isSuccess": False, "message": "Email is not exist."})
		user = users[0]
		key = self.randomString(20)
		url = f"{self.application.rootURL}authentication/user/reset/password/{key}"
		conn: redis.Redis = self.application.redis
		await conn.hset(self.RESET_PASSWORD_KEY, key, user.id)
		self.sendResetPasswordEmail(user.email, url)
		return RESTResponse({"isSuccess": True})
	
	@GET('/authentication/user/reset/password/<hash>', role=['guest'])
	async def renderResetPasswordIndex(self, request, hash):
		userID = await self.application.redis.hget(self.RESET_PASSWORD_KEY, hash)
		if userID is None: return response.html("404 Not Found", status=404)
		self.page.setRequest(request)
		return await self.renderResetPasswordPage(hash, userID)

	@POST("/authentication/reset/password", role=['guest'])
	async def resetPassword(self, request):
		key = request.json['hashed']
		userID = await self.application.redis.hget(self.RESET_PASSWORD_KEY, key)
		if userID is None:
			return RESTResponse({"isSuccess": False, "message": "Link is expired."})
		user: User = await self.session.selectByID(User, userID)
		if user is None :
			return RESTResponse({"isSuccess": False, "message": "User is not exist."})
		if user.salt is None:
			user.salt = User.getSalt().hex()
		salt = bytes.fromhex(user.salt)
		user.passwordHash = User.hashPassword(request.json['password'].encode(), salt)
		await self.session.update(user)
		await self.application.redis.hdel(self.RESET_PASSWORD_KEY, key)
		return RESTResponse({"isSuccess": True})
	
	@POST("/authentication/checkPermission", role=['user'])
	async def checkPermission(self, request):
		return response.json({"isSuccess": True, 'result': True})


	@GET("/authentication/get/role", role=['guest'])
	async def getRole(sel, request: Request):
		if 'role' in request.ctx.session: role = list(request.ctx.session['role'])
		else: role = []
		return Success(role)

	@POST("/authentication/login/checkPermission", role=['guest'])
	async def checkLogInPermission(self, request):
		data = request.json
		username = data['username']
		userList = await self.session.select(
			User,
			"WHERE lower(username)=lower(?) OR lower(username)=lower(?) ORDER BY id DESC",
			parameter=[username, username],
			limit=1
		)
		if len(userList):
			user = userList[0]
			if userList[0].username.lower() == username.lower() or userList[0].email.lower() == username.lower():
				if (user.salt is None
					or len(user.salt) == 0) and "migration" in self.application.config[
						"authentication"] and self.application.config["authentication"]["migration"]:
					if self.application.config["authentication"]["migration"] == "wordpress":
						return await self.checkPHPPermission(request, user)
				return await self.checkGaimonPermission(request, user)
		return RESTResponse({
			"isSuccess": False,
			"message": "User %s cannot be found." % (username)
		})

	async def checkGaimonPermission(self, request, user):
		data = request.json
		hashed = bytes.fromhex(data['hashed'])
		salt = bytes.fromhex(data['salt'])
		encodedTime = bytes.fromhex(data['encodedTime'])
		hashTime, = struct.unpack('<d', encodedTime)
		now = time.time()
		if (now - hashTime) > __SALT_TIME_LIMIT__:
			return RESTResponse({
				"isSuccess": False,
				"message": "Password time expired."
			})
		elif user.checkPassword(hashed, salt, encodedTime):
			if not user.isActive: return RESTResponse({"isSuccess": False, 'isActive': False, 'id': user.id, "message": "User has not activated."})
			token = await self.authen.saveSession(self.session, {'id': user.id}, self.entity)
			await self.setUserSession(request, user)
			return RESTResponse({"isSuccess": True, 'token': token})
		else:
			return RESTResponse({"isSuccess": False, "message": "Password not correct."})

	async def checkPHPPermission(self, request, user):
		from passlib.hash import phpass
		data = request.json
		hashed = data['hashed']
		current = user.passwordHash.strip()
		if phpass.verify(data['hashed'], current):
			salt = User.getSalt()
			user.salt = salt.hex()
			user.passwordHash = User.hashPassword(hashed.encode(), salt)
			await self.session.update(user)
			token = await self.authen.saveSession(self.session, {'id': user.id}, self.entity)
			await self.setUserSession(request, user)
			return RESTResponse({"isSuccess": True, 'token': token})
		else:
			return RESTResponse({"isSuccess": False, "message": "Password not correct."})

	def sendResetPasswordEmail(self, receiver: str, url: str):
		info = {'url': url}
		content = self.renderer.render(self.theme.getTemplate("Email.tpl"), info)
		if self.emailSender is None:
			logging.error(">>>> Cannot send email.")
			return
		self.emailSender.sendInBackground(
			receiver=receiver,
			subject="Reset Password",
			html=content
		)

	def setExternalLogin(self):
		config = self.application.config['authentication']
		isExternal = False
		self.page.jsVar['authentication'] = config
		self.page.jsVar['authentication']['isExternal'] = isExternal
		if config['google']['enable']:
			self.page.js.append("https://accounts.google.com/gsi/client")
			isExternal = True

		if isExternal:
			self.page.js.append('protocol/ExternalLoginProtocol.js')

	def isValidEmail(self, text: str) -> bool:
		return re.match(EMAIL_PATTERN, text)

	def randomString(self, length: int) -> str:
		return ''.join(random.choice(self.letter) for i in range(length))

	async def renderRenewPassword(self, user: User = None, code: str = None) -> str:
		self.page.reset()
		self.page.enableCrypto()
		self.page.title = f"{self.title} - Renew Password"
		await self.setFavIcon(self.page)
		self.page.css.append('Login.css')
		self.page.js.append('utils/Utils.js')
		self.page.js.append('Authentication.js')
		self.page.js.append('PasswordRenewPage.js')
		if user is not None: self.page.jsVar['user'] = user.toTransportDict()
		if code is not None: self.page.jsVar['code'] = code
		template = self.theme.getTemplate('PasswordRenew.tpl')
		data = {
			'rootURL': self.page.rootURL,
			'title': self.title,
			'icon': self.icon,
			'fullTitle': self.fullTitle,
			'language': await self.application.getLanguage(),
		}
		self.page.body = self.renderer.render(template, data)
		return response.html(self.page.render())

	async def setUserSession(self, request, user):
		request.ctx.session['uid'] = user.id
		if user.gid is None: request.ctx.session['gid'] = -1
		else: request.ctx.session['gid'] = user.gid
		role = await self.authen.processRole(self.session, user, self.entity)
		request.ctx.session['role'] = list(role)

	async def renderResetPasswordPage(self, hash, userID):	
		self.page.reset()
		self.page.enableCrypto()
		self.page.title = f"{self.title} - Renew Password"
		await self.setFavIcon(self.page)
		self.page.css.append('Login.css')
		self.page.css.append('AlertDialog.css')
		self.page.js.append('utils/Utils.js')
		self.page.js.append('Authentication.js')
		self.page.js.append('PasswordResetPage.js')
		user: User = await self.session.selectByID(User, userID)
		if user is None :
			return RESTResponse({"isSuccess": False, "message": "User is not exist."})
		if user is not None: self.page.jsVar['user'] = user.toTransportDict()
		template = self.theme.getTemplate('PasswordReset.tpl')
		data = {
			'rootURL': self.page.rootURL,
			'title': self.title,
			'icon': self.icon,
			'fullTitle': self.fullTitle,
			'language': await self.application.getLanguage(),
			'HASH_STRING': hash
		}
		self.page.body = self.renderer.render(template, data)
		return response.html(self.page.render())
	
	async def setIcon(self, page: HTMLPage):
		if len(self.icon) == 0: self.icon = 'share/icon/logo.png'
		page.icon = self.icon
	
	async def setFavIcon(self, page: HTMLPage):
		if len(self.favicon) == 0: return
		page.favicon = self.favicon
