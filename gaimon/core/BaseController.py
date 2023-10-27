from typing import Any, Dict, Tuple
from xerial.AsyncDBSessionBase import AsyncDBSessionBase

from gaimon.core.Route import POST, GET, ROLE
from gaimon.model.PermissionType import PermissionType as PT
from gaimon.util.RequestUtil import (
	createSelectHandler, createCountHandler, createOptionHandler,
	createInsertHandler, createUpdateHandler, createDropHandler,
	createInsertMultipleHandler, createOptionByIDHandler, createSelectByIDHandler, 
	createSelectByAttributeHandler, calculatePage
)

from gaimon.core.RESTResponse import (
	RESTResponse as REST,
	SuccessRESTResponse as Success,
	ErrorRESTResponse as Error
)
from sanic.request import RequestParameters

import pystache, math, string, json, os, random, time


def BASE(modelClass, baseRoute, role):
	def decoration(callable):
		decorateRole = ROLE(role)
		decorateRole(callable)
		callable.modelClass = modelClass

		if not hasattr(callable, 'getAll'):
			async def getAll(self, request):
				return await callable._getAll(self, request)
			callable.getAll = getAll

		if not hasattr(callable.getAll, '__ROUTE__'):
			route = f"{baseRoute}/get/all"
			decorator = POST(route, role=role, permission=[PT.READ])
			decorator(callable.getAll)

		if not hasattr(callable, 'getByReference'):
			async def getByReference(self, request):
				return await callable._getByReference(self, request)
			callable.getByReference = getByReference

		if not hasattr(callable.getByReference, '__ROUTE__'):
			route = f"{baseRoute}/get/by/reference"
			decorator = POST(route, role=role, permission=[PT.READ])
			decorator(callable.getByReference)

		if not hasattr(callable, 'getByID'):
			async def getByID(self, request, ID):
				return await callable._getByID(self, request, ID)
			callable.getByID = getByID

		if not hasattr(callable.getByID, '__ROUTE__'):
			route = f"{baseRoute}/get/by/id/<ID>"
			decorator = GET(route, role=role, permission=[PT.READ])
			decorator(callable.getByID)

		if not hasattr(callable, 'getOption'):
			async def getOption(self, request):
				return await callable._getOption(self, request)
			callable.getOption = getOption

		if not hasattr(callable.getOption, '__ROUTE__'):
			route = f"{baseRoute}/get/option"
			decorator = GET(route, permission=[PT.READ])
			decorator(callable.getOption)

		if not hasattr(callable, 'getOptionByIDList'):
			async def getOptionByIDList(self, request):
				return await callable._getOptionByIDList(self, request)
			callable.getOptionByIDList = getOptionByIDList

		if not hasattr(callable.getOptionByIDList, '__ROUTE__'):
			route = f"{baseRoute}/get/optionByIDList"
			decorator = POST(route, permission=[PT.READ])
			decorator(callable.getOptionByIDList)

		if not hasattr(callable, 'insert'):
			async def insert(self, request, hasFeedback=False):
				return await callable._insert(self, request, hasFeedback=hasFeedback)
			callable.insert = insert

		if not hasattr(callable.insert, '__ROUTE__'):
			route = f"{baseRoute}/insert"
			decorator = POST(route, permission=[PT.WRITE])
			decorator(callable.insert)
		
		if not hasattr(callable, 'insertMultiple'):
			async def insertMultiple(self, request, hasFeedback=False):
				return await callable._insertMultiple(self, request, hasFeedback=hasFeedback)
			callable.insertMultiple = insertMultiple

		if not hasattr(callable.insert, '__ROUTE__'):
			route = f"{baseRoute}/insert/multiple"
			decorator = POST(route, permission=[PT.WRITE])
			decorator(callable.insertMultiple)

		if not hasattr(callable, 'update'):
			async def update(self, request):
				return await callable._update(self, request)
			callable.update = update

		if not hasattr(callable.update, '__ROUTE__'):
			route = f"{baseRoute}/update"
			decorator = POST(route, permission=[PT.UPDATE])
			decorator(callable.update)

		if not hasattr(callable, 'drop'):
			async def drop(self, request):
				return await callable._drop(self, request)
			callable.drop = drop

		if not hasattr(callable.drop, '__ROUTE__'):
			route = f"{baseRoute}/drop"
			decorator = POST(route, permission=[PT.DROP])
			decorator(callable.drop)
		return callable

	return decoration


__UPLOAD_KEY__ = 'GAIMON_UPLOAD_SESSION'


