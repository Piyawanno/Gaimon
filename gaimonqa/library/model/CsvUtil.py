import csv

from xerial.DBSessionBase import DBSessionBase
from xerial.DBSessionPool import DBSessionPool
from xerial.Record import Record


class CsvUtil:
    _path: str = ""
    _model: Record
    _column: list = []
    _dictList: list = []
    _session: DBSessionBase
    _config = None

    def __init__(self, path: str, record: Record, db_session: DBSessionBase) -> None:
        if not path.endswith(".csv"):
            path += ".csv"
        self._path = path
        self._model = record
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
        self._session.appendModel(self._model)
        self._session.checkModelLinking()
        self._session.createTable()

    def dump(self) -> None:
        self.connect()
        self._session.insertMultiple([self._model.fromDict(i) for i in self._dictList])


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

    book = CsvUtil('../csv/Book', Book(), session)
    book.read()
    book.connect()
    book.dump()

    librarian = CsvUtil('../csv/Librarian', Librarian(), session)
    librarian.read()
    librarian.print_dict()
    librarian.connect()
    librarian.dump()

    library = CsvUtil('../csv/Library', Library(), session)
    library.read()
    library.print_dict()
    library.connect()
    library.dump()
