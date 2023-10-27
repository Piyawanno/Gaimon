from gaimon.util.DateTimeUtil import getCurrentDateID, DAY_SECONDS
from datetime import datetime

import asyncio, time, logging, os, json, traceback, io, zlib, psutil, copy

LOG_LABEL = {10: "DEBUG", 20: "INFO", 30: "WARNING", 40: "ERROR", }


class LogFlusher:
	def __init__(self, config: dict, application):
		from gaimon.core.AsyncApplication import AsyncApplication
		self.config = config
		self.application: AsyncApplication = application
		if 'logFlusher' in config:
			self.sleepTime = config['logFlusher']['sleepTime']
			self.maxCount = config['logFlusher'].get('maxCount', 200)
		else:
			self.sleepTime = 30
			self.maxCount = 200
		self.resourcePath = self.application.resourcePath
		self.dateID = getCurrentDateID()
		self.descriptorMap = {}
		self.mergeLog()

	async def startFlushLoop(self):
		self.pid = os.getpid()
		while True:
			await self.flush()
			await asyncio.sleep(self.sleepTime)

	async def checkFlush(self):
		from gaimon.core.LogHandler import LOG_INFO
		if LOG_INFO['count'] >= self.maxCount:
			await self.flush()

	async def flush(self):
		from gaimon.core.LogHandler import LOG_INFO, LOG
		if len(LOG) == 0: return
		LOG_INFO['count'] = 0
		LOG_INFO['lastFlush'] = time.time()
		logging.info(
			f"Flush Log {os.getpid()} ID={self.application.applicationID} memory : {int(psutil.Process().memory_info().rss / (1024 * 1024))}MB"
		)
		for level, nameMap in LOG.items():
			for name, logList in nameMap.items():
				if len(logList) == 0: continue
				label = LOG_LABEL.get(level, "UNDEFINED")
				path = f"{self.resourcePath}/log/{name}-{self.dateID}-{self.pid}-{label}.json"
				if not os.path.isfile(path):
					self.writeNewLog(path, logList)
				else:
					self.writeExistingLog(path, logList)
				logList.clear()

		self.checkMergeLog()

	def checkMergeLog(self):
		dateID = getCurrentDateID()
		if self.dateID != dateID:
			self.dateID = dateID
			if self.application.applicationID == 0:
				try:
					self.mergeLog()
				except:
					print(traceback.format_exc())
					print("*** ERROR")
					logging.error("Cannot merge log.")

	def writeNewLog(self, path: str, logList: list):
		with open(path, "wt") as fd:
			joined = ",\n".join(logList)
			fd.write(f'[{joined}]')

	def writeExistingLog(self, path: str, logList: list):
		stat = os.stat(path)
		tail = stat.st_size
		with open(path, "rt+") as fd:
			if tail == 0:
				fd.write("[")
			else:
				fd.seek(tail - 1, io.SEEK_SET)
				fd.write(",\n")

			fd.write(",\n".join(logList))
			fd.write("]")

	def mergeLog(self):
		logPath = f"{self.resourcePath}/log/"
		dateMap = {}
		removeList = []
		if not os.path.exists(logPath): os.makedirs(logPath)
		for i in os.listdir(logPath):
			if i[-5:] != '.json': continue
			splitted = i[:-5].split("-")
			if splitted[0] != "gaimon": continue
			dateID = int(splitted[1])
			level = splitted[-1]
			levelMap = dateMap.get(dateID, {})
			if len(levelMap) == 0: dateMap[dateID] = levelMap
			logList = levelMap.get(level, [])
			if len(logList) == 0: levelMap[level] = logList
			path = f"{logPath}/{i}"
			removeList.append(path)
			try:
				with open(path) as fd:
					logList.extend(json.load(fd))
			except:
				print(traceback.format_exc())

		for dateID, levelMap in dateMap.items():
			logDate = datetime.fromtimestamp(dateID * DAY_SECONDS + 1)
			for level, logList in levelMap.items():
				datePath = logDate.strftime("%Y/%m")
				logDirectory = f"{self.resourcePath}/log/{datePath}"
				day = logDate.strftime('%d')
				path = f"{logDirectory}/{day}-gaimon-{level}.gz"
				if os.path.isfile(path):
					with open(path, "rb") as fd:
						existingZipped = fd.read()
						existing = json.loads(zlib.decompress(existingZipped).decode())
						existing.extend(logList)
						logList = existing
				logList.sort(key=lambda x: x['time'])
				if not os.path.isdir(logDirectory): os.makedirs(logDirectory)
				raw = json.dumps(logList)
				zipped = zlib.compress(raw.encode())
				with open(path, "wb") as fd:
					fd.write(zipped)

		for path in removeList:
			if os.path.isfile(path):
				os.remove(path)
