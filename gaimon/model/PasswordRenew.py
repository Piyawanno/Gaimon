from xerial.Record import Record
from xerial.StringColumn import StringColumn
from xerial.IntegerColumn import IntegerColumn
from xerial.DateColumn import DateColumn

from gaimon.model.User import HASH_ITERATION, HASH_LENGTH, SALT_LENGTH

import base64, struct, secrets, hashlib


class PasswordRenew(Record):
	uid = IntegerColumn(isIndex=True, foreignKey='User.id')
	code = StringColumn(length=SALT_LENGTH)
	salt = StringColumn(length=SALT_LENGTH)
	expireDate = DateColumn()
	isActivated = IntegerColumn(default=0)
	token: bytes

	@staticmethod
	def decode(code):
		record = PasswordRenew()
		raw = base64.urlsafe_b64decode(code)
		print(raw)
		try:
			record.id, = struct.unpack('<Q', raw[:8])
		except:
			record.id = -1
		record.token = raw[8:]
		return record

	def encode(self) -> str:
		encodedID = struct.pack('<Q', self.id)
		raw = b''.join([encodedID, self.hash()])
		print(raw)
		return base64.urlsafe_b64encode(raw)

	def generate(self):
		self.code = base64.b16encode(secrets.token_bytes(SALT_LENGTH)
										)[:SALT_LENGTH].decode()
		self.salt = base64.b16encode(secrets.token_bytes(SALT_LENGTH)
										)[:SALT_LENGTH].decode()

	def checkCode(self, token: bytes) -> bool:
		return token == self.hash()

	def hash(self) -> bytes:
		return hashlib.pbkdf2_hmac(
			'SHA512',
			self.code.encode(),
			self.salt.encode(),
			HASH_ITERATION,
			HASH_LENGTH
		)
