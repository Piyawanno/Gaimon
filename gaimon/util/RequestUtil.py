import typing
from xerial.AsyncDBSessionBase import AsyncDBSessionBase
from xerial.Column import Column
from xerial.StringColumn import StringColumn
from xerial.FractionColumn import FractionColumn
from xerial.IntegerColumn import IntegerColumn
from xerial.JSONColumn import JSONColumn
from xerial.CurrencyColumn import CurrencyColumn
from xerial.input.ReferenceSelectInput import ReferenceSelectInput
from xerial.input.EnumSelectInput import EnumSelectInput
from xerial.input.ImageInput import ImageInput
from xerial.input.FileInput import FileInput
from xerial.Record import Record

from typing import Tuple, Awaitable, List, Dict, Any, Callable
from sanic.request import RequestParameters, Request, File
from dataclasses import dataclass

import json, math, string, random, copy, pystache, re
T = typing.TypeVar("T")

__SELECT_INPUT__ = {ReferenceSelectInput, EnumSelectInput}

@dataclass
class ClauseState :
	key:str
	value:Any
	meta:Column
	clause:List[str]
	parameter:List[Any]

	def isReference(self) -> bool :
		input = getattr(self.meta, 'input', None)
		return  input.__class__ in __SELECT_INPUT__
	
def getRequestData(request) -> Dict:
	if 'data' in request.form:
		return json.loads(request.form['data'][0])
	else:
		return request.json

def processLimitOffset(request) -> Tuple[int, int] :
	limit: int = request.get('limit', None)
	offset: int = None
	if limit is not None:
		del request['limit']
		limit = min(200, limit)
		pageNumber = request.get('pageNumber', None)
		if pageNumber is not None:
			del request['pageNumber']
			offset = (pageNumber - 1) * limit
		else:
			offset = 0
	return limit, offset

def processStringClause(state:ClauseState) :
	state.clause.append(f'LOWER({state.key}) LIKE ?')
	state.parameter.append(f'%{state.value.lower()}%')

def processFractionClause(state:ClauseState) :
	state.clause.append(f'{state.key} = ?')
	state.parameter.append(state.meta.setValueToDB(state.meta.parseValue(state.value)))

def processReferenceClause(state:ClauseState) :
	if isinstance(state.meta, IntegerColumn) and int(state.value) == -1:
		# state.clause.append(f'{state.key} != ?')
		# state.parameter.append(state.meta.parseValue(state.value))
		pass
	else:
		state.clause.append(f'{state.key} = ?')
		state.parameter.append(state.meta.parseValue(state.value))
	
def processGenericClause(state:ClauseState) :
	state.clause.append(f'{state.key} = ?')
	state.parameter.append(state.meta.parseValue(state.value))

#NOTE : Return (List of clause, List of parameter)
def processEachClause(request, modelClass) -> Tuple[List[str], List[Any]] :
	metaMap = modelClass.metaMap
	clause = []
	parameter = []
	data = request.get('data', request)
	if data is None: data = {}
	state = ClauseState(None, None, None, clause, parameter)
	for state.key, state.value in data.items():
		state.meta = metaMap.get(state.key, None)
		if state.meta is None: continue
		if state.value is None: continue
		if isinstance(state.value, str) and len(state.value) == 0: continue
		if isinstance(state.meta, StringColumn): processStringClause(state)
		elif isinstance(state.meta, FractionColumn): processFractionClause(state)
		elif isinstance(state.meta, JSONColumn) or isinstance(state.meta, CurrencyColumn): continue
		elif state.isReference(): processReferenceClause(state)
		else: processGenericClause(state)
	return clause, parameter

# NOTE : Return (clause, parameter, limit, offset)
def processRequestQuery(request, modelClass, isOrder=False) -> Tuple[str, list, int, int]:
	request = copy.copy(request)
	limit, offset = processLimitOffset(request)
	clause, parameter = processEachClause(request, modelClass)
	clause = 'WHERE ' + (' AND '.join(clause)) if len(clause) else ''
	if isOrder:
		orderBy = request.get('orderBy', 'id')
		orderBy = processOrderBy(orderBy, modelClass)
		isDecreasing = request.get('isDecreasing', True)
		direction = 'DESC' if isDecreasing else 'ASC'
		clause = f'{clause} ORDER BY {orderBy} {direction}'
	return clause, parameter, limit, offset

