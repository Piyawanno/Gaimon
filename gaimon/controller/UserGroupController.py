import logging
import traceback
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
class UserGroupController:
	def __init__(self, application):
		from gaimon.core.AsyncApplication import AsyncApplication
		self.application: AsyncApplication = application
		self.session: AsyncDBSessionBase = None
		self.resourcePath = self.application.resourcePath
		self.avatar = {}
		self.storeAvatarFile = createFileStore(self.application, 'user/avatar/')
		self.path = "/user/avatar/"
		self.notification = None
		self.userHandler:UserHandler = self.application.userHandler

	async def checkNotificationClient(self):
		if self.notification is not None: return
		self.notification = await self.application.getServiceClient(
			'gaimon.notification'
		)

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