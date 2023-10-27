from gaimon.core.Route import POST, GET
from gaimon.core.HTMLPage import HTMLPage
from gaimon.core.RESTResponse import RESTResponse 
from sanic import response

import pystache, json

__CSS__ = [
]

__JS__ = [
	'utils/Utils.js',
	'utils/DateUtils.js',
]

__EXTENSION_CSS__ = [
	'{modelName}.css'
]

__EXTENSION_INCOMPRESSIBLE_CSS__ = [
	'FontFamily.css',
]


__EXTENSION_JS__ = [
	'{modelName}Display.js'
]

class {modelName}DisplayController :
	def __init__(self, application) :
		from gaimon.core.AsyncApplication import AsyncApplication
		from gaimon.core.ThemeHandler import ThemeHandler
		self.application:AsyncApplication = application
		self.theme:ThemeHandler = None
		self.resourcePath = self.application.resourcePath
		self.page:HTMLPage = self.application.createPage()
		self.title = '{label}'
		self.renderer = pystache.Renderer()
	
	@GET('/{modulePath}', role=['guest'])
	async def renderIndex(self, request) :
		self.page.setRequest(request)
		self.page.reset()
		self.page.title = self.title
		self.page.enableAuthentication()
		self.page.extendCSS(__CSS__)
		self.page.extendJS(__JS__)
		self.page.extendCSS(__EXTENSION_CSS__, '{modulePath}')
		self.page.extendIncompressibleCSS(__EXTENSION_INCOMPRESSIBLE_CSS__, '{modulePath}')
		self.page.extendJS(__EXTENSION_JS__, '{modulePath}')

		self.page.favicon = 'share/icon/favicon.png'

		template = self.theme.getTemplate('{modulePath}/{modelName}Display.tpl')
		self.page.body = self.renderer.render(template, {{
			'rootURI': self.page.rootURL
		}})
		
		return response.html(self.page.render())