def createSelectHandler(modelClass: type, isRelated=False):
	async def handleSelect(session: AsyncDBSessionBase, data: dict) -> List[Dict]:
		data = copy.copy(data)
		item = data.get('data', data)
		if item is None: item = {}
		item['isDrop'] = 0
		clause, parameter, limit, offset = processRequestQuery(data, modelClass)
		orderBy = data.get('orderBy', 'id')
		orderBy = processOrderBy(orderBy, modelClass)
		isDecreasing = data.get('isDecreasing', True)
		direction = 'DESC' if isDecreasing else 'ASC'
		fetched = await session.select(
			modelClass,
			f"{clause} ORDER BY {orderBy} {direction}",
			isRelated=isRelated,
			parameter=parameter,
			limit=limit,
			offset=offset
		)
		return [i.toDict() for i in fetched]
	return handleSelect

def createSelectHandlerByParameter(modelClass: type, isRelated=False):
	async def handleSelect(session: AsyncDBSessionBase, data: dict) -> List[Dict]:
		data = copy.copy(data)
		item = data.get('data', data)
		if item is None: item = {}
		item['isDrop'] = 0
		clause, parameter, limit, offset = processRequestQuery(data, modelClass)
		orderBy = data.get('orderBy', 'id')
		orderBy = processOrderBy(orderBy, modelClass)
		isDecreasing = data.get('isDecreasing', True)
		direction = 'DESC' if isDecreasing else 'ASC'
		fetched = await session.select(
			modelClass,
			f"{clause} ORDER BY {orderBy} {direction}",
			isRelated=isRelated,
			parameter=parameter,
			limit=limit,
			offset=offset
		)
		return [i.toDict() for i in fetched]
	return handleSelect

def processOrderBy(orderBy: str, modelClass: type):
	column = modelClass.metaMap.get(orderBy, None)
	if column is not None:
		if isinstance(column, CurrencyColumn):
			orderBy = f"CAST({orderBy}->>'originValue' AS FLOAT)"
		elif isinstance(column, JSONColumn) and column.orderAttribute is not None:
			orderBy = f"CAST({orderBy}->>'{column.orderAttribute}' AS {column.orderType})"
	return orderBy

def createSelectWithPageHandler(modelClass: type):
	async def handleSelectWithPage(session: AsyncDBSessionBase, data: dict) -> Dict:
		data = copy.copy(data)
		item = data.get('data', data)
		item['isDrop'] = 0
		orderBy = data.get('orderBy', 'id')
		clause, parameter, limit, offset = processRequestQuery(data, modelClass)
		orderBy = processOrderBy(orderBy, modelClass)
		direction = 'DESC' if data.get('isDecreasing', False) else 'ASC'
		fetched = await session.select(
			modelClass,
			f"{clause} ORDER BY {orderBy} {direction}",
			isRelated=False,
			parameter=parameter,
			limit=limit,
			offset=offset
		)
		count = await session.count(modelClass, clause, parameter=parameter)
		return {
			'data': [i.toDict() for i in fetched],
			'count': calculatePage(count, limit)
		}
	return handleSelectWithPage

def createSelectByIDHandler(modelClass: T):
	async def handleSelectByID(session: AsyncDBSessionBase, ID: int) -> T:
		fetched = await session.selectByID(modelClass, ID, isRelated=False, hasChildren=True)
		if fetched is None: return None
		if hasattr(modelClass, 'isDrop') and fetched.isDrop: return None
		return fetched
	return handleSelectByID

def createSelectByAttributeHandler(modelClass: T):
	async def handleSelectByAttribute(session: AsyncDBSessionBase, data: dict) -> T:
		data = copy.copy(data)
		item = data.get('data', data)
		item['isDrop'] = 0
		clause, parameter, limit, offset = processRequestQuery(data, modelClass)
		limit = 1
		offset = 0
		fetched = await session.select(
			modelClass,
			clause, 
			parameter=parameter, 
			limit=limit, 
			offset=offset, 
			isRelated=False, 
			hasChildren=True
		)
		if len(fetched) == 0: return None
		return fetched[0]
	return handleSelectByAttribute


def createCountHandler(modelClass: type):
	async def handleSelect(session: AsyncDBSessionBase, data: dict):
		data = copy.copy(data)
		item = data.get('data', data)
		if item is None: item = {}
		item['isDrop'] = 0
		clause, parameter, limit, offset = processRequestQuery(data, modelClass)
		count = await session.count(modelClass, clause, parameter=parameter)
		return count
	return handleSelect


def calculatePage(count, limit):
	page = math.ceil(count / int(limit))
	return page if page > 0 else 1

