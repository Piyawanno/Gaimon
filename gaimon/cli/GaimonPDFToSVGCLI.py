import os
import argparse, pathlib
from typing import List
from gaimon.util.CLIBase import CLIBase
from gaimon.util.ProcessUtil import readConfig

import sys

def run(): GaimonPDFToSVGCLI().run(sys.argv[1:])

class GaimonPDFToSVGCLI (CLIBase):
	def __init__(self):
		super().__init__()
		self.source:str
		self.destination:str
    
	def getConfig(self, namespace: str):
		config = GaimonPDFToSVGCLI.readConfig(namespace)
		return config

	@staticmethod
	def readConfig(namespace: str):
		config = readConfig(
			['Gaimon.json'],
			{
				'DB' : 'Database.json'
			},
			namespace
		)
		config['processNumber'] = 1
		return config

	def initParser(self):
		self.parser = argparse.ArgumentParser(description="Gaimon PDF to SVG.")
		self.parser.add_argument("-s", "--source", help="Source of PDF file.")
		self.parser.add_argument("-d", "--destination", help="Destination to export.")
		return self.parser

	def getOption(self, argv: List[str]):
		self.option = self.parser.parse_args(argv)
		self.source = self.option.source
		self.destination = self.option.destination

	def run(self, argv: List[str]):
		from pymupdf import Document, Page
		self.getOption(argv)
  
		if not os.path.isfile(self.source): return
		
		name = pathlib.Path(self.source).stem
		file_handle = Document(self.source)
		page: Page
		for index, page in enumerate(file_handle):
			pagePath = f'{self.destination}/{name}_{index+1}.svg'
			svg = page.get_svg_image()
			with open(pagePath, 'w') as f:
				f.write(svg)

if __name__ == '__main__': run()
