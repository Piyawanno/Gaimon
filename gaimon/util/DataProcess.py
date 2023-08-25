def transposeRecord(recordList):
	if len(recordList) == 0: return {}
	keyList = list(recordList[0].keys())
	transposed = {i: [] for i in keyList}
	for i in recordList:
		for k, v in i.items():
			transposed[k].append(v)
	return transposed


def retransposeRecord(transposed):
	keyList = list(transposed.keys())
	if len(keyList) == 0: return []
	recordList = [{} for i in range(len(transposed[keyList[0]]))]
	for k, valueList in transposed.items():
		for i, v in enumerate(valueList):
			recordList[i][k] = v
	return recordList
