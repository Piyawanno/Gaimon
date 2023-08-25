from xerial.FilterOperation import FilterOperation
from xerial.FilterConjunction import FilterConjunction
from dataclasses import dataclass


@dataclass
class FilterParameter:
	modelClass: type
	clause: str
	parameter: list
	limit: int
	offset: int
	"""
	NOTE parameter structure
	{
		'limit' : number of limit records. If not set or None, will be set to 200.
		'offset' : offset of select. It is optional and can be replaced with pageNumber.
		'pageNumber' : page number of limit, each page has number of records of limit.
		'conjunction' : optional, value of FilterConjunction. Default value : AND.
		'filter' : [
			{
				'column' : 'column name',
				'operation' : value of FilterOperation,
				'value' : 'value to compare'
			}
		]
	}
	NOTE With clause and parameter, query is already protected from injection by data type.
	"""
	def __init__(self, modelClass: type, parameter: dict):
		self.modelClass = modelClass
		self.processLimit(parameter)
		self.processClause(parameter)

	def processLimit(self, parameter: dict):
		self.limit: int = parameter.get('limit', 200)
		self.offset: int = parameter.get('offset', None)
		if self.limit is not None:
			del parameter['limit']
			self.limit = min(200, self.limit)
			if self.offset is None:
				pageNumber = parameter.get('pageNumber', None)
				if pageNumber is not None:
					del parameter['pageNumber']
					self.offset = (pageNumber - 1) * self.limit
				else:
					self.offset = 0

	def processClause(self, parameter: dict):
		metaMap = self.modelClass.metaMap
		clause = []
		self.parameter = []
		filter = parameter.get('filter', [])
		for item in filter:
			column = item['column']
			operation = item['operation']
			value = item['value']
			meta = metaMap.get(column, None)
			if meta is None: continue
			if value is None: continue
			if isinstance(value, str) and len(value) == 0: continue
			if operation == FilterOperation.LIKE:
				clause.append(f'{column} LIKE ?')
				self.parameter.append(f'%{value}%')
			else:
				clause.append(f'{column} {FilterOperation.sign[operation]} ?')
				self.parameter.append(meta.parseValue(value))
		conjunction = parameter.get('conjunction', FilterConjunction.AND)
		conjunctionSign = FilterConjunction.sign[conjunction]
		self.clause = 'WHERE ' + (f' {conjunctionSign} '.join(clause)
									) if len(clause) else ''