class BaseController:
	def __init__(self, application):
		from gaimon.core.AsyncApplication import AsyncApplication
		self.application: AsyncApplication = application
		self.session: AsyncDBSessionBase = None
		self.resourcePath = self.application.resourcePath
		self.renderer = pystache.Renderer()
		self.title = self.application.title
		if not self.modelClass is None:
			self.initHandler(self.modelClass)

	def initHandler(self, modelClass):
		self.select = createSelectHandler(modelClass)
		self.selectByID = createSelectByIDHandler(modelClass)
		self.selectByReference = createSelectByAttributeHandler(modelClass)
		self.count = createCountHandler(modelClass)
		self.handleGetOption = createOptionHandler(modelClass)
		self.handleGetOptionByID = createOptionByIDHandler(modelClass)
		self.handleInsert = createInsertHandler(modelClass)
		self.handleInsertMultiple = createInsertMultipleHandler(modelClass)
		self.handleUpdate = createUpdateHandler(modelClass)
		self.handleDrop = createDropHandler(modelClass)

	async def _getAll(self, request):
		limit = int(request.json.get('limit', 20))
		result = await self.select(self.session, request.json)
		count = await self.count(self.session, request.json)
		count = calculatePage(count, limit)
		return REST({
			'isSuccess': True,
			'result': {
				'data': result,
				'count': count,
				'limit': limit
			}
		}, ensure_ascii=False)
	
	async def _getByReference(self, request):
		result = await self.selectByReference(self.session, request.json)
		if result is None: return Error("ID doesn't exist.")
		return Success(result.toDict())
	
	async def _getByID(self, request, ID):
		result = await self.selectByID(self.session, int(ID))
		if result is None:
			return Error("ID doesn't exist.")
		return Success(result.toDict())

	async def _getOption(self, request):
		result = await self.handleGetOption(self.session)
		return REST({'isSuccess': True, 'result': result}, ensure_ascii=False)

	async def _getOptionByIDList(self, request):
		result = await self.handleGetOptionByID(self.session, request.json['IDList'])
		return REST({'isSuccess': True, 'result': result}, ensure_ascii=False)

	async def _insert(self, request, hasFeedback=True):
		inserted = await self.handleInsert(self.session, request.json)
		if hasFeedback:
			result = inserted.toDict()
		else :
			result = {'id': inserted.id}
		return REST({'isSuccess': True, 'result': result}, ensure_ascii=False)
	
	async def _insertMultiple(self, request, hasFeedback=True):
		insertedList = await self.handleInsertMultiple(self.session, request.json)
		if hasFeedback:
			result = [i.toDict() for i in insertedList]
		else :
			result = [{'id': i.id} for i in insertedList]
		return REST({'isSuccess': True, 'result': result}, ensure_ascii=False)

	async def _update(self, request, hasFeedback=True):
		record = await self.handleUpdate(self.session, request.json)
		if not hasFeedback :
			return REST({'isSuccess': True, 'result': {}})
		else :
			if record is None :
				return REST({
					"isSuccess": False,
					"message": "LMSCourseCertificate does not exist."
				})
			else :
				return REST({
					'isSuccess': True,
					'result': record.toDict()
				}, ensure_ascii=False)

	async def _drop(self, request, hasFeedback=True):
		record = await self.handleDrop(self.session, request.json)
		if not hasFeedback :
			return REST({'isSuccess': True, 'result': {}})
		else :
			if record is None :
				return REST({
					"isSuccess": False,
					"message": "LMSCourseCertificate does not exist."
				})
			else :
				return REST({
					'isSuccess': True,
					'result': record.toDict()
				}, ensure_ascii=False)

	# TODO : Use WebSocket
	async def uploadMultiplePart(self, request, path) -> Dict[str, Any]:
		result = {'hasNext': True, 'key': '', 'offset': 0, 'name': '', 'limit': 1_000_000}
		data = json.loads(request.form['data'][0])
		isCreate = data['isCreate']
		if isCreate:
			size = data['size']
			name = data['name']
			key = ''.join(random.choice(string.ascii_lowercase)
							for i in range(20)) + '_' + str(int(time.time() * 1000))
			name = self.randomChunkFileName(name, path)
			session = {'name': name, 'size': size, 'offset': 0, 'limit': 1_000_000}
			await self.application.redis.hset(__UPLOAD_KEY__, key, json.dumps(session))
			result['key'] = key
			return result
		key = data['key']
		session = await self.application.redis.hget(__UPLOAD_KEY__, key)
		if session is None:
			result['hasNext'] = False
			result['offset'] = -1
			return result
		session = json.loads(session)
		await self.application.static.storeStaticFileChunk(
			session['name'],
			request.files['file'][0].body,
			session['offset']
		)
		session['offset'] += len(request.files['file'][0].body)
		if session['offset'] == session['size']:
			await self.application.redis.hdel(__UPLOAD_KEY__, key)
			result['hasNext'] = False
			result['offset'] = session['size']
			result['key'] = key
			result['name'] = session['name']
			return result
		else:
			await self.application.redis.hset(__UPLOAD_KEY__, key, json.dumps(session))
			result['offset'] = session['offset']
			result['key'] = key
			return result

	def randomChunkFileName(self, name, path):
		fileUpload = name.split('.')
		letters = string.ascii_lowercase
		dirPath = self.resourcePath + "file/" + path
		os.makedirs(dirPath, exist_ok=True)
		fileName = ''
		while True:
			fileName = ''.join(random.choice(letters) for i in range(20))
			if len(fileUpload): fileName = fileName + "." + fileUpload[1]
			if not os.path.exists(dirPath + fileName): break
		return path + fileName
