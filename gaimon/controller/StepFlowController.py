from gaimon.core.Route import POST, ROLE, GET
from gaimon.core.RESTResponse import (
	SuccessRESTResponse as Success,
	ErrorRESTResponse as Error
)
from gaimon.model.PermissionType import PermissionType as PT
from gaimon.model.StepFlow import StepFlow
from gaimon.util.StepFlowUtil import StepFlowUtil
from xerial.AsyncDBSessionBase import AsyncDBSessionBase
from typing import List
from urllib.parse import unquote
from packaging.version import Version


@ROLE('guest')
class StepFlowController:
	def __init__(self, application):
		from gaimon.core.AsyncApplication import AsyncApplication
		self.application: AsyncApplication = application
		self.extensionLoader = application.extension
		self.resourcePath = application.resourcePath
		self.session: AsyncDBSessionBase = None
		self.util = StepFlowUtil(application)

	@GET('/step/flow/get/all', role=['guest'])
	async def getAll(self, request):
		return Success(await self.util.getAll(self.session))

	@GET('/step/flow/data/get/<code>/<step>/<logFlow>', role=['user'])
	async def getStepFlowData(self, request, code: str, step: str, logFlow: int):
		return Success({})
	
	@GET('/step/flow/data/for/visual/get/<code>/<step>/<logFlow>', role=['user'])
	async def getStepFlowDataForVisual(self, request, code: str, step: str, logFlow: int):
		return Success({})

	@GET('/step/flow/check/enable/<code>/<step>/<logFlow>', role=['user'])
	async def checkStepFlowEnable(self, request, code: str, step: str, logFlow: int):
		return Success(True)

	@GET('/step/flow/check/visible/<code>/<step>/<logFlow>', role=['user'])
	async def checkStepFlowVisible(self, request, code: str, step: str, logFlow: int):
		return Success(True)

	@GET('/step/flow/data/all/get/<code>/<logFlow>', role=['user'])
	async def getAllStepFlowData(self, request, code: str, logFlow: int):
		return Success({})

	@GET('/step/flow/data/group/by/model/get/<code>/<logFlow>', role=['user'])
	async def getAllStepFlowDataGroupByModel(self, request, code: str, logFlow: int):
		return Success([])