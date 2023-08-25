from gaimon.core.PermissionDecorator import PERMISSION, PermissionDecorator

class StaticPermission (PermissionDecorator) :
	@PERMISSION('/share/<path:path>')
	async def checkStatic(self, request, path) :
		print(">>> Check permission", path)
		return True