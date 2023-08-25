import logging
from gaimon.util.DataProcess import retransposeRecord

from typing import Dict, List
from datetime import datetime, timedelta

import os, zlib, json

__DUMP_DIR__ = "{resourcePath}/backup/{entity}/{datePath}"
__DUMP_PATH__ = "{dumpDir}/{modelName}-{count}.zip"
__PATH_FORMAT__ = '%Y/%m/%d'


class BackupStorage:
	def __init__(self, resourcePath: str):
		self.resourcePath = resourcePath

	async def store(self, entity: str, dumpedMap: Dict[str, bytes]) -> bool:
		dumpDir = __DUMP_DIR__.format(
			resourcePath=self.resourcePath,
			entity=entity,
			datePath=datetime.now().strftime(__PATH_FORMAT__),
		)
		for modelName, zipped in dumpedMap.items():
			if not os.path.isdir(dumpDir): os.makedirs(dumpDir)
			count = 0
			while True:
				path = __DUMP_PATH__.format(
					dumpDir=dumpDir,
					modelName=modelName,
					count=count,
				)
				if not os.path.isfile(path): break
				count += 1
			with open(path, 'wb') as fd:
				fd.write(zipped)
		return True

	async def read(self,
					entity: str,
					start: datetime,
					stop: datetime) -> Dict[str,
											List[Dict]]:
		if start is None:
			firstPath = self.getFirstPath(f"{self.resourcePath}/backup/{entity}")
			if firstPath is None:
				logging.error("No file to restore.")
				return {}
			start = datetime.strptime(firstPath, __PATH_FORMAT__)
		loaded = {}
		for i in range((stop - start).days + 1):
			date = start + timedelta(days=i)
			formattedDate = date.strftime(__PATH_FORMAT__)
			dumpDir = __DUMP_DIR__.format(
				resourcePath=self.resourcePath,
				entity=entity,
				datePath=formattedDate,
			)
			if not os.path.isdir(dumpDir): continue
			mapped = {}
			loaded[formattedDate] = mapped
			for fileName in os.listdir(dumpDir):
				modelName = fileName.split('-')[0]
				recordList = mapped.get(modelName, [])
				if len(recordList) == 0: mapped[modelName] = recordList
				path = f"{dumpDir}/{fileName}"
				with open(path, 'rb') as fd:
					unzipped = zlib.decompress(fd.read())
					transposed = json.loads(unzipped)
					recordList.extend(retransposeRecord(transposed))
		return loaded

	def getFirstPath(self, path: str):
		yearList = [
			int(i) for i in os.listdir(path)
			if os.path.isdir(f"{path}/{i}") and i.isdigit()
		]
		if len(yearList) == 0: return None
		year = min(yearList)
		path = f"{path}/{year}"
		monthList = [
			int(i) for i in os.listdir(path)
			if os.path.isdir(f"{path}/{i}") and i.isdigit()
		]
		if len(monthList) == 0: return None
		month = min(monthList)
		path = f"{path}/{month:02}"
		dayList = [
			int(i) for i in os.listdir(path)
			if os.path.isdir(f"{path}/{i}") and i.isdigit()
		]
		if len(dayList) == 0: return None
		day = min(dayList)
		return f"{year}/{month:02}/{day:02}"
