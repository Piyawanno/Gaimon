/// NOTE
/// Preloader is a concept for loading JS/CSS file with WebSocket
/// to enhance loading performance. WebSocket, however, takes relative
/// long time to create a connection, especially for the case of
/// domain/host name resolving. In summary, this concept
/// can be outperformed by conventional JS/CSS load for
/// small among of JS/CSS files e.g. using compression from Gaimon
/// depending on network configuration.

const Preloader = function(){
	let object = this;
	
	this.isConnected = false;
	this.socketList = [];
	this.socketNumber = 1;
	this.currentIndex = 0;

	this.preload = async function(preloadJS, preloadCSS){
		let elapsed = Date.now() - start;
		console.log(">>> Preload start", elapsed);
		try{
			await object.connect(preloadJS.length + preloadCSS.length);
			object.isConnected = true;
			return new Promise(function(resolve, reject){
				let finish = 0;
				let countFinish = function(){
					finish += 1;
					if(finish >= 2){
						let elapsed = Date.now() - start;
						console.log(">>> Elapsed", elapsed);
						resolve();
					}
				}
				object.loadJS(preloadJS, countFinish);
				object.loadCSS(preloadCSS, countFinish);
			});
		}catch(error){
			await object.loadDirectJS(preloadJS);
			await object.loadDirectCSS(preloadCSS);
		}
	}

	this.connect = async function(n){
		let j = 0;
		let connected = 0;
		let resolver = null;
		let countConnect = function(){
			connected++;
			if(connected >= object.socketNumber){
				let elapsed = Date.now() - start;
				console.log(">>> Preload connected", elapsed);
				resolver();
			}
		}
		for(let i=0;i<object.socketNumber;i++){
			let socket = new GaimonSocket(
				"socket/preload",
				object.handleRegister,
				object.handlePush,
				{'isAutoReconnect' : false}
			);
			socket.resolveID = j;
			j += n;
			socket.connect().then(countConnect);
			object.socketList.push(socket);
		}
		object.socket = object.socketList[0];

		return new Promise(function(resolve, reject){
			resolver = resolve;
		});
	}

	this.close = async function(){
		for(let socket of object.socketList){
			await socket.socket.close();
		}
	}

	this.loadJS = function(preloadJSList, resolve){
		if(preloadJSList.length == 0){
			resolve();
			return;
		}
		let loaded = [];
		let total = preloadJSList.length;
		let responded = 0;
		let appendJS = function(error, result, route, resolveID){
			responded += 1;
			if(error){
				console.log(error, route);
			}else{
				loaded.push([result, resolveID]);
			}
			if(responded >= total){
				let elapsed = Date.now() - start;
				console.log(`>>> JS fetched in ${elapsed}ms`);
				loaded.sort(function(x, y){
					if(x[1] > y[1]) return 1;
					else if(x[1] < y[1]) return -1;
					else return 0;
				});
				let content = [];
				for(let i of loaded){
					content.push(i[0]);
				}
				let joined = content.join("\n");
				let preloadJS = document.getElementById("preloadJS");
				let inlineJS = document.createTextNode(joined);
				preloadJS.appendChild(inlineJS);
				console.log(`>>> JS appended in ${elapsed}ms`);
				resolve();
			}
		}
		for(let url of preloadJSList){
			let socket = object.getSocket();
			try{
				socket.request("/"+url, "GET", null, appendJS);
			}catch(error){
				console.log(error);
			}
		}
	}

	this.loadAwaitJS = async function(preloadJSList){
		let loaded = [];
		
		for(let url of preloadJSList){
			if(object.socket.isConnected){
				try{
					let fetched = await object.socket.request("/"+url, "GET", null, object.appendJS);
					loaded.push(fetched);
				}catch(error){
					console.log(route, error);
				}
			}else{
				try{
					await LOAD_JS(url);
					console.log(url);
				}catch(error){
					console.log(error);
				}
			}
		}
		if(loaded.length){
			let joined = loaded.join("\n");
			let preloadJS = document.getElementById("preloadJS");
			let inlineJS = document.createTextNode(joined);
			preloadJS.appendChild(inlineJS);
		}
	}

	this.loadDirectJS = async function(preloadJSList){
		for(let url of preloadJSList){
			try{
				await LOAD_JS(url);
				console.log(url);
			}catch(error){
				console.log(error);
			}
		}
	}

	this.loadCSS = function(preloadCSSList, resolve){
		if(preloadCSSList.length == 0){
			resolve();
			return;
		}
		let loaded = [];
		let total = preloadCSSList.length;
		let responded = 0;
		let appendCSS = function(error, result, route, resolveID){
			responded += 1;
			if(error){
				console.log(route, error);
			}else{
				loaded.push([result, resolveID]);
			}
			if(responded >= total){
				let elapsed = Date.now() - start;
				console.log(`>>> CSS fetched in ${elapsed}ms`);
				loaded.sort(function(x, y){
					if(x[1] > y[1]) return 1;
					else if(x[1] < y[1]) return -1;
					else return 0;
				});
				let content = [];
				for(let i of loaded){
					content.push(i[0]);
				}
				let joined = content.join("\n");
				let preloadCSS = document.getElementById("preloadCSS");
				let inlineCSS = document.createTextNode(joined);
				preloadCSS.appendChild(inlineCSS);
				console.log(`>>> CSS appended in ${elapsed}ms`);
				resolve();
			}
		}
		for(let url of preloadCSSList){
			try{
				let socket = object.getSocket();
				socket.request("/"+url, "GET", null, appendCSS);
			}catch(error){
				console.log(error);
			}
		}
	}

	this.loadAwaitCSS = async function(preloadCSSList){
		let loaded = [];
		for(let url of preloadCSSList){
			if(object.socket.isConnected){
				try{
					let fetched = await object.socket.request("/"+url, "GET", null);
					loaded.push(fetched);
				}catch(error){
					console.log(error);
				}
			}else{
				try{
					await LOAD_CSS(url);
					console.log(url);
				}catch(error){
					console.log(error);
				}
			}
		}
		if(loaded.length){
			let joined = loaded.join("\n");
			let preloadCSS = document.getElementById("preloadCSS");
			let inlineCSS = document.createTextNode(joined);
			preloadCSS.appendChild(inlineCSS);
		}
	}

	this.loadDirectCSS = async function(preloadCSSList){
		for(let url of preloadCSSList){
			try{
				await LOAD_CSS(url);
			}catch(error){
				console.log(error);
			}
		}
	}

	this.getSocket = function(){
		let socket = object.socketList[object.currentIndex%object.socketNumber];
		object.currentIndex++;
		return socket;
	}

	this.handleRegister = function(response){
	}

	this.handlePush = function(response){
	}
}