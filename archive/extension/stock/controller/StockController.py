from gaimon.extension.stock.model.StockItem import StockItem
from gaimon.extension.stock.model.StockItemType import StockItemType
from gaimon.extension.stock.model.StockItemTypeUnitMapper import StockItemTypeUnitMapper
from gaimon.extension.stock.model.StockItemCategory import StockItemCategory
from gaimon.extension.stock.model.WithdrawnStockItem import WithdrawnStockItem
from gaimon.extension.stock.model.SuppliedStockItem import SuppliedStockItem

from gaimon.core.Route import GET, POST
from gaimon.core.RESTResponse import RESTResponse 

class StockController :
	def __init__(self, application) :
		self.application = application
		self.resourcePath = application.resourcePath

	@GET('/stock/get', role=['guest'])
	async def getAll(self, request) :
		itemList = await self.session.select(StockItem, "")
		return sjson([i.toDict() for i in itemList])

	@GET("/stock/item/category/all", role=['guest'])
	async def getStockItemCategoryAll(self, requst) :
		itemList = await self.session.select(StockItemCategory, '')
		return sjson({'isSuccess': True,'results': [i.toDict() for i in itemList]})
	
	@GET("/withdrawn/stock/item/all", role=['guest'])
	async def getWithdrawnStockItemAll(self, requst) :
		itemList = await self.session.select(WithdrawnStockItem, '')
		return sjson({'isSuccess': True,'results': [i.toDict() for i in itemList]})

	@GET("/supplied/stock/item/all", role=['guest'])
	async def getSuppliedStockItemAll(self, requst) :
		itemList = await self.session.select(SuppliedStockItem, '')
		return sjson({'isSuccess': True,'results': [i.toDict() for i in itemList]})

	@POST("/stock/item/category/insert", role=['guest'])
	async def addStockItemCategory(self, request) :
		contact = StockItemCategory()
		request.json['data']['isDrop'] = 0
		contact.fromDict(request.json['data'])
		await self.session.insert(contact)
		return sjson({'isSuccess': True, 'results': {}})

	@GET('/stock/item/type/option/get', role=['guest'])
	async def getItemTypeOption(self, request) :
		itemList = await self.session.select(StockItemType, "")
		return sjson([i.toOption() for i in itemList])

	@GET('/stock/unit/mapper/get/all', role=['guest'])
	async def getAllUnitMapper(self, request) :
		models = await self.session.select(StockItemTypeUnitMapper, "")
		return RESTResponse({'isSuccess': True, 'results': [i.toDict() for i in models]})

	@GET('/stock/unit/mapper/get/<itemType>', role=['guest'])
	async def getUnitMapper(self, request, itemType) :
		itemType = int(itemType)
		models = await self.session.select(StockItemTypeUnitMapper, "WHERE itemType=%d"%(itemType))
		return RESTResponse({'isSuccess': True, 'results': [i.toDict() for i in models]})

	@POST('/stock/unit/mapper/set', role=['guest'])
	async def setUnitMapper(self, request) :
		data = request.json
		isUpdate = False
		model = StockItemTypeUnitMapper()
		if 'id' in data: 
			models = await self.session.select(StockItemTypeUnitMapper, "WHERE id=%d"%(int(data['id'])), limit=1)
			if len(models) == 0: return RESTResponse({'isSuccess': False, 'message': 'ID is not Exist.'})
			isUpdate = True
			model = models[0]
		else:
			clause = "WHERE itemType=%d and unit=%d and subUnit=%d"%(int(data['itemType']), int(data['unit']), int(data['subUnit']))
			models = await self.session.select(StockItemTypeUnitMapper, clause, limit=1)
			if len(models):
				model = models[0]
				isUpdate = True
		model.fromDict(data)
		if isUpdate: await self.session.update(model)
		else: await self.session.insert(model)
		return RESTResponse({'isSuccess': True, 'results': model.toDict()})

	@POST('/stock/unit/mapper/drop', role=['guest'])
	async def dropUnitMapper(self, request) :
		data = request.json
		if 'id' in data: return RESTResponse({'isSuccess': False, 'message': 'ID is not Exist.'})
		models = await self.session.select(StockItemTypeUnitMapper, "WHERE id=%d"%(int(data['id'])), limit=1)
		if len(models) == 0: return RESTResponse({'isSuccess': False, 'message': 'ID is not Exist.'})
		model = models[0]
		model.isDrop = 1
		await self.session.update(model)
		return RESTResponse({'isSuccess': True})

