import re
from tempfile import tempdir
from gaimon.core.Route import GET, POST
from gaimon.model.Template import Template

from gaimon.core.RESTResponse import RESTResponse 


class TemplateCreatorController:
	def __init__(self, application):
		self.application = application
		self.resourcePath = application.resourcePath

	@POST('/template/creator/get', role=['guest'])
	async def get(self, request):
		limit = request.json['limit']
		offset = limit * (request.json['pageNumber'] - 1)
		clause = "WHERE model=? AND isDrop = 0"
		parameter = [request.json['model']]
		result = await self.session.select(
			Template,
			clause,
			parameter=parameter,
			limit=limit,
			offset=offset
		)
		count = await self.session.count(Template, clause, parameter=parameter)
		count = int(count / limit) + 1
		return RESTResponse({
			'isSuccess': True,
			'result': {
				'data': [i.toDict() for i in result],
				'count': count
			}
		}, ensure_ascii=False)

	@GET('/template/creator/get/default/<model>', role=['guest'])
	async def getDefaultTemplate(self, request, model):
		template = await self.session.select(
			Template,
			"WHERE model=? AND isDefault = 1 AND isDrop = 0",
			parameter=[model],
			limit=1
		)
		if len(template) == 0:
			return RESTResponse({
				'isSuccess': False,
				'message': f'{model} Template is not exist.'
			})
		return RESTResponse({
			'isSuccess': True,
			'result': template[0].toDict()
		}, ensure_ascii=False)

	@POST('/template/creator/insert', role=['guest'])
	async def insert(self, request):
		data = request.json['data']
		model = Template()
		model.fromDict(data)
		template = await self.session.select(
			Template,
			f"WHERE isDrop = 0 AND model=?",
			parameter=[data['model']],
			limit=1
		)
		if len(template) == 0: model.isDefault = 1
		await self.session.insert(model)
		return RESTResponse({'isSuccess': True})

	@POST('/template/creator/update', role=['guest'])
	async def update(self, request):
		id = request.json['data']['id']
		model = request.json['data']['model']
		template = await self.session.select(
			Template,
			"WHERE id=? AND isDrop = 0 AND model=?",
			parameter=[id,
						model],
			limit=1
		)
		if len(template) == 0:
			return RESTResponse({
				'isSuccess': False,
				'message': f'{model} Template is not exist.'
			})
		template = template[0]
		template.fromDict(request.json['data'])
		await self.session.update(template)
		return RESTResponse({'isSuccess': True})

	@POST('/template/creator/set/default', role=['guest'])
	async def setDefaultTemplate(self, request):
		id = request.json['id']
		model = request.json['model']
		isDefault = request.json['isDefault']
		templates = await self.session.select(
			Template,
			"WHERE isDrop = 0 AND model=?",
			parameter=[model]
		)
		for template in templates:
			template.isDefault = 0
			if template.id == id: template.isDefault = isDefault
			await self.session.update(template)
		return RESTResponse({'isSuccess': True})

	@POST('/template/creator/delete', role=['guest'])
	async def delete(self, request):
		id = request.json['id']
		model = request.json['model']
		template = await self.session.select(
			Template,
			"WHERE id=? AND isDrop = 0 AND model=?",
			parameter=[id,
						model],
			limit=1
		)
		if len(template) == 0:
			return RESTResponse({
				'isSuccess': False,
				'message': f'This template is not exist.'
			})
		template = template[0]
		template.isDrop = 1
		await self.session.update(template)
		return RESTResponse({'isSuccess': True})
