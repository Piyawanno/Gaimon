from argparse import RawTextHelpFormatter
from gaimon.util.NameSpaceInitializer import NameSpaceInitializer
from gaimon.util.CLIBase import CLIBase
from typing import List

import argparse, sys

__help__ = """Gaimon namespace initializer :
install : Install Gaimon into machine.
link : Link package and script into machine, suitable for setting up developing environment.
"""

def run():
	GaimonNameSpaceInitializerCLI().run(sys.argv[1:])

class GaimonNameSpaceInitializerCLI (CLIBase):
	def initParser(self):
		self.parser = argparse.ArgumentParser(description=__help__, formatter_class=RawTextHelpFormatter)
		self.parser.add_argument("-n", "--namespace", help="Namespace to initialize.")
		self.parser.add_argument("-r", "--requirements", help="Path of requirements e.g requirements.txt")
		self.parser.add_argument("operation", help="Operation of setup", choices=['install', 'link'])
		return self.parser
	
	def run(self, argv: List[str]):
		self.getOption(argv)
		self.setup = NameSpaceInitializer(self.namespace)
		self.setup.operate(self.option.operation)
		if self.option.requirements is not None :
			self.setup.installPackage(self.option.requirements)

