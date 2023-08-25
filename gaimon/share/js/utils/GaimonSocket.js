/// NOTE : config key
/// - reconnectInterval
/// - maxError
/// - isAutoReconnect
/// - onOpen
/// - onError
/// - onClose

const GaimonSocketMode = {
	REGISTER : 1,
	PARAMETER : 2,
	PUSH : 3,
	REQUEST : 4
};

let RESOLVE_ID = 0;

const GaimonSocket = function(route, onRegister, onPush, config){
	let object = this;
	
	let nullOpenHandler = (error) => {
		console.log(`>>> WebSocket Open : ${route}.`);
	};

	let nullErrorHandler = (error) => {
		console.log(error);
		console.log(`*** WebSocket Error : ${route}.`);
	};

	let nullCloseHandler = (event) => {
		object.isConnected = false;
		WEBSOCKET.isConnected = false;
		console.log(`>>> WebSocket Close : ${route}.`);
	};

	this.route = route;
	this.onPush = onPush;
	this.onRegister = onRegister;
	this.requestResolveMap = {};
	this.requestRejectMap = {};
	this.requestCallbackMap = {};
	this.hasToken = false;

	if(config == undefined){
		this.reconnectInterval = 15_000;
		this.maxError = 40;
		this.isAutoReconnect = true;
		this.onOpen = nullOpenHandler;
		this.onError = nullErrorHandler;
		this.onClose = nullCloseHandler;
	}else{
		this.reconnectInterval = ('reconnectInterval' in config) ? config.reconnectInterval : 15_000;
		this.maxError = ('maxError' in config) ? config.maxError : 40;
		this.isAutoReconnect = ('isAutoReconnect' in config) ? config.isAutoReconnect : true;
		this.onOpen = ('onOpen' in config) ? config.onOpen : nullOpenHandler;
		this.onError = ('onError' in config) ? config.onError : nullErrorHandler;
		this.onClose = ('onClose' in config) ? config.onClose : nullCloseHandler;
	}

	this.errorCount = 0;
	this.isConnected = false;
	this.isClose = false;

	this.connect = async function(){
		await object.createConnection();
		if(object.isAutoReconnect){
			object.monitorID = setInterval(object.monitorConnection, object.reconnectInterval);
		}
		if(object.onConnect != undefined){
			object.onConnect();
		}
	}

	this.close = function(){
		object.isClose = true;
	}

	this.createConnection = async function(){
		let tokenKey = window.localStorage.getItem('token');
		let url = `${websocketURL}${object.route}?token=${tokenKey}`;
		if(tokenKey) object.hasToken = true;
		object.socket = new WebSocket(url);

		object.socket.onmessage = function(event){
			let response = JSON.parse(event.data);
			if(response.mode == GaimonSocketMode.REGISTER){
				object.onRegister(response.result);
			}else if(response.mode == GaimonSocketMode.PARAMETER){
				console.log("Parameter result", response.result);
			}else if(response.mode == GaimonSocketMode.PUSH){
				object.onPush(response);
			}else if(response.mode == GaimonSocketMode.REQUEST){
				let resolveID = response.resolveID;
				if(response.isSuccess){
					if(resolveID in object.requestResolveMap){
						let resolve = object.requestResolveMap[resolveID];
						resolve(response.result);
						delete object.requestResolveMap[resolveID];
					}
					if(resolveID in object.requestCallbackMap){
						let callback = object.requestCallbackMap[resolveID];
						if(callback) callback(null, response.result, response.route, resolveID);
						delete object.requestCallbackMap[resolveID];
					}
					if(resolveID in object.requestRejectMap){
						delete object.requestRejectMap[resolveID];
					}
				}else{
					let isCallback = false;
					if(resolveID in object.requestCallbackMap){
						let callback = object.requestCallbackMap[resolveID];
						if(callback){
							callback(response.message, null, response.route, resolveID);
							isCallback = true;
						}
						delete object.requestCallbackMap[resolveID];
					}
					if(resolveID in object.requestRejectMap){
						if(!isCallback){
							reject = object.requestRejectMap[resolveID];
							reject(response.message);
						}
						delete object.requestRejectMap[resolveID];
					}
					if(resolveID in object.requestResolveMap){
						delete object.requestResolveMap[resolveID];
					}
				}
			}
		}

		object.socket.onclose = function(event){
			object.isConnected = false;
			WEBSOCKET.isConnected = false;
			console.log(">>> WebSocket is closed.");
			object.requestResolveMap = {};
			object.requestRejectMap = {};
		}
		return new Promise(function(resolve, reject){
			object.socket.onopen = function(){
				console.log(">>> WebSocket is opened.");
				object.onOpen();
				object.errorCount = 0;
				object.isConnected = true;
				resolve(null);
			};
	
			object.socket.onerror = function(error){
				object.requestResolveMap = {};
				object.requestRejectMap = {};
				object.errorCount += 1;
				console.log(object.errorCount, object.maxError);
				if(object.errorCount >= object.maxError){
					object.onError();
					object.isClose = true;
				}else{
					console.log(error);
					console.log("*** Error reconnect for socket");
				}
				reject(error);
			}
		});
	}

	this.request = async function(route, method, data, callback){
		if(object.isConnected){
			let resolveID = RESOLVE_ID;
			let parameter = {
				'mode' : GaimonSocketMode.REQUEST,
				'method' : method,
				'route' : route,
				'parameter' : data,
				'resolveID' : resolveID
			};
			RESOLVE_ID++;
			object.socket.send(JSON.stringify(parameter));

			return new Promise(function(resolve, reject){
				object.requestResolveMap[resolveID] = resolve;
				object.requestCallbackMap[resolveID] = callback;
				object.requestRejectMap[resolveID] = reject;
			});
		}else{
			return new Promise(function(resolve, reject){
				reject(">>> WebSocket is not connected.");
			});
		}
	}

	this.monitorConnection = function(){
		if(object.isClose){
			clearInterval(object.monitorID);
			return;
		}
		if(!object.isConnected){
			object.createConnection();
		}
	}
}