from typing import Any

class UpdateDict(dict):
	def __init__(self, initial=None, sid=None):
		dict.__init__(self, initial or ())
		self.sid = sid
		self.modified = False
	
	def __setitem__(self, key: Any, value: Any) -> None:
		self.modified = True
		return dict.__setitem__(self, key, value)
	
	def __delitem__(self, key: Any) -> None:
		self.modified = True
		return dict.__delitem__(self, key)
	
	def setdefault(self, key, default=None):
		self.modified = key not in self
		return dict.setdefault(self, key, default)

	def pop(self, key, default=None):
		self.modified = key in self
		return dict.pop(self, key) if default is None else dict.pop(self, key, default)
	
	def clear(self) -> None:
		self.modified = True
		return dict.clear(self)
	
	def popitem(self) -> tuple:
		self.modified = True
		return dict.popitem(self)

	def update(self, **kwargs: Any):
		self.modified = True
		return dict.update(self, **kwargs)