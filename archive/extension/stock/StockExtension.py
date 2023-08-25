from gaimon.core.Extension import Extension
# from gaimon.extension.stock.model.StockItemTypeDetail import StockItemTypeDetail

class StockExtension (Extension) :
	def __init__(self, resourcePath: str):
		super().__init__(resourcePath)
		self.ID = "stock"
		self.name = "Stock"
		self.path = self.getPath(__file__)
		self.stockItemType = {}

	async def initialize(self, isCopy:bool=True, isForce:bool=False) :
		await super().initialize(isCopy, isForce)
	
	async def load(self, application) :
		await super().load(application)
	
	def registerStockItemType(self, detail:StockItemTypeDetail) :
		existing = self.stockItemType.get(detail.typeID, None)
		if existing is not None :
			if existing.__class__ != detail.__class__ :
				raise RuntimeError(f"StockItemType {detail.typeID} exists ({existing.__class__.__name__}), use another one.")
		else :
			self.stockItemType[detail.typeID] = detail