
const GaimonSocketBenchmark = function(register){
	let object = this;
	this.register = register;

	this.connect = function(){
		object.register.appendRegister('/benchmark', null, function(result){
		});
	}
}

const GaimonSocketRegister = function(main){
	let object = this;
	
	this.main = main;
	this.registerCallback = {};
	this.errorCallback = {};
	this.pushCallback = {};
	this.registerParameter = {};
	this.isBenchmark = false;
	this.isRequestTest = false;
	this.isSwitchConnect = false;
	this.monitorTime = 5_000;
	this.maxWaitTime = 30_000;
	this.reconnectInterval = 120_000;

	this.connect = async function(){
		let config = {
			'onOpen' : object.register,
			'onError' : object.handleError
		}
		if(object.isSwitchConnect){
			config['reconnectInterval'] = object.reconnectInterval;
		}
		object.socket = new GaimonSocket(
			"socket/register",
			object.handleRegister,
			object.handlePush,
			config
		);
		if(object.isBenchmark){
			let benchmark = new GaimonSocketBenchmark(this);
			benchmark.connect();
		}
		await object.socket.connect();
		if(object.isBenchmark){
			setInterval(function(){
				object.socket.socket.send(JSON.stringify({
					"mode" : GaimonSocketMode.PARAMETER,
					"route" : "/benchmark",
					"parameter" : "Nothing"
				}))
			}, 5_000);
		}
		if(object.isRequestTest){
			let response = await object.socket.request('/customer/all', 'POST', {'limit' : 20, 'pageNumber' : 1})
			console.log(response);
		}
	}

	this.appendRegister = function(
			route,
			parameter,
			registerCallback,
			pushCallback,
			errorCallback
		){
		object.registerParameter[route] = parameter;
		object.registerCallback[route] = registerCallback;
		object.errorCallback[route] = errorCallback;
		object.pushCallback[route] = pushCallback;
	}

	this.register = function(){
		let parameter = {
			'mode' : GaimonSocketMode.REGISTER,
			'parameter' : object.registerParameter
		}
		object.socket.socket.send(JSON.stringify(parameter));
		object.lastReceive = Date.now();
		if(object.isSwitchConnect){
			object.monitorID = setInterval(object.checkLastReceive, object.monitorTime);
		}
	}

	this.handleError = function(){
		for(route in object.errorCallback){
			let callback = object.errorCallback[route];
			if(callback) callback();
		}
	}

	this.checkLastReceive = function(){
		let now = Date.now();
		if(now - object.lastReceive > object.maxWaitTime){
			if(object.socket.isConnected){
				console.log("Temporarily close");
				object.socket.socket.close();
				clearInterval(object.monitorID);
			}
		}
	}

	this.handleRegister = function(response){
		for(route in response){
			let callback = object.registerCallback[route];
			if(callback) callback(response['route']);
		}
	}

	this.handlePush = function(response){
		object.lastReceive = Date.now();
		if(response.isSuccess){
			let route = response.route;
			if(route in object.registerCallback){
				if('result' in response){
					let callback = object.pushCallback[route];
					if(callback) callback(response.result);
				}
			}
		}else{
			console.log(`Received error @${parsed.route} : ${parsed.message}`);
		}
	}
}