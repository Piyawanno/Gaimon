from gaimon.core.PostProcessor import POST, PostProcessDecorator

class StaticPostProcessor (PostProcessDecorator) :
	@POST('/share/<path:path>')
	async def processAfter(self, request, response, path) :
		print(">>> PostProcess", path)
		return response