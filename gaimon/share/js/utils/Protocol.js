var WEBSOCKET = {
	'isConnected' : false,
	'socket' : null
}

async function READ_REQUEST_FROM_CACHE(url, type) {
	let cache = await caches.open("gaimon");
	return await cache.match(url);
}

async function WRITE_REQUEST_TO_CACHE(url, response) {
	let cache = await caches.open("gaimon");
	await cache.put(url, response.clone());
}

async function GET(url, callback, type, isSkip, useOffline) {
	if (type == undefined) type = 'json';
	if (isSkip == undefined) isSkip = false;
	if (useOffline == undefined) useOffline = false;
	if(type == 'json' && !useOffline){
		if(typeof isPreload != 'undefined' && isPreload && preloader != null && preloader.isConnected && preloader.socket.hasToken){
			return preloader.getSocket().request("/"+url, "GET", null);
		}else if(WEBSOCKET.isConnected && WEBSOCKET.socket != null){
			return WEBSOCKET.socket.request("/"+url, "GET", null);
		}
	}
	let header = '';
	if (type == 'json') header = 'application/json;charset=UTF-8';
	let headers = {'Content-Type': header}
	if (GLOBAL.AUTHEN != undefined && GLOBAL.AUTHEN.isLoggedIn) {
		headers['Authorization'] = 'Bearer ' + window.localStorage.getItem('token');
	}
	const controller = new AbortController();
	const id = setTimeout(() => controller.abort(), 10000);
	let response = await fetch(`${rootURL}${url}`, {
		credentials: 'include',
		method: 'GET',
		headers: headers,
		signal: controller.signal  
	}).catch(async (error) => {
		if (isSkip) {
			callback();
			return;
		}
		console.error(error);
	})
	clearTimeout(id);
	if (response) {
		let result = response;
		if (type == 'json') result = await response.json();
		if (type == 'blob') result = await response.blob();
		if (callback) callback(result);
		return result;
	}
}

async function CHECK_OFFLINE_LOOP() {
	if (window.CHECK_OFFLINE_LOOP_INSTANCE) return;
	async function checkOnlineStatus() {
		try {
			let response = await fetch(`${rootURL}check/server/connected`, {cache: "no-store"});
			if (response.status >= 200 && response.status < 300) {
				window.IS_OFFLINE = false;
			}
		} catch (err) {
			window.IS_OFFLINE = true;
		}
	}
	await checkOnlineStatus();
	window.CHECK_OFFLINE_LOOP_INSTANCE = setInterval(async () => {
		await checkOnlineStatus();
	}, 30000);
}

async function POST(url, data, callback, type, isSkip, useOffline, token) {
	let isFormData = (data instanceof FormData);
	if (type == undefined) type = 'json';
	if (isSkip == undefined) isSkip = false;
	if (useOffline == undefined) useOffline = false;
	if(type == 'json' && !useOffline && !isFormData){
		if(isPreload && preloader != null && preloader.isConnected && preloader.socket.hasToken){
			return preloader.getSocket().request("/"+url, "POST", data);
		}else if(WEBSOCKET.isConnected && WEBSOCKET.socket != null){
			return WEBSOCKET.socket.request("/"+url, "POST", data);
		}
	}
	return new Promise(function(resolve, reject) {
		const xhr = new XMLHttpRequest();
		xhr.addEventListener("loadend", function(event) {
			window.IS_OFFLINE = false;
			window.OFFLINE_TIME = Date.now();
			if (this.status == 200) {
				if (type == 'json') {
					resolve(this.response);
					if (callback != undefined) callback(this.response);
				} else  {
					resolve(this.response);
					if (callback != undefined) callback(this.response);
				}
			} else {
				if (isSkip) resolve();
				reject(this.statusText);
				console.error(this.statusText);
			}
			
		});
		xhr.addEventListener("error", async function(event) {
			if (this.status == 0) { 
				window.IS_OFFLINE = true;
				window.OFFLINE_TIME = Date.now();
			}
			if (useOffline) {
				let {jsonData, dataType} = await convertToOfflineMessage(data);
				sendToResendLoop({'url': url, 'data': jsonData, 'token': window.localStorage.getItem('token'), 'type': dataType})
			}
			if (isSkip) resolve();
			reject(this.statusText);
			console.warn(this.statusText);
		});
		xhr.open("POST", rootURL + url);
		xhr.withCredentials = true;
		if (GLOBAL.AUTHEN != undefined) {
			if (GLOBAL.AUTHEN.isLoggedIn) {
				let tokenKey = window.localStorage.getItem('token');
				if (token != undefined) tokenKey = token;
				xhr.setRequestHeader('Authorization', 'Bearer ' + tokenKey);
			}
		}
		if(isFormData) {
			xhr.responseType = type;
			xhr.send(data);
		} else if(type == 'json') {
			xhr.responseType = type;
			xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
			xhr.send(JSON.stringify(data));
		} else if(type == 'blob') {
			xhr.responseType = 'blob';
			xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
			xhr.send(JSON.stringify(data));
		} else {
			xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded charset=UTF-8');
			xhr.send('data='+data['data']);
		}
	});
}

