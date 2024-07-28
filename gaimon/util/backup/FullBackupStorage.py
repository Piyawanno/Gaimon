import logging
from gaimon.util.DataProcess import retransposeRecord

from typing import Dict, List
from datetime import datetime

import os, zlib, json

__DUMP_DIR__ = "{resourcePath}/fullbackup/{timestampPath}"
__DUMP_PATH__ = "{dumpDir}/{modelName}.zip"
__PATH_FORMAT__ = '%Y/%m/%d/%H:%M:%S'


class FullBackupStorage:
    def __init__(self, resourcePath: str):
        self.resourcePath = resourcePath

    async def store(self, entity: str, dumpedMap: Dict[str, bytes]) -> bool:
        dumpDir = __DUMP_DIR__.format(
                resourcePath=self.resourcePath,
                entity=entity,
                timestampPath=datetime.now().strftime(__PATH_FORMAT__),
            )
        for modelName, zipped in dumpedMap.items():
            if not os.path.isdir(dumpDir): os.makedirs(dumpDir)
            while True:
                path = __DUMP_PATH__.format(
                    dumpDir=dumpDir,
                    modelName=modelName,
                )
                if not os.path.isfile(path): break
            with open(path, 'wb') as fd:
                fd.write(zipped)
                logging.info(f"Backup {modelName} to {path}")
        return True
    
    async def read(self,
                    entity: str,
                    version: str) -> Dict[str, List[Dict]]:
        if version is None:
            logging.error("No file to restore.")
        loaded = {}
        
        dumpDir = __DUMP_DIR__.format(
                resourcePath=self.resourcePath,
                timestampPath=version,
            )
        if not os.path.isdir(dumpDir): return {}
        mapped = {}
        loaded[version] = mapped
        for fileName in os.listdir(dumpDir):
            modelName = fileName.split(".")[0]
            recordList = mapped.get(fileName, [])
            if len(recordList) == 0: mapped[modelName] = recordList
            path = f"{dumpDir}/{fileName}"
            with open(path, 'rb') as fd:
                unzipped = zlib.decompress(fd.read())
                transposed = json.loads(unzipped)
                recordList.extend(retransposeRecord(transposed))
        return loaded
    
    def list(self)-> Dict[str, List[str]]:
        dumpDir = __DUMP_DIR__.format(
                resourcePath=self.resourcePath,
                timestampPath="",
            )
        if not os.path.isdir(dumpDir): print("No backup files.")
        backup_files = {}
        for root, dirs, filenames in os.walk(dumpDir):
            if len(filenames) == 0: continue
            relative_path = os.path.relpath(root, dumpDir)
            files = backup_files.get(relative_path, [])
            for filename in filenames:
                files.append(filename)
                backup_files[relative_path] = files
        return backup_files
    
    def delete(self, version: str) -> List[str]:
        dumpDir = __DUMP_DIR__.format(
                resourcePath=self.resourcePath,
                timestampPath=version,
            )
        if not os.path.isdir(dumpDir): print("No backup files.")
        removed_files = []
        for root, dirs, filenames in os.walk(dumpDir):
            for filename in filenames:
                os.remove(f"{root}/{filename}")
                removed_files.append(filename)
        os.rmdir(dumpDir)
        return removed_files