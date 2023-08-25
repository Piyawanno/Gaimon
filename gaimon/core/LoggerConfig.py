from typing import Dict, Any

LOGGING_CONFIG: Dict[str,
						Any] = {
							'version': 1,
							'disable_existing_loggers': True,
							'loggers': {
								"sanic.root": {
									"level": "INFO",
									"handlers": ["gaimon"]
								},
								"sanic.error": {
									"level": "INFO",
									"handlers": ["gaimon_error"],
									"propagate": False,
									"qualname": "sanic.error",
								},
								"sanic.access": {
									"level": "INFO",
									"handlers": ["gaimon_access"],
									"propagate": False,
									"qualname": "sanic.access",
								},
							},
							'handlers': {
								"gaimon": {
									"class": "gaimon.core.LogHandler.LogHandler",
									"formatter": "generic",
								},
								"gaimon_error": {
									"class": "gaimon.core.LogHandler.LogHandler",
									"formatter": "generic",
								},
								"gaimon_access": {
									"class": "gaimon.core.LogHandler.LogHandler",
									"formatter": "access",
								},
							},
							'formatters': {
								"generic": {
									"format":
									"%(asctime)s [%(process)d] [%(levelname)s] %(message)s",
									"datefmt": "[%Y-%m-%d %H:%M:%S %z]",
									"class": "logging.Formatter",
								},
								"access": {
									"format":
									"%(asctime)s - (%(name)s)[%(levelname)s][%(host)s]: " +
									"%(request)s %(message)s %(status)d %(byte)d",
									"datefmt":
									"[%Y-%m-%d %H:%M:%S %z]",
									"class":
									"logging.Formatter",
								},
							},
						}
