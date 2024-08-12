from gaimoncrm.cuscomm.util.messagestore.TimeSeriesPageItem import (
	TimeSeriesPageItem,
	BUFFER_SIZE,
	PAGE_SIZE,
	HEADER_SIZE,
)
from typing import List, Tuple

import numpy as np
import io, os

DEFAULT_PAGE_SIZE = 8

"""
NOTE

PageStorage stores data for searching in time range. A PageItem stores
list of position of stored node on given value storage and links to the next
PageItem in linked list manner.
"""

class TimeSeriesPageStorage :
	def __init__(self, resourcePath: str, storageName: str) :
		self.resourcePath: str = resourcePath
		self.storageName: str = storageName
		self.descriptor = None
		self.tailPosition = None
		self.pageList: List[TimeSeriesPageItem] = [TimeSeriesPageItem() for i in range(DEFAULT_PAGE_SIZE)]
		self.usedPage = 0
	
	def __del__(self) :
		self.close()
	
	def open(self) :
		self.path = f'{self.resourcePath}/cuscomm/{self.storageName}.bin'
		mode = 'rb+' if os.path.isfile(self.path) else 'wb+'
		self.descriptor = open(self.path, mode)
		self.tailPosition = self.descriptor.seek(0, io.SEEK_END)
	
	def close(self) :
		if self.descriptor is not None : self.descriptor.close()
	
	def append(self, rootPosition:int, position:int, time:float) -> int :
		self.usedPage = 0
		if rootPosition >= 0 :
			root = self.readEmptyPage(rootPosition)
			tail = self.readEmptyPage(root.tailPage)
		else :
			root, tail = self.createPage(position, time)
			return root.position
		
		if tail.parentPage == root.position : parent = root
		else : parent = self.readEmptyPage(tail.parentPage)

		if tail.pageSize >= PAGE_SIZE :
			if parent.pageSize >= PAGE_SIZE :
				previous = parent
				parent = self.createNeighbor(parent, None)
				previous.writeHeader(self.descriptor)
			previous = tail
			tail = self.createNeighbor(tail, parent)
			previous.writeHeader(self.descriptor)
			parent.append(self.descriptor, tail.position, time)
			root.tailPage = tail.position
			root.writeHeader(self.descriptor)

		tail.append(self.descriptor, position, time)
		return root.position
	
	def search(self, rootPosition:int, time:float) -> int :
		self.usedPage = 0
		childPosition = self.searchPageList(rootPosition, time)
		if childPosition is None : return None
		page = self.readPage(childPosition)
		return page.search(time)[0]
	
	def searchRange(self, rootPosition:int, startTime:float, endTime:float) -> np.ndarray :
		if startTime >= endTime :
			raise ValueError(f'Argument startTime({startTime}) must be smaller then endTime({endTime})')
		self.usedPage = 0
		startChildPosition = self.searchPageList(rootPosition, startTime)
		if startChildPosition is None :
			startPosition = None
		else :
			startPage = self.readPage(startChildPosition)
			startPosition, startIndex = startPage.search(startTime)

		endChildPosition = self.searchPageList(rootPosition, endTime)
		if endChildPosition is None :
			endPosition = None
		else :
			endPage = self.readPage(endChildPosition)
			endPosition, endIndex = endPage.search(endTime)

		if startPosition is None and endPosition is None :
			return None
		elif startPosition is not None and endPosition is None :
			return self.readPositionFrom(startPage, startIndex)
		elif startPosition is None and endPosition is not None :
			return self.readPositionUntil(endPage, endIndex)
		elif startPage.position != endPage.position :
			return self.readPositionInRange(startPage, startIndex,endPage, endIndex)
		else :
			return startPage.positionList[startIndex:endIndex]
	
	def readLastItem(self, rootPosition:int, n:int) -> np.ndarray :
		root = self.readPage(rootPosition)
		page = self.readPage(root.tailPage)
		result = np.zeros(n, dtype=np.int64)
		position = page.pageSize
		result[:page.pageSize] = page.positionList[page.pageSize-1::-1]
		while page.previousPage >= 0 :
			page = self.readPage(page.previousPage)
			size = min(n-position, page.pageSize)
			next = position + size
			result[position:next] = page.positionList[size-1::-1]
			if next >= n : break
			position = next
		return result
	
	def readPositionFrom(self, startPage:TimeSeriesPageItem, startIndex:int) -> np.ndarray :
		result: List[np.ndarray] = []
		positionList = startPage.positionList[startIndex:startPage.pageSize]
		length = positionList.shape[0]
		result.append(positionList)
		page = startPage
		while page.nextPage >= 0 :
			page = self.readPage(page.nextPage)
			length += page.pageSize
			result.append(page.positionList[:page.pageSize])
		merged = np.zeros(length, dtype=np.int64)
		position = 0
		for i in result :
			next = position+i.shape[0]
			merged[position:next] = i
			position = next
		return merged
		
	def readPositionUntil(self, endPage:TimeSeriesPageItem, endIndex:int) -> np.ndarray :
		result: List[np.ndarray] = []
		positionList = endPage.positionList[:endIndex]
		length = positionList.shape[0]
		result.append(positionList)
		page = endPage
		while page.previousPage >= 0 :
			page = self.readPage(page.previousPage)
			length += page.pageSize
			result.append(page.positionList[:page.pageSize])
		merged = np.zeros(length, dtype=np.int64)
		position = 0
		for i in result[::-1] :
			next = position+i.shape[0]
			merged[position:next] = i
			position = next
		return merged
	
	def readPositionInRange(
			self,
			startPage:TimeSeriesPageItem,
			startIndex:int,
			endPage:TimeSeriesPageItem,
			endIndex:int
		) -> np.ndarray :
		result: List[np.ndarray] = []
		positionList = startPage.positionList[startIndex:startPage.pageSize]
		length = positionList.shape[0]
		result.append(positionList)
		page = startPage
		while page.nextPage != endPage.position and page.nextPage > 0:
			page = self.readPage(page.nextPage)
			length += page.pageSize
			result.append(page.positionList[:page.pageSize])
		positionList = endPage.positionList[:endIndex]
		length += positionList.shape[0]
		result.append(positionList)
		merged = np.zeros(length, dtype=np.int64)
		position = 0
		for i in result :
			next = position+i.shape[0]
			merged[position:next] = i
			position = next
		return merged

	def searchCount(self, rootPosition:int, startTime:float, n:int) -> np.ndarray :
		self.usedPage = 0
		childPosition = self.searchPageList(rootPosition, startTime)
		result = np.zeros(n, dtype=np.int64)
		if childPosition is None :
			page = self.readPage(rootPosition)
			startIndex = 0
		else :
			page = self.readPage(childPosition)
			startPosition, startIndex = page.search(startTime)
		position = page.pageSize - startIndex
		result[:position] = page.positionList[startIndex:]
		while page.nextPage >= 0 :
			page = self.readPage(page.nextPage)
			size = min(n-position, page.pageSize)
			next = position + size
			result[position:next] = page.positionList[:size]
			if next >= n : break
			position = next
		return result

	def searchCountReverse(self, rootPosition:int, endTime:float, number:int) -> np.ndarray :
		self.usedPage = 0
		childPosition = self.searchPageList(rootPosition, endTime)
		if childPosition is None : return None
		page = self.readPage(childPosition)
		endPosition, endIndex = page.search(endTime)
		result = np.zeros(n, dtype=np.int64)
		position = endIndex
		result[:endIndex] = page.positionList[endIndex-1::-1]
		while page.previousPage >= 0 :
			page = self.readPage(page.previousPage)
			size = min(n-position, page.pageSize)
			next = position + size
			result[position:next] = page.positionList[size-1::-1]
			if next >= n : break
			position = next
		return result
	
	def searchPageList(self, rootPosition:int, time:float) :
		position = rootPosition
		childPosition = None
		while position >= 0 :
			page = self.readPage(position)
			if time < page.timeList[0] : return childPosition
			childPosition, index = page.search(time)
			if index < page.pageSize - 1 : n
			position = page.nextPage
		return childPosition
	
	def readPage(self, position:int) -> TimeSeriesPageItem :
		self.descriptor.seek(position, io.SEEK_SET)
		buffer = self.descriptor.read(BUFFER_SIZE)
		page = self.getPage()
		page.position = position
		page.load(buffer)
		return page
	
	def readEmptyPage(self, position:int) -> TimeSeriesPageItem :
		self.descriptor.seek(position, io.SEEK_SET)
		buffer = self.descriptor.read(HEADER_SIZE)
		page = self.getPage()
		page.position = position
		page.loadHeader(buffer)
		return page
	
	def writePage(self, page:TimeSeriesPageItem) :
		self.descriptor.seek(page.position, io.SEEK_SET)
		self.descriptor.write(page.dump())
	
	def getPage(self) -> TimeSeriesPageItem :
		if self.usedPage >= len(self.pageList) :
			page = TimeSeriesPageItem()
			self.pageList.append(page)
		else :
			page = self.pageList[self.usedPage]
		page.isUpdate = False
		self.usedPage += 1
		return page
	
	def createNeighbor(self, page:TimeSeriesPageItem, parent:TimeSeriesPageItem) -> TimeSeriesPageItem :
		neighbor = self.getPage()
		self.tailPosition = self.descriptor.seek(0, io.SEEK_END)
		neighbor.position = self.tailPosition
		neighbor.previousPage = page.position
		page.nextPage = neighbor.position
		neighbor.parentPage = -1 if parent is None else parent.position
		neighbor.pageSize = 0
		neighbor.nextPage = -1
		neighbor.parentIndex = -1 if parent is None else parent.pageSize
		neighbor.createData()
		self.tailPosition += BUFFER_SIZE
		buffer = neighbor.dump()
		self.descriptor.write(buffer)
		return neighbor
	
	def createPage(self, position:int, time:float) -> Tuple[TimeSeriesPageItem, TimeSeriesPageItem] :
		self.tailPosition = self.descriptor.seek(0, io.SEEK_END)
		root = self.getPage()
		root.reset()
		root.createData()
		root.position = self.tailPosition
		root.pageSize = 1
		tail = self.getPage()
		tail.reset()
		tail.createData()
		tail.position = self.tailPosition + BUFFER_SIZE
		root.tailPage = tail.position
		root.positionList[0] = tail.position
		root.timeList[0] = time

		tail.pageSize = 1
		tail.parentPage = root.position
		tail.positionList[0] = position
		tail.timeList[0] = time
		buffer = root.dump()
		self.descriptor.write(buffer)
		self.descriptor.seek(tail.position, io.SEEK_SET)
		buffer = tail.dump()
		self.descriptor.write(buffer)
		return (root, tail)

