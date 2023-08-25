from logging import LogRecord, NullHandler
from sanic import Request
from sanic.response import HTTPResponse

import time, os, json, traceback, copy

PID = os.getpid()

LOG = {10: {}, 20: {}, 30: {}, 40: {}, }

LOG_INFO = {'count': 0, 'lastFlush': time.time(), 'lastAdd': 0.0, }


class LogHandler(NullHandler):
	def handle(self, record: LogRecord):
		isAccess = getattr(record, 'isAccess', False)
		if isAccess:
			info = self.getAccessInfo(record)
			level = info['level']
			name = info['name']
			logNameMap = LOG.get(level, None)
			if logNameMap is None:
				print(f"*** Warning LogLevel {level} is undefined.")
				return
			try:
				logList = logNameMap.get(name, [])
				if len(logList) == 0: logNameMap[name] = logList
				logList.append(json.dumps(info))
				LOG_INFO['count'] += 1
				LOG_INFO['lastAdd'] = record.created
			except:
				print(traceback.format_exc())
				print(f"*** Error by store log.")
				print(info)
		elif record.name != "sanic.access":
			print(self.format(record))

	def getAccessInfo(self, record: LogRecord):
		requested = None
		responded = None
		accessLog = None
		elapsed = getattr(record, 'elapsed', 0.0)
		queryCount = getattr(record, 'queryCount', 0)
		requestData = getattr(record, 'requestData', None)
		uid = getattr(record, 'uid', -1)
		if hasattr(record, 'request'):
			request: Request = record.request
			requested = {
				'remote': request.headers.get("X-Forwarded-For", None) or request.remote_addr or request.ip,
				'port': request.port,
				'method': request.method,
				'url': request.url,
			}
			accessLog = request.headers.get('accessLog', None)
		if hasattr(record, 'response') and record.response is not None:
			response: HTTPResponse = record.response
			responded = {
				'status': getattr(response, "status", 0),
				'size': len(response.body) if hasattr(response, 'body') else 0,
				'type': getattr(response, 'content_type'),
				'route': record.route,
				'extension': record.extension,
				'entity': record.entity,
			}
		info = {
			'level': record.levelno,
			'time': record.created,
			'message': record.msg,
			'uid': uid,
			'name': record.name,
		}
		if requested is not None: info.update(requested)
		if responded is not None: info.update(responded)
		if accessLog is not None: info['accessLog'] = accessLog
		if requestData is not None: info['requestData'] = requestData
		if hasattr(record, "trace"): info["trace"] = record.trace
		info['elapsed'] = elapsed
		info['queryCount'] = queryCount
		return info
