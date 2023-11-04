#!/usr/bin/python3

import json

from xerial.DBSessionPool import DBSessionPool

from gaimonqa.library.csv.CsvUtil import CsvUtil
from gaimonqa.library.model import Book, Librarian, Library

class DBSessionTest:
	def __init__(self, config):
		self.config = config

	def start(self):
		self.pool = DBSessionPool(self.config)
		self.pool.createConnection()
		self.session = self.pool.getSession()
		self.session.appendModel(Book)
		self.session.appendModel(Librarian)
		self.session.appendModel(Library)
		self.session.checkModelLinking()
		self.session.createTable()

		bookDictList = CsvUtil('./Book').getDictList(read=True)
		self.session.insertMultiple([Book().fromDict(i) for i in bookDictList])

		librarianDictList = CsvUtil('./Librarian').getDictList(read=True)
		self.session.insertMultiple([Librarian().fromDict(i) for i in librarianDictList])

		libraryDictList = CsvUtil('./Library').getDictList(read=True)
		self.session.insertMultiple([Library().fromDict(i) for i in libraryDictList])
		
if __name__ == '__main__' :
	with open('/etc/xerial/Xerial.json') as fd :
		config = json.load(fd)
	
	test = DBSessionTest(config)
	test.start()