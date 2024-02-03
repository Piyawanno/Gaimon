from gaimon.core.AsyncServiceClient import AsyncServiceClient
from gaimon.core.Route import GET, POST, ROLE
from gaimon.core.UserHandler import UserHandler
from gaimon.core.RESTResponse import(
	RESTResponse  as REST,
	SuccessRESTResponse as Success,
	ErrorRESTResponse as Error,
)
from gaimon.model.User import User
from gaimon.model.UserGroup import UserGroup
from gaimon.model.UserGroupPermission import UserGroupPermission, __GAIMON_ROLE__
from gaimon.model.PermissionType import PermissionType as PT
from xerial.AsyncDBSessionBase import AsyncDBSessionBase
from sanic import response, Request
from typing import List
from gaimon.util.RequestUtil import (
	createFileStore
)

import logging, traceback, os, string, random, json, mimetypes

@ROLE('gaimon.User')
class UserController:
	def __init__(self, application):
		from gaimon.core.AsyncApplication import AsyncApplication
		from gaimon.core.StaticFileHandler import StaticFileHandler
		self.application: AsyncApplication = application
		self.static: StaticFileHandler = self.application.static
		self.session: AsyncDBSessionBase = None
		self.extension = self.application.getExtensionInfo()
		self.entity: str = None
		self.resourcePath = self.application.resourcePath
		self.avatar = {}
		self.storeAvatarFile = createFileStore(self.application, 'user/avatar/', True)
		self.path = "/user/avatar/"
		self.notification = None
		self.userHandler:UserHandler = self.application.userHandler

	async def checkNotificationClient(self):
		if self.notification is not None: return
		self.notification = await self.application.getServiceClient(
			'gaimon.notification'
		)
  
	@POST("/user/get/by/id", permission=[PT.READ])
	async def getUserByID(self, request: Request):
		user: User = await self.userHandler.getUserByID(self.session, int(request.json['id']), request.headers['entity'])
		if user is None : return Error('User cannot be found.')
		else : return Success(user.toTransportDict())

	@POST("/user/global/get/by/id", role=['guest'])
	async def getUserGlobalByID(self, request: Request):
		user: User = await self.userHandler.getUserByID(self.session, int(request.json['id']), request.headers['entity'])
		if user is None : return Error('User cannot be found.')
		else : return Success({'id': request.json['id'], 'firstName' : user.firstName, 'lastName' : user.lastName, 'avatar': user.avatar})
		
	@GET('/user/global/avatar/get/<id>', role=['guest'])
	async def getAvatarGlobal(self, request, id):
		user: User = await self.userHandler.getUserByID(self.session, int(request.json['id']), request.headers['entity'])
		if user is None : return Error('User cannot be found.')
		picturePath = user.avatar
		picture = self.avatar.get(picturePath, None)
		if picturePath is None or not os.path.exists(picturePath):
			return response.text("Picture cannot be found.", status=404)
		fileType = mimetypes.guess_type(picturePath)
		if picture is not None:
			return response.raw(picture, content_type=fileType)
		path = f"{self.resourcePath}file/{picturePath}"
		if not os.path.isfile(path):
			return response.text("Picture cannot be found.", status=404)
		with open(path, 'rb') as fd:
			raw = fd.read()
			self.avatar[picturePath] = raw
		return response.raw(self.avatar[picturePath], content_type=fileType)

	@POST("/user/get/all", permission=[PT.READ])
	async def getAllUser(self, request: Request):
		result = await self.userHandler.getUserByConditionWithPage(self.session, request.json, request.headers['entity'])
		result['data'] = [i.toTransportDict() for i in result['data']]
		return Success(result)
	
	@POST('/user/option/get/autocomplete', permission=[PT.READ])
	async def getOptionByAutoComplete(self, request: Request):
		users:List[User] = await self.userHandler.getUserByWildcard(self.session, request.json, request.headers['entity'])
		return Success([i.toDict() for i in users])
	
	@POST('/user/option/get/autocomplete/by/reference', role=['user'])
	async def getAutoCompleteByID(self, request: Request):
		record = await self.userHandler.getUserByID(self.session, int(request.json['reference']), request.headers['entity'])
		if record is None :
			return REST({'isSuccess': True, 'label': '', 'result': {}})
		else :
			return REST({
				'isSuccess': True,
				'label': f"{record.firstName} {record.lastName}",
				'result': record.toDict()
			})

	@GET("/user/option/get", permission=[PT.READ])
	async def getUserOption(self, request: Request):
		users:List[User] = await self.userHandler.getAllUser(self.session, request.headers['entity'])
		return Success([i.toOption() for i in users])

	@POST("/user/drop", permission=[PT.DROP])
	async def dropUser(self, request: Request):
		await self.userHandler.dropUser(self.session, request.json)
		return REST({'isSuccess': True})

	@GET('/user/permission/module/get', permission=[PT.READ])
	async def getPermissionModule(self, request: Request):
		result = await self.extension.getRole(request)
		result['gaimon'] = __GAIMON_ROLE__
		return REST({'isSuccess': True, 'result': result})

	@POST('/user/autoComplete/get', permission=[PT.READ])
	async def getUser(self, request: Request):
		users:List[User] = await self.userHandler.getUserByWildcard(self.session, request.json, request.headers['entity'])
		return Success([i.toDict() for i in users])

	@POST('/user/autoComplete/get/by/reference', permission=[PT.READ])
	async def getAutoCompleteUserByID(self, request: Request):
		user: User = await self.userHandler.getUserByID(self.session, int(request.json['reference']), request.headers['entity'])
		fullName = ''
		result = {}
		if not user is None:
			result = user.toDict()
			fullName = user.firstName + ' ' + user.lastName
		return REST({
			'isSuccess': True,
			'label': fullName,
			'result': result
		})

	@GET('/user/avatar/get/<id>', role=['guest'])
	async def getAvatar(self, request, id):
		user:User = await self.userHandler.getUserByID(self.session, int(id), request.headers['entity'])
		if user is None: return response.text("Picture cannot be found.", status=404)
		picturePath = user.avatar
		if picturePath is None:
			return response.text("Picture cannot be found.", status=404)
		picture = self.avatar.get(picturePath, None)
		fileType = mimetypes.guess_type(picturePath)
		if picture is not None:
			return response.raw(picture, content_type=fileType)
		path = f"{self.resourcePath}file/{picturePath}"
		if not os.path.isfile(path):
			return response.text("Picture cannot be found.", status=404)
		with open(path, 'rb') as fd:
			raw = fd.read()
			self.avatar[picturePath] = raw
		return response.raw(self.avatar[picturePath], content_type=fileType)

	@POST("/user/avatar/update", permission=[PT.WRITE, PT.UPDATE])
	async def updateAvatar(self, request: Request):
		data = json.loads(request.form['data'][0])
		user:User = await self.userHandler.getUserByID(self.session, int(data['id']), request.headers['entity'])
		if user is None: return Error('Data does not exist.')
		if 'avatar' in request.files:
			avatar = await self.storeAvatarFile(request, 'avatar')
			data['avatar'] = avatar[0][1] if len(avatar) else ""
		user.avatar = data['avatar']
		await self.userHandler.updateUser(self.session, user.toDict())
		return Success()

	@POST("/user/password/update", permission=[PT.WRITE, PT.UPDATE])
	async def updatePassword(self, request: Request):
		data = request.json['data']
		user:User = await self.userHandler.getUserByID(self.session, int(data['id']), request.headers['entity'])
		if user is None: return Error('Data does not exist.')
		if len(data['passwordHash']) and data['passwordHash'] == data['confirm_passwordHash']:
			salt = User.getSalt()
			user.salt = salt.hex()
			user.passwordHash = User.hashPassword(data['passwordHash'].encode(), salt)
		await self.userHandler.updateUser(self.session, user.toDict())
		return REST({'isSuccess': True})

	@POST("/user/insert", permission=[PT.WRITE, PT.UPDATE])
	async def insert(self, request: Request):
		data = json.loads(request.form['data'][0])
		if 'avatar' in request.files:
			avatar = await self.storeAvatarFile(request, 'avatar')
			data['avatar'] = avatar[0][1] if len(avatar) else ""
		user = await self.userHandler.insertUser(self.session, data, request.headers['entity'])
		await self.application.authen.checkUserInformation(self.session, user.id, True, self.entity)
		try:
			await self.checkNotificationClient()
			await self.notification.call('/trigger/user', {})
		except Exception as error:
			logging.error(traceback.format_exc())
		userDict = user.toTransportDict()
		userDict['additional'] = data
		return Success(userDict)

	@POST("/user/update", permission=[PT.WRITE, PT.UPDATE])
	async def update(self, request: Request):
		data = json.loads(request.form['data'][0])
		isAvatar = False
		user = await self.userHandler.getUserByID(self.session, data['id'], request.headers['entity'])
		if user is None: return Error("User does not exist.")
		if 'avatar' in request.files:
			isAvatar = True
			avatar = await self.storeAvatarFile(request, 'avatar')
			data['avatar'] = avatar[0][1] if len(avatar) else ""
		if data['avatarRemoved'] or isAvatar:
			await self.static.removeStaticShare(user.avatar)
		if data['avatarRemoved'] :
			data['avatar'] = ''
		user = await self.userHandler.updateUser(self.session, data, request.headers['entity'])
		await self.application.authen.checkUserInformation(self.session, user.id, True, self.entity)
		userDict = user.toTransportDict()
		userDict['additional'] = data
		return Success(userDict)

	@POST("/user/option/getByIDList", permission=[PT.READ])
	async def getUserOptionByIDList(self, request: Request):
		IDList = [int(i) for i in request.json['IDList']]
		result = await self.userHandler.getUserOptionByIDList(self.session, IDList, request.headers['entity'])
		return Success(result)
	
	@POST("/user/username/isexist", role=["guest"])
	async def isUsernameExist(self, request: Request):
		result = await self.userHandler.isUsernameExist(self.session, request.json['username'], request.headers['entity'])
		return Success(result)

	@POST('/user/email/isexist', role=['guest'])
	async def isEmailExist(self, request: Request):
		result = await self.userHandler.isEmailExist(self.session, request.json['email'], request.headers['entity'])
		return Success(result)