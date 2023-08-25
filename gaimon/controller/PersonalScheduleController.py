import re
from typing import List
from gaimon.core.Route import GET, POST
from gaimon.model.PersonalSchedule import PersonalSchedule

from xerial.DateTimeColumn import DATETIME_FORMAT

from gaimon.core.RESTResponse import RESTResponse 

from datetime import datetime

import math

__YEAR_TIMESTAMP__ = 60.0 * 60.0 * 60.0 * 24.0 * 365.0


class PersonalScheduleController:
	def __init__(self, application):
		self.application = application
		self.resourcePath = application.resourcePath

	@POST("/personal/schedule/get", role=['guest'])
	async def getPersonalSchedule(self, request):
		uid = request.ctx.session['uid']
		startTime = int(request.json['startTime'])
		startDate = datetime.fromtimestamp(startTime)
		stopTime = startTime + __YEAR_TIMESTAMP__
		stopDate = datetime.fromtimestamp(stopTime)
		clause = f"WHERE startTime >= ? and startTime <=? and uid = ?"
		parameter = [startDate, stopDate, uid]
		models = await self.session.select(PersonalSchedule, clause, parameter=parameter)
		return RESTResponse({
			'isSuccess': True,
			'results': [i.toCalendar() for i in models]
		}, ensure_ascii=False)

	@POST("/personal/schedule/update", role=['guest'])
	async def updatePersonalSchedule(self, request):
		uid = request.ctx.session['uid']
		ID = int(request.json['id'])
		clause = f"WHERE id = ? and uid = ?"
		parameter = [ID, uid]
		models: List[PersonalSchedule] = await self.session.select(
			PersonalSchedule,
			clause,
			parameter=parameter,
			limit=1
		)
		if len(models) == 0:
			return RESTResponse({'isSuccess': False, 'message': 'Event is not exist.'})
		model = models[0]
		model.subject = request.json['subject']
		if len(request.json['endTime']):
			model.endTime = datetime.strptime(
				request.json['endTime'].replace('T',
												' ') + ':00',
				DATETIME_FORMAT
			)
		model.isNotify = int(request.json['isNotify'])
		model.notificationTime = int(request.json['notificationTime'])
		model.notificationUnit = int(request.json['notificationUnit'])
		await self.session.update(model)
		return RESTResponse({'isSuccess': True})
