from xerial.Record import Record
from xerial.IntegerColumn import IntegerColumn
from xerial.StringColumn import StringColumn

from xerial.input.EnumSelectInput import EnumSelectInput
from xerial.input.ReferenceSelectInput import ReferenceSelectInput
from xerial.input.PrerequisiteReferenceSelectInput import PrerequisiteReferenceSelectInput

from gaimon.model.PermissionType import PermissionType

__GAIMON_ROLE__ = ['User', 'Role', 'Unit', 'Dashboard']


class UserGroupPermission(Record):
	gid = IntegerColumn(foreignKey="UserGroup.id")
	module = StringColumn(
		length=255,
		input=ReferenceSelectInput(
			label="Module",
			order="1",
			url="backend/extension/enabled/get",
			isTable=True,
			isSearch=False,
			isRequired=True
		)
	)
	permission = StringColumn(
		length=255,
		input=PrerequisiteReferenceSelectInput(
			label="Permission",
			order="1",
			prerequisite="UserGroupPermission.module",
			url="backend/role/by/extension/get/",
			isTable=True,
			isSearch=False,
			isRequired=True
		)
	)
	permissionType = IntegerColumn(
		default=0,
		input=EnumSelectInput(
			label="Type",
			order="3",
			enum=PermissionType,
			isTable=True,
			isSearch=False,
			isRequired=True
		)
	)
 
	users = []

	def toString(self):
		return f"{self.module}.{self.permission}.{PermissionType.label[self.permissionType]}"
