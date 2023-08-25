import sys, os


def conform(path):
	isRootPath = False
	splitted = path.split("/")
	if len(splitted) <= 1: return path
	rootPrefix = ('etc', 'var', 'usr', 'home')
	if splitted[1] in rootPrefix or path[0] == "/": isRootPath = True
	if sys.platform == 'win32':
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
