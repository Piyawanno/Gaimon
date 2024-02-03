from thaiartisan.thaiartisan.model.ThaiArtisanEBook import ThaiArtisanEBook
from gaimon.util.DateTimeUtil import dateIDToDateTime, dateTimeToDateID
from xerial.AsyncDBSessionPool import AsyncDBSessionPool
from datetime import datetime
from typing import Dict, List, Any, Tuple
import matplotlib.pyplot as plot

import json, zlib, os, traceback, requests

# DateID -> List of Dict of Log
LogMap = Dict[int, List[Dict[str, Any]]]


ROW = """<tr>
	<td style="text-align:right;">{title} ({count})</td>
	<td><div style="background-color:blue; width:{width}px;height:15px;"></div></td>
</tr>

"""

class LogAnalyzer:
	def __init__(self, config):
		self.config = config
		self.resourcePath = config['resourcePath']
	
	def getBookID(self, url:str, trigger:str) :
		if trigger in  url :
			p0 = url.find(trigger)+len(trigger)
			tail = url[p0:]
			if '&' in tail or '?' in tail :
				p1 = tail.find('&')
				p2 = tail.find('?')
				p3 = p1 if (p1 >= 0 and p1 < p2) or p2 < 0 else p2
				if p3 < 0 :
					return None
				try :
					id = int(tail[:p3])
				except :
					id = None
			else :
				id = int(tail)
			return id
		else :
			return None

	def getBookRead(
			self,
			startDate: datetime,
			endDate: datetime,
		) :
		start = dateTimeToDateID(startDate)
		end = dateTimeToDateID(endDate)
		bookCount = {}
		for dateID in range(start, end + 1):
			accessDate = dateIDToDateTime(dateID)
			logMap = self.readLog(accessDate, accessDate)
			logList = logMap.get(dateID, None)
			for i in logList :
				url:str = i['url']
				id = self.getBookID(url, 'ebook/view/')
				if id is None : id = self.getBookID(url, '?page=library&id=')
				if id is None : continue
				if id not in bookCount : bookCount[id] = 1
				else : bookCount[id] += 1
		response = requests.get('https://thaiartisan.org/thaiartisan/thaiartisan/ebook/simple/get')
		bookData = response.json()
		bookMap = {i['id']:i['name'] for i in bookData['result']}
		bookCountItem = sorted([(k, v) for k, v in bookCount.items()], key=lambda x : x[1], reverse=True)
		for id, n in bookCountItem :
			bookName = bookMap.get(id, None)

	def getTopMenu(
		self,
		startDate: datetime,
		endDate: datetime,
		menuMap: Dict[str, str],
	):
		start = dateTimeToDateID(startDate)
		end = dateTimeToDateID(endDate)
		visitMap = {}
		for dateID in range(start, end + 1):
			accessDate = dateIDToDateTime(dateID)
			logMap = self.readLog(accessDate, accessDate)
			logList = logMap.get(dateID, None)
			for log in logList:
				pageName:str = log['url']
				for pattern, name in menuMap.items() :
					if pattern not in pageName : continue
					if name not in visitMap: visitMap[name] = 1
					else : visitMap[name] +=1
					break
		mostVisit = sorted([(k, v) for k, v in visitMap.items()], key=lambda x: x[1], reverse=True)
		factor = 500/mostVisit[0][1]
		for pageName, count in mostVisit:
			print(ROW.format(title=pageName, count=count, width=int(count*factor)))

	def getTopVisit(
		self,
		startDate: datetime,
		endDate: datetime,
		n: int = 10,
		route=None
	):
		start = dateTimeToDateID(startDate)
		end = dateTimeToDateID(endDate)
		visitMap = {}
		for dateID in range(start, end + 1):
			accessDate = dateIDToDateTime(dateID)
			logMap = self.readLog(accessDate, accessDate)
			logList = logMap.get(dateID, None)
			for log in logList:
				if route is not None and log['route'] != route: continue
				if 'requestData' not in log : continue
				if 'page' not in log['requestData'] : continue
				url = log['requestData']['page']['url']
				title = log['requestData']['page']['title']
				if url not in visitMap:
					visitMap[url] = {
						'count' : 1,
						'title' : title,
					}
				else:
					visitMap[url]['count'] += 1

		mostVisit = sorted([(k,v) for k, v in visitMap.items()], key=lambda x: x[1]['count'], reverse=True)
		factor = 500/mostVisit[0][1]
		for url, data in mostVisit[:n]:
			# print(f"{data['title']} : {data['count']}")
			print(ROW.format(title=data['title'], count=data['count'], width=int(data['count']*factor)))

	def showVisit(self, startDate: datetime, endDate: datetime, isGraphic: bool = False):
		start = dateTimeToDateID(startDate)
		end = dateTimeToDateID(endDate)
		visitMap = []
		for dateID in range(start, end + 1):
			accessDate = dateIDToDateTime(dateID)
			logMap = self.readLog(accessDate, accessDate)
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
		plot.bar([i + 0.3 for i in range(n)], count, width=0.3, label="visit")
		# plot.bar([i+0.3 for i in range(n)], averaged, width=0.3, label="average page count per visit")
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
