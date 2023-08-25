import json
from tempfile import tempdir
from typing import List
from gaimon.core.Route import GET, POST

from gaimon.core.RESTResponse import RESTResponse 

from gaimon.model.DynamicForm import DynamicForm
from gaimon.util.DynamicModelUtil import DynamicModelUtil


class DynamicFormController:
	def __init__(self, application):
		self.application = application
		self.resourcePath = application.resourcePath

	@GET('/dynamic/form/get/<modelName>/<formType>', role=['guest'])
	async def get(self, request, modelName, formType):
		isSuccess, model = await DynamicModelUtil.getDynamicModel(self.session, modelName)
		if not isSuccess:
			return RESTResponse({'isSuccess': False, 'message': 'Model is not exist.'})
		isSuccess, form = await DynamicModelUtil.getDynamicForm(
			self.session, modelName, formType
		)
		if model.attributeList == None: model.attributeList =[]
		if not isSuccess:
			return RESTResponse({
				'isSuccess': True,
				'attributeList': model.attributeList
			}, ensure_ascii=False)
		content = json.loads(form.converted)
		return RESTResponse({
			'isSuccess': True,
			'form': content,
			'attributeList': model.attributeList
		}, ensure_ascii=False)
