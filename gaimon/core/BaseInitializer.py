import json, os


class BaseInitializer:
	def __init__(self, config, handler):
		self.config = config
		self.handler = handler
		self.rootURL = config["rootURL"]
		self.dataPath = config["dataPath"]
		self.alterSequence = []

	def saveJSON(self, modelClass, data):
		path = f'{self.dataPath}/'
		if not os.path.exists(path): os.makedirs(path)
		json.dump(
			data,
			open(f'{path}/{modelClass.__name__}.json',
					'w',
					encoding='utf-8'),
			indent=4,
			ensure_ascii=False
		)
