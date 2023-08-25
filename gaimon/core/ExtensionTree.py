class ExtensionTree :
	def __init__(self) :
		self.tree = {}
	
	def append(self, extensionPath:str) :
		splitted = extensionPath.split(".")
		current = self.tree
		for i in splitted :
			child = current.get(i, {})
			if len(child) == 0 : current[i] = child
			current = child
	
	def isImported(self, extensionPath:str) -> True :
		splitted = extensionPath.split(".")
		current = self.tree
		for i in splitted :
			current = current.get(i, None)
			if current is None : return False
		return True
