from xerial.Record import Record
from xerial.DateTimeColumn import DateTimeColumn
from xerial.DateColumn import DateColumn
from xerial.IntegerColumn import IntegerColumn
from xerial.StringColumn import StringColumn
from xerial.input.TextInput import TextInput
from xerial.input.EmailInput import EmailInput
from xerial.input.PasswordInput import PasswordInput
from xerial.input.NumberInput import NumberInput
from xerial.input.FileInput import FileInput
from xerial.input.HiddenInput import HiddenInput
from xerial.input.ReferenceSelectInput import ReferenceSelectInput
from xerial.input.ImageInput import ImageInput

from enum import IntEnum

import hashlib, secrets

HASH_ITERATION = 1_000
HASH_LENGTH = 64
SALT_LENGTH = 64

class UserInputGroup(IntEnum):
	GENERIC = 10
	DRIVER_GENERIC = 20
	DRIVER_LICENSE = 21	
	ORGANIZATION_GENERIC = 30

UserInputGroup.label = {
	UserInputGroup.GENERIC: 'Generic Data',
	UserInputGroup.DRIVER_GENERIC: 'Driver Generic Data',
	UserInputGroup.DRIVER_LICENSE: 'Driver License',
	UserInputGroup.ORGANIZATION_GENERIC: 'Organization Generic Data',
}

UserInputGroup.order = {
	UserInputGroup.GENERIC: '1.0',
	UserInputGroup.DRIVER_GENERIC: '2.0',
	UserInputGroup.DRIVER_LICENSE: '3.0',
	UserInputGroup.ORGANIZATION_GENERIC: '4.0'
}

class User(Record):
	__tablename__ = "GaimonUser"
	inputPerLine = 2
	__GROUP_LABEL__ = UserInputGroup

	username = StringColumn(
		length=255,
		isIndex=True,
		input=TextInput(
			label="Username",
			order="1",
			group=UserInputGroup.GENERIC,
			isTable=True,
			isSearch=True,
			isRequired=True
		)
	)
	displayName = StringColumn(
		length=255,
		isIndex=True,
		input=TextInput(
			label="Display Name",
			order="5",
			group=UserInputGroup.GENERIC,
			isTable=False,
			isSearch=True,
			isRequired=True
		)
	)
	gid = IntegerColumn(
		foreignKey="UserGroup.id",
		input=ReferenceSelectInput(
			label="Role",
			order="6",
			group=UserInputGroup.GENERIC,
			url="user/group/option/get",
			isTable=True,
			isSearch=True,
			isRequired=False
		)
	)
	type = IntegerColumn(
		default=0,
		input=HiddenInput(label="Type",
							isTable=False,
							isSearch=False,
							isRequired=False)
	)
	firstName = StringColumn(
		length=255,
		input=TextInput(
			label="First Name",
			order="3",
			group=UserInputGroup.GENERIC,
			isTable=True,
			isSearch=True,
			isRequired=True
		)
	)
	lastName = StringColumn(
		length=255,
		input=TextInput(
			label="Last Name",
			order="4",
			group=UserInputGroup.GENERIC,
			isTable=True,
			isSearch=True,
			isRequired=True
		)
	)
	email = StringColumn(
		length=255,
		isIndex=True,
		input=EmailInput(
			label="E-Mail",
			order="2",
			group=UserInputGroup.GENERIC,
			isTable=True,
			isSearch=True,
			isRequired=True
		)
	)
	avatar = StringColumn(
		length=255,
		input=ImageInput(
			label="Avatar",
			order="8",
			url='user/avatar/image/',
			group=UserInputGroup.GENERIC,
			isTable=False,
			isSearch=False,
			isRequired=False
		)
	)

	facebookID = StringColumn(length=100)
	googleID = StringColumn(length=100)
	lineID = StringColumn(length=100)

	facebookToken = StringColumn(length=512)
	facebookTokenExpireTime = IntegerColumn(length=64)

	passwordHash = StringColumn(
		length=128,
		isFixedLength=True,
		input=PasswordInput(
			label="Password",
			order="7",
			group=UserInputGroup.GENERIC,
			isRequired=True
		)
	)
	salt = StringColumn(length=128, isFixedLength=True)
	resetToken = StringColumn()
	tokenExpireDate = DateTimeColumn()

	isRoot = IntegerColumn(length=1, default=0)
	isOwner = IntegerColumn(length=1, default=0)

	isActive = IntegerColumn(default=0)

	isDrop = IntegerColumn(length=1, isIndex=True, default=0)

	def toOption(self):
		firstName = self.firstName
		if self.firstName is None: firstName = ""
		lastName = self.lastName
		if self.lastName is None: lastName = ""
		return {"value": self.id, "label": (firstName + " " + lastName).strip()}
	
	def getFullName(self):
		firstName = self.firstName
		if self.firstName is None: firstName = ""
		lastName = self.lastName
		if self.lastName is None: lastName = ""
		return (firstName + " " + lastName).strip()

	def toTransportDict(self):
		user = self.toDict()
		user['firstname'] = self.firstName
		user['lastname'] = self.lastName
		if user['isRoot']: user['userType'] = {}
		del user['facebookID']
		del user['googleID']
		del user['lineID']
		del user['passwordHash']
		del user['salt']
		del user['resetToken']
		del user['tokenExpireDate']
		del user['isRoot']
		return user

	def checkPassword(self, hashed, salt, encodedTime):
		concated = b''.join([salt, encodedTime])
		return hashed == hashlib.pbkdf2_hmac(
			'SHA512',
			bytes.fromhex(self.passwordHash),
			concated,
			HASH_ITERATION,
			HASH_LENGTH
		)

	@staticmethod
	def hashSaltedPassword(saltedPassword, salt, encodedTime):
		concated = b''.join([salt, encodedTime])
		return hashlib.pbkdf2_hmac(
			'SHA512',
			saltedPassword,
			concated,
			HASH_ITERATION,
			HASH_LENGTH
		)

	@staticmethod
	def hashPassword(password, salt):
		return hashlib.pbkdf2_hmac('SHA512',
									password,
									salt,
									HASH_ITERATION,
									HASH_LENGTH).hex()

	@staticmethod
	def getSalt():
		return secrets.token_bytes(SALT_LENGTH)
