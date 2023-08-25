from enum import IntEnum


class PermissionType(IntEnum):
	READ = 1
	WRITE = 2
	UPDATE = 3
	DROP = 4
	DECISION = 5


PermissionType.label = {
	PermissionType.READ: 'READ',
	PermissionType.WRITE: 'WRITE',
	PermissionType.UPDATE: 'UPDATE',
	PermissionType.DROP: 'DROP',
	PermissionType.DECISION: 'DECISION',
}
