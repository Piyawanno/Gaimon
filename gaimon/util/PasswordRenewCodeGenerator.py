from gaimon.util.CommonDBBounded import CommonDBBounded
from gaimon.model.User import User
from gaimon.model.PasswordRenew import PasswordRenew

from datetime import datetime, timedelta


class PasswordRenewCodeGenerator(CommonDBBounded):
	async def generate(self, uid: int, expireDay: int = 15) -> PasswordRenew:
		clause = "WHERE id=?"
		userList = await self.session.select(
			User,
			clause,
			parameter=[uid],
			isRelated=False,
			isChildren=False
		)
		if len(userList) == 0:
			print(f"*** Error : User ID={uid} cannot be found.")
			return
		renew = PasswordRenew()
		renew.uid = userList[0]
		renew.expireDate = datetime.now() + timedelta(days=expireDay)
		renew.generate()
		await self.session.insert(renew)
		renew.token = renew.encode()
		return renew
