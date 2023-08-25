from gaimon.core.PreProcessor import PRE, PreProcessDecorator

class StaticPreProcessor (PreProcessDecorator) :
	@PRE('/share/<path:path>')
	async def processBefore(self, request, path) :
		print(">>> PreProcess", path)