import csv

from xerial.DBSessionBase import DBSessionBase
from xerial.DBSessionPool import DBSessionPool


class CsvModel:
    _path: str = ""
    _model: type
    _column: list = []
    _dictList: list = []
    _session: DBSessionBase
    _config = None

    def __init__(self, path: str, modelClass: type, db_session: DBSessionBase) -> None:
        if not path.endswith(".csv"):
            path += ".csv"
        self._path = path
        self._model = modelClass
        self._session = db_session

    def read(self) -> None:
        with open(self._path, newline='') as csvfile:
            reader = csv.reader(csvfile, delimiter=',', quotechar='|')
            for row in reader:
                if len(self._column) == 0:
                    self._column = row
                else:
                    self._dictList.append(dict(zip(self._column, row)))

    def print_dict(self) -> None:
        print(self._dictList)

    def getDictList(self, read: bool = False) -> list:
        if read:
            self.read()
        return self._dictList

    def connect(self) -> None:
        print(self._model)
        self._session.appendModel(self._model)
        self._session.checkModelLinking()
        self._session.createTable()

    def dump(self) -> None:
        self.connect()
        self._session.insertMultiple([self._model().fromDict(i) for i in self._dictList])


if __name__ == '__main__':
    import json
    
    from Book import Book
    from Librarian import Librarian
    from Library import Library

    with open('/etc/xerial/Xerial.json') as fd:
        config = json.load(fd)

    pool = DBSessionPool(config)
    pool.createConnection()
    session = pool.getSession()


    book = CsvModel('../csv/Book', Book, session)
    book.read()
    book.connect()
    book.dump()

    librarian = CsvModel('../csv/Librarian', Librarian, session)
    librarian.read()
    librarian.print_dict()
    librarian.connect()
    librarian.dump()

    library = CsvModel('../csv/Library', Library, session)
    library.read()
    library.print_dict()
    library.connect()
    library.dump()
