from gaimon.core.BaseController import BaseController, BASE
from gaimon.core.Route import GET, POST
from gaimon.model.PermissionType import PermissionType as PT
from {modulePath}.model.{modelName} import {modelName}

from gaimon.core.RESTResponse import RESTResponse 

@BASE({modelName}, '{route}', '{modelName}')
class {modelName}Controller (BaseController) :
	pass
