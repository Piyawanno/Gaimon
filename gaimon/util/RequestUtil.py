from xerial.AsyncDBSessionBase import AsyncDBSessionBase
from xerial.Column import Column
from xerial.StringColumn import StringColumn
from xerial.FractionColumn import FractionColumn
from xerial.IntegerColumn import IntegerColumn
from xerial.input.ReferenceSelectInput import ReferenceSelectInput
from xerial.input.EnumSelectInput import EnumSelectInput
from xerial.Record import Record

from typing import Tuple, Awaitable, List, Dict, Any
from sanic.request import RequestParameters, Request, File
from dataclasses import dataclass

import json, math, string, random, copy

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
	state.clause.append(f'{state.key} LIKE ?')
	state.parameter.append(f'%{state.value}%')

def processFractionClause(state:ClauseState) :
	state.clause.append(f'{state.key} = ?')
	state.parameter.append(state.meta.setValueToDB(state.meta.parseValue(state.value)))

def processReferenceClause(state:ClauseState) :
	if isinstance(state.meta, IntegerColumn) and int(state.value) == -1:
		state.clause.append(f'{state.key} != ?')
		state.parameter.append(state.meta.parseValue(state.value))
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
	state = ClauseState(None, None, None, clause, parameter)
	for state.key, state.value in data.items():
		state.meta = metaMap.get(state.key, None)
		if state.meta is None: continue
		if state.value is None: continue
		if isinstance(state.value, str) and len(state.value) == 0: continue

		if isinstance(state.meta, StringColumn): processStringClause(state)
		elif isinstance(state.meta, FractionColumn): processFractionClause(state)
		elif state.isReference(): processReferenceClause(state)
		else: processGenericClause(state)
	return clause, parameter

# NOTE : Return (clause, parameter, limit, offset)
def processRequestQuery(request, modelClass) -> Tuple[str, list, int, int]:
	request = copy.copy(request)
	limit, offset = processLimitOffset(request)
	clause, parameter = processEachClause(request, modelClass)
	clause = 'WHERE ' + (' AND '.join(clause)) if len(clause) else ''
	return clause, parameter, limit, offset

def createSelectHandler(modelClass: type):
	async def handleSelect(session: AsyncDBSessionBase, data: dict):
		data = copy.copy(data)
		item = data.get('data', data)
		item['isDrop'] = 0
		clause, parameter, limit, offset = processRequestQuery(data, modelClass)
		fetched = await session.select(
			modelClass,
			f"{clause} ORDER BY ID DESC",
			isRelated=False,
			parameter=parameter,
			limit=limit,
			offset=offset
		)
		return [i.toDict() for i in fetched]
	return handleSelect


def createCountHandler(modelClass: type):
	async def handleSelect(session: AsyncDBSessionBase, data: dict):
		data = copy.copy(data)
		item = data.get('data', data)
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

		IDList = [int(i) for i in IDList]
		IDclause = ",".join(len(IDList)*'?')
		clause = f"WHERE {modelClass.primary} IN ({IDclause}) {dropClause}"
		fetched = await session.select(modelClass, clause, parameter=IDList, isRelated=False)
		return {i.id: i.toOption() for i in fetched}

	return handleOption

def createIngestHandler(modelClass: type):
	async def handleIngest(session: AsyncDBSessionBase, data: dict):
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

def createInsertWithFileHandler(application, modelClass: type, isShare:bool=False):
	storeFileList = {}
	for i in modelClass.fileInput :
		storeFileList[i.name] = createFileStore(application, i.path, isShare)
	handleInsert = createInsertHandler(modelClass)
	async def handle(session: AsyncDBSessionBase, request:Request) -> Record:
		data = json.load(request.form['data'])
		for k, v in storeFileList.items() :
			pathList = v(request, k)
			data[k] = json.dumps(pathList)
		record = await handleInsert(session, data)
		return record
	return handle

def createInsertHandler(modelClass: type):
	async def handleInsert(session: AsyncDBSessionBase, data: dict) -> Record:
		record = modelClass().fromDict(data)
		await session.insert(record)
		return record
	return handleInsert

def createInsertMultipleHandler(modelClass: type):
	async def handleInsert(session: AsyncDBSessionBase, data: List[Dict[str, Any]]) -> List[Record]:
		recordList = [modelClass().fromDict(i) for i in data]
		await session.insertMultiple(recordList, isReturningID=True, isAutoID=True)
		return recordList
	return handleInsert

def createUpdateHandler(modelClass: type):
	async def handleUpdate(session: AsyncDBSessionBase, data: dict) -> Record:
		id = data.get('id', None)
		if id is None : return None
		record = await session.selectByID(modelClass, data['id'])
		if record is not None :
			record.fromDict(data)
			await session.update(record)
			return record
		else:
			return None
	return handleUpdate

def createIngestHandlerWithDynamicModel(modelClass: type, getDynamicModel: Awaitable):
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

	async def handleIngest(session: AsyncDBSessionBase, data: dict):
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


def createDropHandler(modelClass: type):
	async def handleDrop(session:AsyncDBSessionBase, data):
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
	async def storeFile(request:Request, key:str) :
		requestFile:RequestParameters = request.files.get(key, None)
		if key not in request.files: return []
		requestFile = request.files[key]
		if requestFile is None : return []
		pathList = []

		if isinstance(requestFile, list) :
			fileList = requestFile
		elif isinstance(requestFile, File) :
			fileList = [requestFile]
		else :
			raise ValueError('File is invalid.')
		for file in fileList :
			fileUpload = file.name.split('.')
			letters = string.ascii_lowercase
			fileUpload = file.name.split('.')
			fileName = ''.join(random.choice(letters) for i in range(20))
			fileName = fileName + "." + fileUpload[1]
			await store(path+fileName, file.body)
			pathList.append([file.name, path + fileName])
		return pathList
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