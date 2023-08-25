from gaimon.util.DateTimeUtil import dateIDToDateTime, dateTimeToDateID
from datetime import datetime
from typing import Dict, List, Any, Tuple
import matplotlib.pyplot as plot

import json, zlib, os, traceback

# DateID -> List of Dict of Log
LogMap = Dict[int, List[Dict[str, Any]]]


class LogAnalyzer:
	def __init__(self, config):
		self.config = config
		self.resourcePath = config['resourcePath']

	def getTopVisit(
		self,
		startDate: datetime,
		endDate: datetime,
		n: int = 10,
		route=None
	):
		logMap = self.readLog(startDate, endDate)
		start = dateTimeToDateID(startDate)
		end = dateTimeToDateID(endDate)
		visitMap = {}
		for dateID in range(start, end + 1):
			logList = logMap.get(dateID, None)
			for log in logList:
				if route is not None and log['route'] != route: continue
				if log['extension'] == 'gaimon': continue
				if log['extension'] == 'gaimon.controller': continue
				if log['route'] == '/share/<path:path>': continue
				url = log['url']
				if url not in visitMap:
					visitMap[url] = 1
				else:
					visitMap[url] += 1

		mostVisit = sorted([(k,v) for k, v in visitMap.items()], key=lambda x: x[1], reverse=True)
		for url, n in mostVisit[:n]:
			print(f"{url} : {n}")

	def showVisit(self, startDate: datetime, endDate: datetime, isGraphic: bool = False):
		logMap = self.readLog(startDate, endDate)
		start = dateTimeToDateID(startDate)
		end = dateTimeToDateID(endDate)
		visitMap = []
		for dateID in range(start, end + 1):
			logList = logMap.get(dateID, None)
			if logList is None: continue
			remoteMap = {}
			pageCountMap = {}
			for log in logList:
				remote = log.get('remote', None)
				if remote is None: remote = log.get('host', None)
				if remote is None: continue
				if remote in remoteMap: remoteMap[remote] += 1
				else: remoteMap[remote] = 1
				if log['route'] == '/share/<path:path>':
					if remote in pageCountMap: pageCountMap[remote] += 1
					else: pageCountMap[remote] = 1
			date = dateIDToDateTime(dateID)
			count = len(remoteMap)
			if count == 0:
				averaged = 0.0
			else:
				averaged = sum([n for n in pageCountMap.values()]) / count
			visitMap.append((date, count, averaged))
			print(f"{date.strftime('%d %b %Y')} : visit={count}, average={averaged:.3}")

		total = sum([n for d, n, a in visitMap])
		average = total / len(visitMap)
		print(f"Total Visit : {total}, average : {average}")
		if isGraphic: self.plotVisit(visitMap)

	def plotVisit(self, visitMap: List[Tuple[datetime, int, float]]):
		date = [d.strftime('%d %b %y') for d, n, a in visitMap]
		count = [n for d, n, a in visitMap]
		averaged = [a for d, n, a in visitMap]
		n = len(date)
		figure = plot.figure(figsize=(10, 6))
		plot.bar([i + 0.2 for i in range(n)], count, width=0.3, label="visit")
		# plot.bar([i+0.5 for i in range(n)], averaged, width=0.3, label="average page count per visit")
		plot.xticks([i + 0.35 for i in range(n)], date)
		plot.xlabel('date')
		plot.ylabel('visitor number')
		plot.xticks(rotation=30)
		plot.legend()
		plot.title(f'Visitor of {self.config["rootURL"]}')
		path = f'Visitor-{visitMap[0][0].strftime("%Y-%m-%d")}-{visitMap[-1][0].strftime("%Y-%m-%d")}.png'
		plot.savefig(path)
		print(f'Save plot to {path}')

	def readLog(self, startDate: datetime, endDate: datetime) -> LogMap:
		logPath = f"{self.resourcePath}/log/"
		start = dateTimeToDateID(startDate)
		end = dateTimeToDateID(endDate)

		logMap = self.readCurrentLog()
		for i in range(start, end + 1):
			date = dateIDToDateTime(i)
			path = f"{logPath}/{date.strftime('%Y/%m/%d')}-gaimon-INFO.gz"
			logList = logMap.get(i, [])
			if len(logList) == 0: logMap[i] = logList
			if os.path.isfile(path):
				with open(path, 'rb') as fd:
					compressed = fd.read()
					raw = zlib.decompress(compressed)
					parsed = json.loads(raw)
					logList.extend(parsed)
		return logMap

	def readCurrentLog(self) -> LogMap:
		logPath = f"{self.resourcePath}/log/"
		logMap = {}
		for i in os.listdir(logPath):
			splitted = i[:-5].split("-")
			if i[-5:] == '.json' and splitted[-1] == 'INFO':
				path = f"{logPath}/{i}"
				dateID = int(splitted[1])
				logList = logMap.get(dateID, [])
				if len(logList) == 0: logMap[dateID] = logList
				try:
					with open(path) as fd:
						log = json.load(fd)
						logList.extend(log)
				except:
					print(traceback.format_exc())
					print(f"*** Error file {path}")
		return logMap
