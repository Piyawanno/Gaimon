import importlib.util
import sys, os


def conform(path):
	isRootPath = False
	splitted = path.split("/")
	if len(splitted) <= 1: return path
	rootPrefix = ('etc', 'var', 'usr', 'home')
	if splitted[1] in rootPrefix or path[0] == "/": isRootPath = True
	if sys.platform == 'win32':
		from pathlib import Path
		result = os.sep.join([i for i in splitted if len(i)])
		if isRootPath: result = str(Path.home()) + os.sep + result
		if path[-1] == "/": result = result + os.sep
		return result
	result = "/".join([i for i in splitted if len(i)])
	if isRootPath: result = '/' + result
	if path[-1] == "/": result = result + "/"
	return result


def link(source, destination):
	source = conform(source)
	destination = conform(destination)
	command = f"ln -s {source} {destination}"
	if sys.platform == 'win32': command = f"mklink /D {destination} {source}"
	print(command)
	return os.system(command)


def copy(source, destination, isFolder=False):
	source = conform(source)
	destination = conform(destination)
	command = f"cp {source} {destination}"
	if isFolder: command = f"cp -rfv {source} {destination}"
	if sys.platform == 'win32':
		command = f"copy {source} {destination}"
		if isFolder: command = f"xcopy /e {source} {destination}"
	print(command)
	return os.system(command)


def getModel(name: str, path: str) -> type:
	# Append the directory to sys.path
	originalSysPath = sys.path.copy()
	sys.path.append(path)

	try:
		print(f"[get model]: modelPath: {path}")
		
		if path[-3:] != ".py":
			path = f'{path}.py'

		# Construct a valid module name by replacing illegal characters
		moduleName = f'{name}'

		# Load the module from the given file path
		spec = importlib.util.spec_from_file_location(moduleName, path)
		if spec is None:
			raise FileNotFoundError(f"[get model]: File '{path}' not found")
		module = importlib.util.module_from_spec(spec)
		sys.modules[moduleName] = module
		if spec.loader is not None:
			spec.loader.exec_module(module)

		# Retrieve the class from the loaded module
		target = getattr(module, name, None)
		if target is None:
			raise AttributeError(f"[get model]: The class '{name}' was not found")

		return target

	finally:
		# Restore the original sys.path
		sys.path = originalSysPath