def createOptionHandler(modelClass: type):
	if hasattr(modelClass, 'isDrop'):
		clause = 'WHERE isDrop=0'
	else:
		clause = ''

	async def handleOption(session: AsyncDBSessionBase):
		fetched = await session.select(modelClass, clause, isRelated=False)
		return [i.toOption() for i in fetched]

	return handleOption

def createOptionByIDHandler(modelClass: type):
	async def handleOption(session: AsyncDBSessionBase, IDList:List[int]):
		if hasattr(modelClass, 'isDrop'):
			dropClause = 'AND isDrop=0'
		else:
			dropClause = ''
		if len(IDList) == 0: return {}
		try: IDList = [int(i) for i in IDList if len(i) > 0]
		except: pass
		IDclause = ",".join(len(IDList)*'?')
		clause = f"WHERE {modelClass.primary} IN ({IDclause}) {dropClause}"
		fetched = await session.select(modelClass, clause, parameter=IDList, isRelated=False)
		return {i.id: i.toOption() for i in fetched}

	return handleOption

def createAutocompleteHandler(modelClass: type):
	async def handleAutocomplete(session: AsyncDBSessionBase, data: dict):
		data = copy.copy(data)
		wildcard = data.get('name', '')
		limit = int(data.get('limit', 10))
		template = data.get('template', None)
		if template == '{{{label}}}' or template == '': template = None
		representativeMeta = modelClass.representativeMeta		
		if representativeMeta is None: return []
		columns = []
		for key in getattr(modelClass, 'metaMap', {}):
			meta = modelClass.metaMap[key]
			if isinstance(meta, StringColumn):
				columns.append(meta.name)
		columnsClause = " OR ".join([f"{i} LIKE ?" for i in columns])
		columnName = representativeMeta.name
		clause = "WHERE isDrop = 0"
		parameter = []
		if len(wildcard):
			clause = f"WHERE {columnsClause} AND isDrop = 0"
			parameter = [wildcard+'%' for i in columns]
		items = await session.select(modelClass, clause, parameter=parameter, limit=limit)
		if template is None: return [{'id': item.id, 'value': item.id, 'label': getattr(item, columnName, '')} for item in items]
		result = []
		for item in items:
			result.append({
				'id': item.id,
				'value': item.id,
				'label': pystache.render(template, item),
			})
		return result
	return handleAutocomplete

def createAutocompleteByReferenceHandler(modelClass: type):
	async def handleAutocompleteByReference(session: AsyncDBSessionBase, data: dict):
		data = copy.copy(data)
		representativeMeta = modelClass.representativeMeta
		if representativeMeta is None: return []
		columnName = representativeMeta.name
		reference = data.get('reference', '')
		template = data.get('template', None)
		if template == '{{{label}}}' or template == '': template = None
		referenceColumn = getattr(modelClass, '__REFERENCE__', 'id')
		items = await session.select(modelClass, f"WHERE {referenceColumn} = {reference}", limit=1)
		result = {}
		if len(items):
			item = items[0]
			result['id'] = item.id
			result['value'] = item.id
			if template is None: result['label'] = getattr(item, columnName, '')
			else: result['label'] = pystache.render(template, item)
		return result
	return handleAutocompleteByReference

def createIngestHandler(modelClass: T):
	async def handleIngest(session: AsyncDBSessionBase, data: dict) -> T:
		isUpdate = False
		if 'id' in data:
			record = await session.selectByID(modelClass, data['id'])
			if record is not None : isUpdate = True
		if isUpdate :
			record.fromDict(data)
			await session.update(record)
		else:
			record = modelClass()
			data['isDrop'] = 0
			record.fromDict(data)
			await session.insert(record)
		return record

	return handleIngest

def createInsertWithFileHandler(application, modelClass: T):
	initStatus = []
	storeFileMap = {}
	def getFileInput() :
		if len(initStatus) : return
		initStatus.append(True)
		if not hasattr(modelClass, '__file_input__') : return
		for i in modelClass.__file_input__ :
			isShare = i.isShare
			storeFileMap[i.columnName] = createFileStore(application, i.path, isShare)
	handleInsert = createInsertHandler(modelClass)
	async def handle(session: AsyncDBSessionBase, data: dict, request:Request) -> T:
		if getattr(request, 'form', None) is None:
			record = await handleInsert(session, data)
			return record
		if not 'data' in request.form:
			record = await handleInsert(session, data)
			return record
		getFileInput()
		for k, v in storeFileMap.items() :
			meta = modelClass.metaMap.get(k, None)
			if meta is None: continue
			pathList = await v(request, k)
			if meta.input.__class__ == ImageInput:
				if len(pathList): pathList = pathList[0][1]
				data[k] = pathList
				continue
			if meta.input.__class__ == FileInput:
				if len(pathList): pathList = pathList[0]
				data[k] = json.dumps(pathList)
				continue
			data[k] = json.dumps(pathList)
		record = await handleInsert(session, data)
		return record
	return handle

