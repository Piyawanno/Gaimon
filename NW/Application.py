import http.client, json, os, subprocess
import traceback
from typing import Dict

class Application:
	config: Dict
	rootURL: str

	def __init__(self, config: Dict):
		self.config = config
		self.rootURL = config.get('rootURL', 'localhost:8080')
		self.connection = http.client.HTTPConnection(f'{self.rootURL}')

	def render(self):
		self.connection.request('GET', '/backend/nw')
		response = self.connection.getresponse()
		if response.status != 200: return
		result = json.loads(response.read())
		if not result['isSuccess']: return
		result = result['result']
		for js in result['js']:
			self.getFile(js)
		for css in result['css']:
			self.getFile(css)
		with open('index.html', 'w') as f:
			f.write(result['page'])
		if not os.path.isdir('view/client'): os.makedirs('view/client')
		for branch in result['view']:
			self.saveMustache(result['view'][branch], branch)
		for font in result.get('font', []):
			self.getFile(font)
		subprocess.run('nw .')

	def getFile(self, path:str):
		try:
			path = "/".join(path.split(os.sep))
			self.connection.request('GET', f'/{path}')
			response = self.connection.getresponse()
			if response.status != 200: return
			result = response.read()
			directory = os.sep.join(path.split('/')[:-1])
			if not os.path.isdir(directory): os.makedirs(directory)
			path = os.sep.join(path.split('/'))
			with open(path, 'wb') as f:
				f.write(result)
			print(path)
		except:
			self.connection = http.client.HTTPConnection(f'{self.rootURL}')
			print('error', path)
			print(traceback.format_exc())

	def saveMustache(self, result, branch):
		directory = f'view/client/{branch}'
		if not os.path.isdir(os.sep.join(directory.split('/'))): os.makedirs(os.sep.join(directory.split('/')))
		for key in result:
			if type(result[key]) == dict: 
				self.saveMustache(result[key], f'{branch}/{key}')
				continue
			path = f'{directory}/{key}.tpl'
			with open(os.sep.join(path.split('/')), 'wb') as f:
				f.write(result[key].encode())

if __name__ == '__main__':
	config = {}
	with open('config.json', 'r') as f:
		config = json.load(f)
	app = Application(config)
	app.render()