if __name__ == '__main__' :
	import random, time
	if not os.path.isdir('./cuscomm') : os.mkdir('./cuscomm')
	storage = TimeSeriesPageStorage('./')
	storage.open()
	n = 10_000
	position = 0
	insertTime = time.time()
	positionList = position + np.cumsum(np.random.randint(200, 500, n))
	insertTimeList = insertTime + np.cumsum(abs(np.random.normal(0, 0.01, n)))
	rootPosition = -1
	start = time.time()
	for i in range(n) :
		position = positionList[i]
		insertTime = insertTimeList[i]
		rootPosition = storage.append(rootPosition, position, insertTime)
		if i%50000 == 49999 : print(i+1)
	elapsed = time.time() - start
	print(elapsed, n/elapsed)
	start = time.time()
	for i in range(n) :
		found = storage.search(rootPosition, insertTimeList[i])
	elapsed = time.time() - start
	print(elapsed, n/elapsed)

	for i in range(10) :
		start = random.randint(0, n/2)
		offset = random.randint(0, n/2)
		startTime = insertTimeList[start]
		endTime = insertTimeList[start+offset]
		positionList = storage.searchRange(rootPosition, startTime, endTime)
		print('>>>', i, start, offset == len(positionList))
		positionList = storage.searchCount(rootPosition, startTime, n)
		print('>>>', i, start, n == len(positionList))
		positionList = storage.searchCountReverse(rootPosition, endTime, n)
		print('>>>', i, start+offset, n == len(positionList))
