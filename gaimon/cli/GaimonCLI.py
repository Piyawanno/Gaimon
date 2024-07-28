from gaimon.util.ProcessUtil import readConfig, daemonize, setSystemPath
from gaimon.util.CLIBase import CLIBase
from sanic import Sanic
from typing import List, Dict, Any
from packaging.version import Version

import argparse, sys, asyncio, sanic

def run():
	GaimonCLI().run(sys.argv[1:])

class GaimonCLI (CLIBase):
	def initParser(self):
		self.parser = argparse.ArgumentParser(description="Gaimon web application server.")
		self.parser.add_argument("-n", "--namespace", help="Namespace of gaimon application.")
		self.parser.add_argument("-d", "--daemon", help="Run in daemon mode.", choices=['start', 'stop', 'restart', 'kill'],)
		self.parser.add_argument("-e", "--develop", help="Run in develop mode.", action='store_true')
		self.parser.add_argument("-o", "--noautoload", help="Disable auto load (develop mode only)", action='store_true')
		return self.parser

	# NOTE Since Sanic using ForkPickler to transfer object from main process
	# to worker process. However, ForkPickler cannot dump the local function created
	# with higher order function. Hence, some task must be executed to prepare before
	# starting the worker process. Moreover, the created object already contain local
	# function, then it cannot be reused by the worker process.
	async def prepare(self, config: Dict[str, Any], application: Sanic):
		from gaimon.GaimonApplication import GaimonApplication
		loop = asyncio.get_running_loop()
		gaimon = GaimonApplication(config=config, namespace=self.namespace)
		gaimon.application = application
		gaimon.initialHandler()
		gaimon.initialDecorator()
		gaimon.checkProcessNumber()
		gaimon.setLog()
		await gaimon.load(loop, True, True, False)
		await gaimon.setSequence()
		await gaimon.close()
		await gaimon.closeDBSession()
		await gaimon.closeRedis()

	def run(self, argv: List[str]):
		self.getOption(argv)
		if len(self.namespace): setSystemPath(self.namespace)
		if self.option.daemon:
			daemonize('gaimon', self.option.daemon, self.runService, self.namespace)
		else:
			self.runService()

	def runService(self):
		self.config = GaimonCLI.readConfig(self.namespace)
		if self.option.develop: self.config['isDevelop'] = True
		from gaimon.GaimonApplication import GaimonApplication
		self.gaimon = GaimonApplication(config=self.config, namespace=self.namespace)

		version = Version(sanic.__version__)
		if version.major >= 23:
			if self.gaimon.isDevelop and self.option.noautoload :
				self.runSingleProcess()
			else:
				self.runWithLoader()
		else:
			self.runLegacy()
	
	def runLegacy(self):
		self.gaimon.initialHandler()
		self.gaimon.initialDecorator()
		application =self.gaimon.create(False)
		self.gaimon.application = application
		self.gaimon.run()

	def runSingleProcess(self):
		self.gaimon.application = self.gaimon.create(False)
		self.gaimon.initialHandler()
		self.gaimon.initialDecorator()
		self.gaimon.runSingleProcess()
	
	def runWithLoader(self):
		from sanic.worker.loader import AppLoader
		self.loader = AppLoader(factory=self.gaimon.create)
		application = self.gaimon.create(False, True)
		asyncio.run(self.prepare(self.config, application))
		self.gaimon.prepareApplication(application)
		Sanic.serve(primary=application, app_loader=self.loader)

	@staticmethod
	def readConfig(namespace:str) -> Dict[str, Any]:
		config = readConfig(
			['Gaimon.json'],
			{
				'DB': 'Database.json',
				'redis': 'Redis.json',
				'notification' : 'Notification.json',
				'businessLog' : 'BusinessLog.json',
				'monitor' : 'ServiceMonitor.json',
				'additionExtension' : 'Extension.json',
			},
			namespace
		)
		extension = config.get('additionExtension', None)
		if extension is not None :
			config['extension'].extend(extension)
		return config

if __name__ == '__main__': run()