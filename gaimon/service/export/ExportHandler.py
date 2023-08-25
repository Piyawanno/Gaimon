from xerial.AsyncDBSessionBase import AsyncDBSessionBase
from gaimon.core.Route import POST
from gaimon.util.FilterParameter import FilterParameter

from typing import List


class ExportHandler:
	def __init__(self, service):
		from gaimon.service.export.ExportService import ExportService
		from gaimon.service.export.ExportManagement import ExportManagement
		self.service: ExportService = service
		self.management: ExportManagement = None
		self.session: AsyncDBSessionBase = None

	@POST('/export')
	async def export(self, request, parameter):
		modelName = parameter['modelName']
		modelClass = self.modelMap.get(modelName, None)
		if modelClass is None:
			return {'isSuccess': False, 'message': f'Model {modelName} cannot be found.'}
		else:
			item = FilterParameter(modelClass, parameter)
			path = self.management.append(item)
			return {'isSuccess': True, 'path': path, }
