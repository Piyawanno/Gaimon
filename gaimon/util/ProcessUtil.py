from typing import Dict, List
from subprocess import check_output
from psutil import Process

import json, sys, os, psutil, time


def readConfig(
	mainConfig: List[str],
	sideConfig: Dict[str, str],
	namespace: str = '',
	basePath: str = None
) -> dict:
	from gaimon.util.PathUtil import conform
	if basePath is None:
		if namespace is None or len(namespace) == 0:
			basePath = '/etc/gaimon/'
		else:
			basePath = f'/etc/gaimon/namespace/{namespace}/'

	config = {}
	for configPath in mainConfig:
		path = conform(f'{basePath}{configPath}')
		if not os.path.isfile(path) : continue
		with open(path, encoding="utf-8") as fd:
			loaded = json.load(fd)
			config.update(loaded)

	for name, configPath in sideConfig.items():
		path = conform(f'{basePath}/{configPath}')
		if not os.path.isfile(path) : continue
		with open(path, encoding="utf-8") as fd:
			loaded = json.load(fd)
			config[name] = loaded
	return config


def getProcessByName(processName) -> List[Process]:
	processList = []
	l = len(processName)
	for process in psutil.process_iter():
		command = process.as_dict()['cmdline']
		for argument in command:
			if processName == argument[-l:]:
				processList.append(process)
	return processList


def kill(processName: str):
	pid = os.getpid()
	processList = getProcessByName(processName)
	for process in processList:
		if process.pid == pid: continue
		try:
			print(f'>>> Kill {process.pid}')
			process.kill()
		except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess) as error:
			print(error)


def daemonize(name, action, callee, namespace: str = '', pidFilePath: str = None):
	from daemon import pidfile
	import daemon
	if pidFilePath is None:
		if namespace is None or len(namespace) == 0:
			pidFilePath = f'/var/gaimon/{name}.pid'
		else:
			pidFilePath = f'/var/gaimon/namespace/{namespace}/{name}.pid'

	def start():
		if os.path.isfile(pidFilePath):
			print(">>> Warning : pid file exists. Daemon will not start.")
			return
		pidFile = pidfile.PIDLockFile(pidFilePath)
		with daemon.DaemonContext(
			pidfile=pidFile,
			stdout=sys.stdout,
			stderr=sys.stderr
		) as context:
			callee()

	def stop():
		if not os.path.isfile(pidFilePath): return
		with open(pidFilePath, encoding="utf-8") as fd:
			pidList = map(int, fd.read().split())
			for pid in pidList:
				process = psutil.Process(pid)
				process.terminate()

	def restart():
		stop()
		time.sleep(1)
		start()

	print(f">>> Process : {name} -> {action}")
	if action == 'start': start()
	elif action == 'stop': stop()
	elif action == 'restart': restart()
	elif action == 'kill':
		kill(name)
		if os.path.isfile(pidFilePath):
			os.remove(pidFilePath)

def setSystemPath(namespace):
	path = f'/var/gaimon/package/{namespace}'
	if not os.path.isdir(path) : return
	import gaimon, site, pip
	sitePackages = set(site.getsitepackages())
	sitePackages = sitePackages.union({os.path.dirname(i) for i in gaimon.__path__})
	filtered = [i for i in sys.path if i not in sitePackages]
	filtered.append(path)
	sys.path = filtered
	