import logging
import traceback
from gaimon.core.AsyncServiceClient import AsyncServiceClient
from gaimon.core.Route import GET, POST, ROLE
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
from sanic import response
from typing import List
import math, os, string, random, json, mimetypes
from gaimon.util.RequestUtil import (
	processRequestQuery,
	createInsertHandler,
	createUpdateHandler,
	createSelectHandler,
	createDropHandler,
	createFileStore
)

@ROLE('gaimon.User')
class UserController:
	def __init__(self, application):
		from gaimon.core.AsyncApplication import AsyncApplication
		self.application: AsyncApplication = application
		self.session: AsyncDBSessionBase = None
		self.resourcePath = self.application.resourcePath
		self.avatar = {}
		self.storeAvatarFile = createFileStore(self.application, 'user/avatar/')
		self.path = "/user/avatar/"
		self.notification = None

	async def checkNotificationClient(self):
		if self.notification is not None: return
		self.notification = await self.application.getServiceClient(
			'gaimon.notification'
		)
  
	@POST("/user/get/by/id", permission=[PT.READ])
	async def getUserByID(self, request):
		user: User = await self.session.selectByID(User, int(request.json['id']))
		if user is None : return Error('User cannot be found.')
		else : return Success(user.toTransportDict())

	@POST("/user/global/get/by/id", role=['guest'])
	async def getUserGlobalByID(self, request):
		user: User = await self.session.selectByID(User, request.json['id'])
		if user is None : return Error('User cannot be found.')
		else : return Success({'firstName' : user.firstName, 'lastName' : user.lastName})
		
	@GET('/user/global/avatar/get/<id>', role=['guest'])
	async def getAvatarGlobal(self, request, id):
		user: User = await self.session.selectByID(User, id)
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
	async def getAllUser(self, request):
		clause, parameter, limit, offset = processRequestQuery(request.json, User)
		users: List[User] = await self.session.select(
			User,
			clause,
			parameter=parameter,
			limit=limit,
			offset=offset
		)
		count = await self.session.count(User, clause, parameter=parameter)
		return Success({
			'data': [i.toTransportDict() for i in users],
			'count': math.ceil(count / limit)
		})
	
	@POST('/user/option/get/autocomplete', permission=[PT.READ])
	async def getOptionByAutoComplete(self, request):
		wildCard = request.json['name']+'%'
		items = await self.session.select(
			User,
			"WHERE (username LIKE ? OR displayName LIKE ? OR firstName LIKE ? OR lastName LIKE ?) AND isDrop = 0",
			parameter=[wildCard, wildCard, wildCard, wildCard],
			limit=int(request.json['limit'])
		)
		return REST({'isSuccess': True, 'result': [i.toDict() for i in items]})
	
	@POST('/user/option/get/autocomplete/by/reference', role=['user'])
	async def getAutoCompleteByID(self, request):
		print('asdasdsad', request.json['reference'])
		record = await self.session.selectByID(User, request.json['reference'])
		print('record', record)
		if record is None :
			return REST({'isSuccess': True, 'label': '', 'result': {}})
		else :
			return REST({
				'isSuccess': True,
				'label': f"{record.firstName} {record.lastName}",
				'result': record.toDict()
			})

	@GET("/user/option/get", permission=[PT.READ])
	async def getUserOption(self, request):
		users = await self.session.select(User, 'WHERE isDrop=0')
		return REST({
			'isSuccess': True,
			'results': [i.toOption() for i in users]
		})

	async def updateUser(self, data: dict) -> User:
		user = User()
		parameter = [int(data['id'])]
		users = await self.session.select(
			User,
			'WHERE id=?',
			parameter=parameter,
			limit=1
		)
		if len(users) != 0: user = users[0]
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
		if len(data['passwordHash']
				) and data['passwordHash'] == data['confirm_passwordHash']:
			salt = User.getSalt()
			user.salt = salt.hex()
			user.passwordHash = User.hashPassword(data['passwordHash'].encode(), salt)
		return user

	async def createUser(self, data: dict) -> User:
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
		if len(data['passwordHash']
				) and data['passwordHash'] == data['confirm_passwordHash']:
			salt = User.getSalt()
			user.salt = salt.hex()
			user.passwordHash = User.hashPassword(data['passwordHash'].encode(), salt)
		return user

	@POST("/user/drop", permission=[PT.DROP])
	async def dropUser(self, request):
		data = request.json
		if not 'id' in data:
			return REST({'isSuccess': False, 'message': "ID is not exist."})
		parameter = [int(data['id'])]
		models = await self.session.select(
			User,
			'WHERE id=?',
			parameter=parameter,
			limit=1
		)
		if len(models) == 0:
			return REST({'isSuccess': False, 'message': "ID is not exist."})
		model: User = models[0]
		model.isDrop = 1
		await self.session.update(model)
		return REST({'isSuccess': True})

	@GET("/user/group/option/get", permission=[PT.READ])
	async def getUserGroupOption(self, request):
		groups = await self.session.select(UserGroup, 'WHERE isDrop=0 ORDER BY id DESC')
		return REST({
			'isSuccess': True,
			'results': [i.toOption() for i in groups]
		})

	@POST("/user/group/get/all", permission=[PT.READ])
	async def getAllUserGroup(self, request):
		pageNumber = int(request.json['pageNumber'])
		limit = int(request.json['limit'])
		if limit > 200: limit = 200
		offset = (pageNumber - 1) * limit
		groups = await self.session.select(
			UserGroup,
			'WHERE isDrop=0 ORDER BY id DESC',
			limit=limit,
			offset=offset
		)
		count = await self.session.count(UserGroup, 'WHERE isDrop=0')
		count = math.ceil(count / limit)
		groupsIDList = ', '.join([str(i.id) for i in groups])
		permissions = {}
		if len(groupsIDList):
			models = await self.session.select(
				UserGroupPermission,
				'WHERE gid IN (%s)' % groupsIDList
			)
			for i in models:
				if not i.gid in permissions: permissions[i.gid] = []
				permissions[i.gid].append(i.toDict())
		results = []
		for i in groups:
			result = i.toDict()
			result['permissions'] = []
			if i.id in permissions: result['permissions'] = permissions[i.id]
			results.append(result)
		return REST({
			'isSuccess': True,
			'results': {
				'data': results,
				'count': count
			}
		})

	@POST("/user/group/add", permission=[PT.WRITE, PT.UPDATE])
	async def addUserGroup(self, request):
		data = request.json
		model = None
		if not 'id' in data:
			model = UserGroup()
			model.fromDict(data)
			print("data", data)
			await self.session.insert(model)
		else:
			parameter = [int(data['id'])]
			models = await self.session.select(
				UserGroup,
				'WHERE id=?',
				parameter=parameter,
				limit=1
			)
			if len(models): model: UserGroup = models[0]
			model.fromDict(data)
			await self.session.update(model)
		parameter = [model.id]
		permissions = await self.session.select(
			UserGroupPermission,
			'WHERE gid=?',
			parameter=parameter
		)
		[await self.session.drop(i) for i in permissions]
		if not 'records' in data: return REST({'isSuccess': True})
		permissions = []
		for item in data['records']:
			permission = UserGroupPermission()
			permission.fromDict(item)
			print("permission", permission)
			permission.gid = model.id
			print(permission.toDict())
			permissions.append(permission)
		await self.session.insertMultiple(permissions)
		await self.authen.getRoleByGroupID(self.session, model.id, isForce=True)
		return REST({'isSuccess': True})

	@POST("/user/group/drop", permission=[PT.DROP])
	async def dropUserGroup(self, request):
		data = request.json
		if not 'id' in data:
			return REST({'isSuccess': False, 'message': "ID is not exist."})
		parameter = [int(data['id'])]
		models = await self.session.select(
			UserGroup,
			'WHERE id=?',
			parameter=parameter,
			limit=1
		)
		if len(models) == 0:
			return REST({'isSuccess': False, 'message': "ID is not exist."})
		model: UserGroup = models[0]
		model.isDrop = 1
		await self.session.update(model)
		return REST({'isSuccess': True})

	@GET('/user/permission/module/get', permission=[PT.READ])
	async def getPermissionModule(self, request):
		results = self.application.extension.role
		results['gaimon'] = __GAIMON_ROLE__
		return REST({'isSuccess': True, 'results': results})

	@POST('/user/autoComplete/get', permission=[PT.READ])
	async def getUser(self, request):
		name = f"%{request.json['name']}%"
		clause = [f" firstName LIKE ?", f" OR lastName LIKE ?", ]
		parameter = [name, name]
		items = await self.session.select(
			User,
			"WHERE " + (" ".join(clause)),
			parameter=parameter,
			limit=int(request.json['limit'])
		)
		return REST({
			'isSuccess': True,
			'results': [i.toDict() for i in items]
		})

	@POST('/user/autoComplete/get/by/reference', permission=[PT.READ])
	async def getAutoCompleteUserByID(self, request):
		reference = request.json['reference']
		fullName = ''
		results = {}
		parameter = [int(reference)]
		user = await self.session.select(
			User,
			f"WHERE id=?",
			parameter=parameter,
			limit=1
		)
		if len(user):
			user = user[0]
			results = user.toDict()
			fullName = user.firstName + ' ' + user.lastName
		return REST({
			'isSuccess': True,
			'label': fullName,
			'results': results
		})

	async def saveAttachedFile(self, file, pathFile):
		fileUpload = file[0].name.split('.')
		letters = string.ascii_lowercase
		fileUpload = file[0].name.split('.')
		path = self.resourcePath + "file/" + pathFile
		fileName = ''.join(random.choice(letters) for i in range(20))
		fileName = fileName + "." + fileUpload[1]
		await self.application.static.storeStaticFile(pathFile + fileName, file[0].body)
		return pathFile + fileName

	@GET('/user/avatar/get/<id>', role=['guest'])
	async def getAvatar(self, request, id):
		parameter = [int(id)]
		model = await self.session.select(
			User,
			f"WHERE id=?",
			parameter=parameter,
			limit=1
		)
		if len(model) == 0: return response.text("Picture cannot be found.", status=404)
		picturePath = model[0].avatar
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
	async def updateAvatar(self, request):
		data = json.loads(request.form['data'][0])
		parameter = [int(data['id'])]
		user = await self.session.select(
			User,
			f"WHERE id=? AND isDrop=0",
			parameter=parameter,
			limit=1
		)
		if len(user) == 0:
			return REST({'isSuccess': False, 'message': 'Data is not exist.'})
		user = user[0]
		if 'avatar' in request.files:
			data['avatar'] = await self.saveAttachedFile(
				request.files['avatar'],
				self.path
			)
		user.avatar = data['avatar']
		await self.session.update(user)
		return REST({'isSuccess': True})

	@POST("/user/password/update", permission=[PT.WRITE, PT.UPDATE])
	async def updatePassword(self, request):
		data = request.json['data']
		parameter = [int(data['id'])]
		user = await self.session.select(
			User,
			f"WHERE id=? AND isDrop=0",
			parameter=parameter,
			limit=1
		)
		if len(user) == 0:
			return REST({'isSuccess': False, 'message': 'Data is not exist.'})
		user = user[0]
		if len(data['passwordHash']
				) and data['passwordHash'] == data['confirm_passwordHash']:
			salt = User.getSalt()
			user.salt = salt.hex()
			user.passwordHash = User.hashPassword(data['passwordHash'].encode(), salt)
		await self.session.update(user)
		return REST({'isSuccess': True})

	@POST("/user/group/insert", permission=[PT.WRITE, PT.UPDATE])
	async def insertUserGroup(self, request):
		data = request.json['data']
		model = None
		model = UserGroup()
		model.fromDict(data)
		await self.session.insert(model)
		parameter = [int(model.id)]
		permissions = await self.session.select(
			UserGroupPermission,
			'WHERE gid=?',
			parameter=parameter
		)
		[await self.session.drop(i) for i in permissions]
		if not 'records' in data: return REST({'isSuccess': True})
		permissions = []
		for item in data['records']:
			permission = UserGroupPermission()
			permission.fromDict(item)
			permission.gid = model.id
			permissions.append(permission)
		await self.session.insertMultiple(permissions)
		await self.authen.getRoleByGroupID(self.session, model.id, isForce=True)
		try:
			await self.checkNotificationClient()
			await self.notification.call('/trigger/user', {})
		except Exception as error:
			logging.error(traceback.format_exc())
		return REST({'isSuccess': True})

	@POST("/user/group/update", permission=[PT.WRITE, PT.UPDATE])
	async def updateUserGroup(self, request):
		data = request.json['data']
		model = None
		parameter = [int(data['id'])]
		models = await self.session.select(
			UserGroup,
			'WHERE id=?',
			parameter=parameter,
			limit=1
		)
		if len(models): model: UserGroup = models[0]
		model.fromDict(data)
		await self.session.update(model)
		parameter = [int(model.id)]
		permissions = await self.session.select(
			UserGroupPermission,
			'WHERE gid=?',
			parameter=parameter
		)
		[await self.session.drop(i) for i in permissions]
		if not 'records' in data: return REST({'isSuccess': True})
		permissions = []
		for item in data['records']:
			permission = UserGroupPermission()
			permission.fromDict(item)
			permission.gid = model.id
			permissions.append(permission)
		await self.session.insertMultiple(permissions)
		await self.authen.getRoleByGroupID(self.session, model.id, isForce=True)
		try:
			await self.checkNotificationClient()
			await self.notification.call('/trigger/user', {})
		except Exception as error:
			logging.error(traceback.format_exc())
		return REST({'isSuccess': True})

	@POST("/user/insert", permission=[PT.WRITE, PT.UPDATE])
	async def insert(self, request):
		data = json.loads(request.form['data'][0])
		if 'avatar' in request.files:
			data['avatar'] = await self.saveAttachedFile(
				request.files['avatar'],
				self.path
			)
		user = await self.createUser(data)
		await self.session.insert(user)
		try:
			await self.checkNotificationClient()
			await self.notification.call('/trigger/user', {})
		except Exception as error:
			logging.error(traceback.format_exc())
		userDict = user.toTransportDict()
		userDict['additional'] = data
		return Success(userDict)

	@POST("/user/update", permission=[PT.WRITE, PT.UPDATE])
	async def update(self, request):
		data = json.loads(request.form['data'][0])
		if 'avatar' in request.files: 
			avatar = await self.storeAvatarFile(request, 'avatar')
			data['avatar'] = avatar[0][1] if len(avatar) else ""
		if data['avatarRemoved']: data['avatar'] = ''
		user = await self.updateUser(data)
		await self.session.update(user)
		try:
			await self.checkNotificationClient()
			await self.notification.call('/trigger/user', {})
		except Exception as error:
			logging.error(traceback.format_exc())
		userDict = user.toTransportDict()
		userDict['additional'] = data
		return Success(userDict)

	@POST("/user/role/update", permission=[PT.WRITE, PT.UPDATE])
	async def updateUserRole(self, request):
		data = request.json['data']
		parameter = [int(data['id'])]
		user = await self.session.select(User, 'WHERE id=?', parameter=parameter, limit=1)
		if len(user) == 0:
			return REST({'isSuccess': False, 'message': 'Data is not exist.'})
		user = user[0]
		user.gid = data['gid']
		await self.session.update(user)
		try:
			await self.checkNotificationClient()
			await self.notification.call('/trigger/user', {})
		except Exception as error:
			logging.error(traceback.format_exc())
		return REST({'isSuccess': True})

	@GET('/user/avatar/image/<ID>', permission=[PT.READ], role=['guest'])
	async def getAvatarImage(self, request, ID):
		try:
			ID = int(ID)
		except:
			return response.text("File cannot be found.", status=404)
		model:User = await self.session.selectByID(User, ID)
		if model is None:
			return response.text("File cannot be found.", status=404)
		if model.avatar is None or len(model.avatar) == 0:
			return await response.file(f"{self.resourcePath}share/icon/logo_padding.png")		
		path = f"{self.resourcePath}file/{model.avatar}"
		if not os.path.isfile(path):
			return await response.file(f"{self.resourcePath}share/icon/logo_padding.png")
		return await response.file(path)