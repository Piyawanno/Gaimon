from xerial.AsyncDBSessionBase import AsyncDBSessionBase
from xerial.ForeignKey import ForeignKey
from xerial.Input import Input
from xerial.IntegerColumn import IntegerColumn
from xerial.FloatColumn import FloatColumn
from xerial.DateColumn import DateColumn
from xerial.DateTimeColumn import DateTimeColumn
from packaging.version import Version
from typing import Dict

import xlsxwriter, io

class ExcelTemplateGenerator:
	def __init__(self, modelClass: type):
		self.modelClass = modelClass
		filter = lambda x: hasattr(x, 'input') and x.input is not None and x.input.isSpreadSheet
		meta = [(name, column) for name, column in modelClass.meta if filter(column)]
		self.sortedMeta = sorted(meta, key=lambda x: Version(x[1].input.order))
	
	async def generate(self, session: AsyncDBSessionBase, output: str=None) -> io.BytesIO:
		if output is None:
			buffer = io.BytesIO()
			workbook = xlsxwriter.Workbook(buffer)
		else:
			workbook = xlsxwriter.Workbook()
		worksheet = workbook.add_worksheet(self.modelClass.__name__)
		await self.setSelectValidation(session, worksheet)
		self.setTypeValidation(worksheet)
		if output is not None:
			workbook.save(output)
		else:
			workbook.close()
			return buffer
		
	def setTypeValidation(self, worksheet):
		i = 0
		validationMap = {}

		for name, column in self.sortedMeta :
			input: Input = getattr(column, 'input', None)
			if input is None: continue
			if not input.isSpreadSheet: continue
			i = i+1
			if isinstance(column, IntegerColumn): validationMap[name] = (i, 'integer')
			if isinstance(column, FloatColumn): validationMap[name] = (i, 'decimal')
			if isinstance(column, DateColumn): validationMap[name] = (i, 'date')
			# if isinstance(column, DateTimeColumn): validationMap[name] = (i, 'datetime')

		for name, (i, validation) in validationMap.items():
			columnName = xlsxwriter.utility.xl_col_to_name(i)
			for j in range(5_000) :
				worksheet.data_validation(f'{columnName}{j}', {'validate': validation})
	
	async def setSelectValidation(self, session: AsyncDBSessionBase, worksheet):
		i = 0
		validationMap = {}
		for name, column in self.sortedMeta :
			input: Input = getattr(column, 'input', None)
			if input is None: continue
			if not input.isSpreadSheet: continue
			i += 1
			worksheet.write(xlsxwriter.utility.xl_col_to_name(i)+'1', input.label)
			inputEnum = getattr(input, 'enum', None)
			enumLabel: Dict[int, str] = inputEnum.label if inputEnum is not None else None
			if enumLabel is not None:
				validationMap[name] = (i, list(enumLabel.values()))
				continue
			option = getattr(input, 'option', None)
			if option is not None:
				validationMap[name] = (i, [i['label'] for i in option])
				continue
			foreignKey = getattr(column, 'foreignKey', None)
			if foreignKey is not None and hasattr(input, 'url'):
				option = await self.getReference(session, foreignKey)
				validationMap[name] = (i, option)
				continue
		
		for name, (i, validation) in validationMap.items():
			columnName = xlsxwriter.utility.xl_col_to_name(i)
			for j in range(5_000) :
				worksheet.data_validation(f'{columnName}{j}', {
					'validate': 'list',
					'source': validation
				})

	async def getReference(self, session: AsyncDBSessionBase, foreignKey: ForeignKey):
		dataList = await session.select(foreignKey.model, "")
		optionList = [i.toOption() for i in dataList]
		return list({i['label'] for i in optionList})
