from gaimon.GaimonApplication import GaimonApplication, readGaimonConfig

__config__ = readGaimonConfig('')
__gaimon__ = GaimonApplication(__config__, '')
__gaimon__.prepare()
application = __gaimon__.application
application.register_listener(__gaimon__.sanicHandler["prepare"], "before_server_start")
