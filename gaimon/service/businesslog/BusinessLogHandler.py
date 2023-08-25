from gaimon.core.Route import POST
from gaimon.service.businesslog.BusinessLogItem import BusinessLogItem

import traceback


class BusinessLogHandler:
	def __init__(self, application):
		from gaimon.service.businesslog.BusinessLogService import BusinessLogService
		from gaimon.service.businesslog.BusinessLogManagement import BusinessLogManagement
		self.application: BusinessLogService = application
		self.management: BusinessLogManagement = None

	@POST('/append')
	async def append(self, request, parameter):
		try:
			item = BusinessLogItem().fromDict(parameter)
			self.management.storage.append(item)
			return {'isSuccess': True}
		except Exception as error:
			print(traceback.format_exc())
			return {'isSuccess': False, 'message': str(error)}

	@POST('/getByRecordID')
	async def getByRecordID(self, request, parameter):
		try:
			modelName = parameter['modelName']
			ID = parameter['ID']
			logList = self.management.storage.getByRecordID(modelName, ID)
			return {'isSuccess': True, 'result': [i.toDict() for i in logList]}
		except Exception as error:
			print(traceback.format_exc())
			return {'isSuccess': False, 'message': str(error)}
