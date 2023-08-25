import time, psutil


class MonitorData:
	process: psutil.Process
	monitorTime: float
	memory: float = 0.0
	virtualMemory: float = 0.0
	sharedMemory: float = 0.0
	lastUserCPU: float = 0.0
	lastSystemCPU: float = 0.0
	userCPU: float = 0.0
	systemCPU: float = 0.0
	percentCPU: float = 0.0
	lastIORead: int = 0
	lastIOWrite: int = 0
	ioRead: float = 0
	ioWrite: float = 0

	def __init__(self):
		self.process = None
		self.monitorTime = time.time()

	def getData(self):
		if self.process is None:
			self.process = psutil.Process()
		now = time.time()
		delta = now - self.monitorTime

		memory = self.process.memory_info()
		self.memory = memory.rss
		self.virtualMemory = memory.vms
		self.sharedMemory = memory.shared

		cpu = self.process.cpu_times()
		self.userCPU = (cpu.user - self.lastUserCPU) / delta
		self.systemCPU = (cpu.system - self.lastSystemCPU) / delta
		self.lastUserCPU = cpu.user
		self.lastSystemCPU = cpu.system

		io = self.process.io_counters()
		read = io.read_bytes + io.read_chars
		write = io.write_bytes + io.write_chars
		self.ioRead = (read - self.lastIORead) / delta
		self.ioWrite = (write - self.lastIOWrite) / delta
		self.lastIORead = read
		self.lastIOWrite = write
		self.percentCPU = self.process.cpu_percent()

		self.monitorTime = now

	def toDict(self) -> dict:
		return {
			'monitorTime': self.monitorTime,
			'memory': self.memory,
			'virtualMemory': self.virtualMemory,
			'sharedMemory': self.sharedMemory,
			'lastUserCPU': self.lastUserCPU,
			'lastSystemCPU': self.lastSystemCPU,
			'userCPU': self.userCPU,
			'systemCPU': self.systemCPU,
			'percentCPU': self.percentCPU,
			'lastIORead': self.lastIORead,
			'lastIOWrite': self.lastIOWrite,
			'ioRead': self.ioRead,
			'ioWrite': self.ioWrite,
		}

	def fromDict(self, raw: dict):
		self.monitorTime = raw['monitorTime']
		self.memory = raw['memory']
		self.virtualMemory = raw['virtualMemory']
		self.sharedMemory = raw['sharedMemory']
		self.lastUserCPU = raw['lastUserCPU']
		self.lastSystemCPU = raw['lastSystemCPU']
		self.userCPU = raw['userCPU']
		self.systemCPU = raw['systemCPU']
		self.percentCPU = raw['percentCPU']
		self.lastIORead = raw['lastIORead']
		self.lastIOWrite = raw['lastIOWrite']
		self.ioRead = raw['ioRead']
		self.ioWrite = raw['ioWrite']
		return self
