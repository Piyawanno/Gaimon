from gaimon.util.backup.BackupStorage import BackupStorage
from gaimon.util.backup.BackupBase import BackupBase

from datetime import datetime

import logging


class BackupRestore(BackupBase):
	def __init__(self, config: dict, storage: BackupStorage):
		self.config = config
		self.storage = storage

	async def restore(self, entity: str, start: datetime, stop: datetime):
		await self.connect(entity)
		if len(entity) == 0: entity = 'main'
		data = await self.storage.read(entity, start, stop)
		accumulatedInsert = {}
		accumulatedUpdate = {}
		for date, mapped in data.items():
			for modelName, rawList in mapped.items():
				modelClass = self.session.model.get(modelName, None)
				if modelClass is None: continue
				insert = accumulatedInsert.get(modelName, [])
				if len(insert) == 0: accumulatedInsert[modelName] = insert
				update = accumulatedUpdate.get(modelName, [])
				if len(update) == 0: accumulatedUpdate[modelName] = update
				for raw in rawList:
					if raw['__update_time__'] > 0: update.append(raw)
					else: insert.append(raw)

		for modelName, insert in accumulatedInsert.items():
			modelClass = self.session.model.get(modelName, None)
			if modelClass is None: continue
			if len(insert):
				insert.sort(key=lambda x: x['__insert_time__'])
				await self.session.insertMultipleDirect(modelClass, insert)

		for modelName, update in accumulatedUpdate.items():
			modelClass = self.session.model.get(modelName, None)
			if modelClass is None: continue
			update.sort(key=lambda x: x['__update_time__'])
			for raw in update:
				await self.session.updateDirect(modelClass, raw)
			logging.info(
				f">>> Restore {modelName} : insert={len(insert)}, update={len(update)}"
			)
