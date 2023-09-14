import os

__ALLOWED_OPERATION__ = {'start', 'stop', 'restart', 'kill'}


class ServiceStarter:
	def __init__(self, config:dict, namespace:str):
		self.config = config
		self.namespace = namespace

	def operate(self, operation: str):
		if operation in __ALLOWED_OPERATION__:
			self.manageService(operation)
		else:
			print(f"*** Error : Operation {operation} is not defined.")

	def manageService(self, operation):
		if self.namespace is None or len(self.namespace) == 0:
			namespaceOption = ''
		else :
			namespaceOption = f' -n {self.namespace}'
		for service in self.config['service']:
			name = service['name']
			serviceCommand = service['command']
			command = f"tmux has-session -t {name}"
			print(f">>> Checking tmux session {name}")
			print(command)
			result = os.system(command)
			if result > 0:
				command = f"tmux new-session -d -s {name}"
				print(f">>> Starting tmux session for {name}")
				print(command)
				os.system(command)
			command = f'tmux send-keys -t {name} "{serviceCommand} {operation} {namespaceOption}" C-m'
			print(f">>> Send Start command to tmux.")
			print(command)
			os.system(command)