async function convertToOfflineMessage(data) {
	let dataType = 'json';
	let jsonData = {};
	if (data instanceof FormData) {
		dataType = 'form';
		for (let key of data.keys()) {
			let item = data.get(key);
			if (item instanceof File) {
				let result = await item.arrayBuffer();
				let content = arrayBufferToBase64(result)
				if (item.name == "Signature.png") {
					let splited = item.name.split('.');
					let extension = splited[splited.length -1]
					let name = item.name.replace(`.${extension}`, '')
					filename = `${name}_${Date.now()}.${extension}`
				}

				let fileContent = {'name': item.name, 'type': item.type, 'lastModified': item.lastModified, 'content': content};
				jsonData[key] = {'type': 'file', 'data': fileContent};
			} else {
				jsonData[key] = {'type': 'string', 'data': item};
			}
		}
	} else {
		jsonData = data;
	}
	return {jsonData, dataType};
}

async function sendToResendLoop(raw) {
	if (window.RESEND_LOOP_ITEM == undefined) window.RESEND_LOOP_ITEM = [];
	if (raw != undefined) window.RESEND_LOOP_ITEM.push(raw);
	if (window.RESEND_LOOP == undefined){
		window.RESEND_LOOP = setInterval(async function() {
			let items = await getOfflineRequestList();
			while (items.length > 0) {
				let item = items.shift();
				if (item.type == 'json') {
					await POST(item.url, item.data, undefined, undefined, true, true, item.token);
				} else if (item.type == 'form') {
					let form = new FormData();
					for (let key in item.data) {
						let data = item.data[key];
						if (data.type == 'string') form.append(key, data.data);
						else if (data.type == 'file') {
							let fileContent = data.data;
							let file = new File([arrayBufferFromBase64(fileContent.content)], fileContent.name, {type:fileContent.type, lastModified: fileContent.lastModified});
							form.append(key, file);
						}
					}
					await POST(item.url, form, undefined, undefined, true, true, item.token);
				}
			}
			while (window.RESEND_LOOP_ITEM.length > 0) {
				items.push(window.RESEND_LOOP_ITEM.shift());
			}
			await setOfflineRequestList(items)
		}, 10000);
	}
}

async function getOfflineRequestList() {
	if (GLOBAL.DB != undefined) {
		return await GLOBAL.DB.selectAll("OfflineRequest");
	} else {
		let items = localStorage.getItem("POST");
		if (items == undefined) items = [];
		else items = JSON.parse(items);
		return items;
	}
	
}

async function setOfflineRequestList(records) {
	if (GLOBAL.DB != undefined) {
		await GLOBAL.DB.clear("OfflineRequest");
		await GLOBAL.DB.insertMultiple("OfflineRequest", records);
	} else {
		localStorage.setItem('POST', JSON.stringify(records));
	}
}

async function UPLOAD_MULTI_PART(url, file) {
	let formData = new FormData();
	formData.append('data', JSON.stringify({isCreate: true, name: file.name, size: file.size}));
	let response = await POST(url, formData);
	if (!response.isSuccess) return '';
	let result = response.result;
	let name = ''
	while (true) {
		let content = file.slice(result['offset'], result['offset'] + result['limit']);
		let chunk = new File([content], file.name);
		let formData = new FormData();
		formData.append('data', JSON.stringify({isCreate: false, key: result.key, offset: result['offset']}));
		formData.append('file', chunk);
		let response = await POST(url, formData);
		result = response.result;
		if (!result.hasNext) {
			name = result.name;
			break;
		}
	}
	return name;
}