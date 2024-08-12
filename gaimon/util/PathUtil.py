import importlib.util
import sys, os

IS_WINDOWS = sys.platform in ['win32', 'win64']
IS_VENV = sys.prefix != sys.base_prefix

def getConfigPath() -> str:
	if IS_VENV:
		return conform(f'{sys.prefix}/etc')
	else:
		return conform('/etc')

def getResourcePath() -> str:
	if IS_VENV:
		return conform(f'{sys.prefix}/var')
	else:
		return conform('/var')

def getGaimonResourcePath(namespace: str=None) -> str:
	if namespace is not None and len(namespace):
		return f"{getResourcePath()}/gaimon/namespace/{namespace}/"
	else:
		return f"{getResourcePath()}/gaimon/"

def conform(path):
	isRootPath = False
	splitted = path.split("/")
	if len(splitted) <= 1: return path
	rootPrefix = ('etc', 'var', 'usr', 'home')
	if splitted[1] in rootPrefix or path[0] == "/": isRootPath = True
	if IS_WINDOWS:
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
	if IS_WINDOWS:
		command = f"mklink /D {destination} {source}"
	if not os.path.islink(destination):
		print(command)
		return os.system(command)

def linkEach(source, destination):
	for i in os.listdir(source):
		link(f'{source}/{i}', f'{destination}{i}')

def copy(source, destination, isFolder=False):
	source = conform(source)
	destination = conform(destination)
	if isFolder:
		command = f"cp -rfv {source} {destination}"
	else:
		command = f"cp {source} {destination}"
	if IS_WINDOWS:
		command = f"copy {source} {destination}"
		if isFolder: command = f"xcopy /e {source} {destination}"
	print(command)
	return os.system(command)

def copyEach(source, destination):
	for i in os.listdir(source):
		sourcePath = f'{source}/{i}'
		isFolder = os.path.isdir(sourcePath)
		copy(sourcePath, f'{destination}{i}', isFolder)

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

