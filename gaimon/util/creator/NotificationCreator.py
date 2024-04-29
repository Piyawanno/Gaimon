from gaimon.core.AsyncServiceClient import AsyncServiceClient
from gaimon.service.notification.NotificationLevel import NotificationLevel
from gaimon.service.notification.NotificationType import NotificationType

from datetime import datetime


class NotificationCreator:
	def __init__(self, config):
		self.config = config
		self.client = AsyncServiceClient(config)

	async def createNotification(
		self,
		level: NotificationLevel,
		uid: int,
		n: int,
		type: NotificationType,
		message: str
	):
		for i in range(n):
			data = {
				'level': level,
				'uid': uid,
				'type': type,
				'info': {
					'module': 'production',
					'message': message
				}
			}
			result = await self.client.call('/set', data)
			print(f"Send notification {i}", result)


if __name__ == '__main__':
	import json, asyncio
	with open('/etc/gaimon/Notification.json', encoding="utf-8") as fd:
		config = json.load(fd)
	print(config)

	creator = NotificationCreator(config)
	asyncio.run(
		creator.createNotification(
			NotificationLevel.INFO,
			2,
			1,
			NotificationType.INTERNAL,
			f"This's a fake notification for test @{datetime.now()}."
		)
	)
