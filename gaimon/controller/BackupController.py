from xerial.DateColumn import DATE_FORMAT

from gaimon.core.Route import POST
from gaimon.util.backup.BackupStorage import BackupStorage
from gaimon.util.DataProcess import transposeRecord

from datetime import datetime

import json, zlib

__CHUNK_SIZE__ = 4096


class BackupController:
	def __init__(self, application):
		self.application = application
		self.resourcePath = application.resourcePath
		self.storage = BackupStorage(self.resourcePath)

	@POST('/backup/get', role=['user'])
	async def getBackup(self, request):
		start = request.json['start']
		if start is not None:
			start = datetime.strptime(start, DATE_FORMAT)
		end = datetime.strptime(request.json['end'], DATE_FORMAT)
		namespace = request.json['namespace']
		loaded = await self.storage.read(namespace, start, end)
		transposed = {}
		for date, mapped in loaded.items():
			transposed[date] = {k: transposeRecord(v) for k, v in mapped.items()}
		zipped = zlib.compress(json.dumps(transposed).encode())
		response = await request.respond(content_type="application/zip")
		i = 0
		j = __CHUNK_SIZE__
		l = len(zipped)
		while i < l:
			await response.send(zipped[i:j])
			i = j
			j += __CHUNK_SIZE__
		await response.eof()