def createInsertHandler(modelClass: T):
	async def handleInsert(session: AsyncDBSessionBase, data: dict) -> T:
		record = modelClass().fromDict(data)
		await session.insert(record)
		return record
	return handleInsert

def createInsertMultipleHandler(modelClass: T):
	async def handleInsert(session: AsyncDBSessionBase, data: List[Dict[str, Any]]) -> List[T]:
		recordList = [modelClass().fromDict(i) for i in data]
		await session.insertMultiple(recordList, isReturningID=True, isAutoID=True)
		return recordList
	return handleInsert

def createUpdateWithFileHandler(application, modelClass: T):
	from gaimon.core.StaticFileHandler import StaticFileHandler
	initStatus = []
	storeFileMap = {}
	removeFileMap = {}
	fileHandler:StaticFileHandler = application.static
	handleUpdate = createUpdateHandler(modelClass)

	def getFileInput() :
		if len(initStatus) : return
		initStatus.append(True)
		if not hasattr(modelClass, '__file_input__') : return
		for i in modelClass.__file_input__ :
			isShare = i.isShare
			storeFileMap[i.columnName] = createFileStore(application, i.path, isShare)
			if isShare :
				removeFileMap[i.columnName] = fileHandler.removeStaticShare
			else :
				removeFileMap[i.columnName] = fileHandler.removeStaticFile
	
	async def handle(session: AsyncDBSessionBase, data: dict, request:Request) -> T:
		if getattr(request, 'form', None) is None: 
			record = await handleUpdate(session, data)
			return record
		if not 'data' in request.form:
			record = await handleUpdate(session, data)
			return record
		getFileInput()
		async def storeFile(data, record) :
			files = getattr(request, 'files', None)
			for k, v in storeFileMap.items() :
				currentPath = getattr(record, k, None)
				isRemove = data.get(f'{k}Removed', False)
				if (isRemove or k in files) and currentPath is not None:
					data[k] = ""
					await removeFileMap[k](currentPath)
					if k not in files: continue
				if k not in files :
					data[k] = currentPath
					continue
				meta = modelClass.metaMap.get(k, None)
				if meta is None: continue
				pathList = await v(request, k)
				if meta.input.__class__ == ImageInput:
					if len(pathList): pathList = pathList[0][1]
					data[k] = pathList
					continue
				if meta.input.__class__ == FileInput:
					if len(pathList): pathList = pathList[0]
					data[k] = json.dumps(pathList)
					continue
				data[k] = json.dumps(pathList)
		record = await handleUpdate(session, data, storeFile)
		return record
	return handle


def createUpdateHandler(modelClass: T):
	async def handleUpdate(session: AsyncDBSessionBase, data: dict, handleMixin: Callable=None) -> T:
		id = data.get('id', None)
		if id is None : return None
		record = await session.selectByID(modelClass, data['id'], hasChildren=True)
		if record is not None :
			await updateChildren(session, record, data)
			if handleMixin is not None : await handleMixin(data, record)
			record.fromDict(data)
			await session.update(record)
			return record
		else:
			return None

	async def updateChildren(session: AsyncDBSessionBase, record: Record, data:dict):
		for i in record.__class__.children:
			await updateEachChildren(session, record, data, i.name)

	async def updateEachChildren(session: AsyncDBSessionBase, record: Record, data:dict, attribute: str):
		childData = data.get(attribute, [])
		if attribute in data: del data[attribute]
		childMap = {int(i['id']): i for i in childData if 'id' in i}
		childData = [i for i in childData if not 'id' in i]
		childRecordList:List[Record] = getattr(record, attribute, [])
		if childRecordList is None: childRecordList = []
		for childRecord in childRecordList:
			item = childMap.get(childRecord.id, None)
			if item is None: 
				await session.drop(childRecord)
				continue
			childRecord.fromDict(item)
			await session.update(childRecord)
			del childMap[childRecord.id]

		childData.extend([childMap[i] for i in childMap])
		data[attribute] = childData

	return handleUpdate

