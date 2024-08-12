class HashNode:
	position: int

	def hash(self) -> int:
		raise NotImplementedError

	def isEqual(self, other) -> bool :
		raise NotImplementedError

	def load(self, version: int, buffer:bytes) :
		raise NotImplementedError
		
	def dump(self) -> bytes :
		raise NotImplementedError
