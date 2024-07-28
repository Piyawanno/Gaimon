from gaimon.util.CLIBase import CLIBase
from gaimon.util.ProcessUtil import setSystemPath, daemonize
from gaimon.core.AsyncService import AsyncService

from sanic import Sanic
from typing import List
from packaging.version import Version

import argparse, sanic


class ServiceCLI (CLIBase):
	serviceClass: type = None
	serviceName: str = ""
	description: str = ""

	def initParser(self):
		self.parser = argparse.ArgumentParser(description=self.description)
		self.parser.add_argument("-n", "--namespace", help="Namespace of notification.")
		self.parser.add_argument("-d", "--daemon", help="Run in daemon mode.", choices=['start', 'stop', 'restart', 'kill'],)
		self.parser.add_argument("-e", "--develop", help="Run in develop mode.", action='store_true')

	def run(self, argv: List[str]):
		self.getOption(argv)
		if len(self.namespace): setSystemPath(self.namespace)
		if self.option.daemon:
			daemonize(self.serviceName, self.option.daemon, self.runService, self.namespace)
		else:
			self.runService()
	
	def runService(self):
		version = Version(sanic.__version__)
		if version.major >= 23: self.runWithLoader()
		else: self.runLegacy()
	
	def runLegacy(self):
		self.config = self.getConfig(self.namespace)
		if self.option.develop: self.config['isDevelop'] = True
		self.service: AsyncService = self.serviceClass(self.config, self.namespace)
		self.service.run()

	def runWithLoader(self):
		from sanic.worker.loader import AppLoader
		self.config = self.getConfig(self.namespace)
		if self.option.develop: self.config['isDevelop'] = True
		self.service: AsyncService = self.serviceClass(self.config, self.namespace)
		self.loader = AppLoader(factory=self.service.create)
		application = self.service.create(False)
		self.service.prepareApplication(application)
		Sanic.serve(primary=application, app_loader=self.loader)
	
	def getConfig(self, namespace: str):
		raise NotImplementedError
	