def createIngestHandlerWithDynamicModel(modelClass: T, getDynamicModel: Awaitable):
	async def ingestDynamicModel(session: AsyncDBSessionBase, record: Record, data: dict):
		data['detailTable'] = int(data['detailTable'])
		if data['detailTable'] <= 0: return
		dynamicModelClass = await getDynamicModel(data['detailTable'])
		if dynamicModelClass is None: return
		dynamic: Record = dynamicModelClass()
		if record.detailID == -1:
			dynamic.fromDict(data)
			dynamic.typeRecordID = record.id
			await session.insert(dynamic)
		else:
			fetched = await session.select(
				dynamicModelClass,
				"WHERE id=?",
				isRelated=False,
				parameter=[record.detailID],
				limit=1
			)
			if len(fetched):
				dynamic = fetched[0]
				dynamic.fromDict(data)
				dynamic.typeRecordID = record.id
				await session.update(dynamic)
			else:
				dynamic.fromDict(data)
				dynamic.typeRecordID = record.id
				await session.insert(dynamic)
		record.detailID = dynamic.id
		record.detail = json.dumps(dynamic.toDict())
		await session.update(record)

	async def handleIngest(session: AsyncDBSessionBase, data: dict) -> T:
		record = modelClass()
		if 'id' in data:
			parameter = [data['id']]
			fetched = await session.select(
				modelClass,
				"WHERE id=?",
				isRelated=False,
				parameter=parameter,
				limit=1
			)
			if len(fetched):
				record = fetched[0]
				record.fromDict(data)
				await session.update(record)
				await ingestDynamicModel(session, record, data)
			else:
				return None
		else:
			data['isDrop'] = 0
			record.fromDict(data)
			await session.insert(record)
			await ingestDynamicModel(session, record, data)
		return record

	return handleIngest


def createDropHandler(modelClass: T):
	async def handleDrop(session:AsyncDBSessionBase, data) -> T:
		if 'id' not in data: return
		record = await session.selectByID(modelClass, data['id'])
		if record is None : return
		record.isDrop = 1
		await session.update(record)
		fieldMap = {'isDrop' : 0}
		for child in modelClass.children:
			childRecordList = getattr(record, child.name)
			childIDList = [getattr(i, child.model.primary) for i in childRecordList]
			if len(childIDList):
				await session.setFieldByIDList(child.model, fieldMap, childIDList)
		return record
	return handleDrop

def createFileStore(application, path:str, isShare:bool=False) :
	from gaimon.core.StaticFileHandler import StaticFileHandler
	static:StaticFileHandler = application.static
	store = static.storeStaticShare if isShare else static.storeStaticFile
	async def storeFile(request:Request, key:str, currentList:List[List[str]] = [], deleteList: List[List[str]] = []) :
		if type(currentList) == str: currentList = json.loads(currentList)
		if type(deleteList) == str: deleteList = json.loads(deleteList)
		currentList = currentList.copy()
		deleteList = deleteList.copy()
		for i in deleteList:
			if i in currentList: currentList.remove(i)
		files = getattr(request, 'files', None)
		if files is None: return currentList
		requestFile:RequestParameters = request.files.get(key, None)
		if key not in request.files: return currentList
		requestFile = request.files[key]
		if requestFile is None : return currentList
		pathList = []

		if isinstance(requestFile, list) :
			fileList = requestFile
		elif isinstance(requestFile, File) :
			fileList = [requestFile]
		else :
			raise ValueError('File is invalid.')
		for file in fileList :
			letters = string.ascii_lowercase
			fileUpload = file.name.split('.')[-1]
			fileName = ''.join(random.choice(letters) for i in range(20))
			fileName = fileName + "." + fileUpload
			await store(path+fileName, file.body)
			pathList.append([file.name, path + fileName])
		currentList.extend(pathList)
		return currentList
	return storeFile

def createFileRemove(application) :
	from gaimon.core.StaticFileHandler import StaticFileHandler
	static:StaticFileHandler = application.static
	async def removeFile(fileList):
		for i in fileList:
			await static.removeStaticFile(i)
	return removeFile

if __name__ == '__main__':
	from gaimon.util.ProcessUtil import readConfig
	from gaimon.model.User import User
	from xerial.AsyncDBSessionPool import AsyncDBSessionPool
	import asyncio

	config = readConfig(['Gaimon.json'], {'DB': 'Database.json', })

	async def run():
		pool = AsyncDBSessionPool(config['DB'])
		await pool.createConnection()
		session = await pool.getSession()
		session.appendModel(User)
		await session.createTable()
		ingest = createIngestHandler(User)
		data = {'username': 'infamous'}
		await ingest(session, data)

	asyncio.run(run())