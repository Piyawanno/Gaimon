from xerial.DateColumn import DATE_FORMAT
from xerial.DateTimeColumn import DATETIME_FORMAT

from gaimon.util.backup.BackupStorage import BackupStorage
from gaimon.util.backup.BackupBase import BackupBase, DUMP_PATH
from gaimon.util.DataProcess import transposeRecord

from typing import List, Dict, Tuple
from datetime import datetime

import logging, asyncio, json, zlib, time, traceback, os


class BackupCron(BackupBase):
	def __init__(self, config, entityList: List[str], storage: BackupStorage):
		self.config = config
		self.resourcePath = config['resourcePath']
		self.sleepTime = config['sleepTime']
		self.startTime = config['startTime']
		self.storage = storage
		self.entityList = entityList

	def checkPath(self):
		path = f"{self.resourcePath}/backup"
		if not os.path.isdir(path): os.makedirs(path)

	def readLastDump(self, entity) -> Dict[str, float]:
		path = DUMP_PATH.format(resourcePath=self.resourcePath, entity=entity)
		if not os.path.isfile(path): return {}
		with open(path, 'rt', encoding="utf-8") as fd:
			lastDump = json.load(fd)
		return lastDump

	def storeLastDump(self, entity, lastDump: Dict[str, float]):
		path = DUMP_PATH.format(resourcePath=self.resourcePath, entity=entity)
		with open(path, 'wt') as fd:
			json.dump(lastDump, fd)

	async def dump(self, entity) -> Tuple[Dict[str, bytes], Dict[str, float]]:
		lastDumpMap = self.readLastDump(entity)
		nextDumpMap = {}
		zippedMap = {}
		for modelClass in self.session.model.values():
			if modelClass.__backup__ and not modelClass.__skip_create__:
				modelName = modelClass.__name__
				lastDump = lastDumpMap.get(modelName, -2.0)
				clause = f"WHERE __insert_time__ > {lastDump} OR __update_time__ > {lastDump}"
				nextDumpMap[modelName] = time.time()
				fetched = await self.session.selectRaw(modelClass, clause)
				n = len(fetched)
				if n:
					transposed = transposeRecord(fetched)
					dumped = json.dumps(transposed)
					zipped = zlib.compress(dumped.encode())
					logging.info(f">>> Storing {modelName} of {n}r -> {len(zipped)}B.")
					zippedMap[modelName] = zipped
		return zippedMap, nextDumpMap

	async def refreshNamespace(self):
		return self.entityList

	async def start(self):
		now = datetime.now()
		timeString = f"{now.strftime(DATE_FORMAT)} {self.startTime}"
		startTime = datetime.strptime(timeString, DATETIME_FORMAT)
		startSleepTime = startTime - now
		logging.info(f">>> Sleep for {startSleepTime.seconds}s until {self.startTime}.")
		# await asyncio.sleep(startSleepTime.seconds)
		while True:
			startTime = time.time()
			entityList = await self.refreshNamespace()
			try:
				for entity in entityList:
					await self.connect(entity)
					if len(entity) == 0: entity = 'main'
					self.checkPath()
					dumpedMap, dumpTimeMap = await self.dump(entity)
					if await self.storage.store(entity, dumpedMap):
						self.storeLastDump(entity, dumpTimeMap)
					await self.close()
			except:
				logging.error(traceback.format_exc())
			elapsed = time.time() - startTime
			sleepTime = self.sleepTime - elapsed
			logging.info(f">>> Sleep for {sleepTime:.3f}s.")
			await asyncio.sleep(sleepTime)
