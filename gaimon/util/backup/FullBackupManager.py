from gaimon.util.backup.BackupBase import BackupBase
from gaimon.util.backup.FullBackupStorage import FullBackupStorage
from gaimon.util.DataProcess import transposeRecord

import json, zlib, logging

class FullBackupManager(BackupBase):
    def __init__(self, config, storage: FullBackupStorage):
        self.config = config
        self.fullBackupPath = config["resourcePath"]
        self.storage = storage

    async def backup(self):
        try:    
            entity = ''
            await self.connect(entity)
            zippedDataMap = {}
            for modelClass in self.session.model.values():
                try:
                    fetchedRecords = await self.session.selectRaw(modelClass, "")
                    length = len(fetchedRecords)
                    if length:
                        transposedRecords = transposeRecord(fetchedRecords)
                        dumpedRecords = json.dumps(transposedRecords)
                        print(f"Storing {modelClass.__name__} of {length} records")
                        zippedRecords = zlib.compress(dumpedRecords.encode())
                        zippedDataMap[modelClass.__name__] = zippedRecords
                except Exception as e:
                    print(f"Error in backup {modelClass.__name__}: {e}")
            await self.storage.store(entity, zippedDataMap)
        finally:
            await self.close()
    
    async def restore(self, version: str):
        entity = ''
        await self.connect(entity)
        data = await self.storage.read('', version)
        accumulatedInsert = {}
        if len(data) == 0:
            logging.error("No data to restore.")
            return
        for date, mapped in data.items():
            for modelName, rawList in mapped.items():
                modelClass = self.session.model.get(modelName, None)
                if modelClass is None: continue
                insert = accumulatedInsert.get(modelName, [])
                if len(insert) == 0: accumulatedInsert[modelName] = insert
                for raw in rawList:
                    insert.append(raw)

        for modelName, insert in accumulatedInsert.items():
            modelClass = self.session.model.get(modelName, None)
            if modelClass is None: continue
            if len(insert):
                print(f"Restoring {modelName} of {len(insert)} records")
                query = self.session.generateDropTable(modelClass)
                await self.session.executeWrite(query)
                await self.session.createTable()
                await self.session.insertMultipleDirect(modelClass, insert)

        logging.info(
            f">>> Restore {modelName} : insert={len(insert)}"
        )
    
    def list(self):
        data = self.storage.list()
        for version, files in data.items():
            print(f" Version: {version}")
            for file in files:
                print(f" - {file}")

    def delete(self, version: str):
        removed_files = self.storage.delete(version)
        for file in removed_files:
            print(f"Deleted {file}")
