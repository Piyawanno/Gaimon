async function onNativeMessage(key, data) {
	if(window.CALLBACK[key]) {
		window.CALLBACK[key](data);
		delete window.CALLBACK[key];
	};
};

async function getMustacheTemplate(branch) {
	if(window.CALLBACK == undefined) window.CALLBACK = {};
	return new Promise(function(resolve, reject) {
		const key = randomString(10);
		window.CALLBACK[key] = async function(result) {
			const json = JSON.parse(result);
			const decoded = await parseFromNative(json);
			window.ALL_TEMPLATE = decoded;
			resolve(window.ALL_TEMPLATE[branch])
		};
		try {
			const dict = {key, branch};
			webkit.messageHandlers.getMustacheTemplate.postMessage(JSON.stringify(dict));
		} catch(error) {
			reject(error);
		}
	});
};

async function GET_TEMPLATE(name, isExtension) {
	return eval(`ALL_TEMPLATE.${name}`);
};

async function OPEN_FILE(blob, fileName) {
	if(window.CALLBACK == undefined) window.CALLBACK = {};
	async function blobToBase64(blob) {
		return new Promise(function(resolve, reject) {
			const reader = new FileReader();
			reader.onloadend = function() {
				const result = reader.result.replace(`data:${blob.type};base64,`, '')
				resolve(result);
			}
			reader.onerror = reject;
			reader.readAsDataURL(blob);
		});
	}
	return new Promise(async function(resolve, reject) {
		try {
			const content = await blobToBase64(blob);
			const dict = {content, fileName};
			webkit.messageHandlers.download.postMessage(JSON.stringify(dict));
			resolve();
		} catch(error) {
			reject(error);
		}
	});
}

async function START_APP() {
	
};

async function REDIRECT(url) {
	if(window.CALLBACK == undefined) window.CALLBACK = {};
	return new Promise(function(resolve, reject) {
		try {
			webkit.messageHandlers.redirect.postMessage(JSON.stringify({url}));
			resolve();
		} catch(error) {
			reject(error);
		}
	});
}

async function GET_PICTURE_FROM_CAMERA() {
	
}

async function convertToOfflineMessage(data) {
	let dataType = 'json';
	let jsonData = {};
	if (data instanceof FormData) {
		dataType = 'form';
		for (let key of data.keys()) {
			let item = data.get(key);
			if (item instanceof File) {
				let filename = item.name;
				let result = await item.arrayBuffer();
				if (item.name == "Signature.png") {
					let splited = item.name.split('.');
					let extension = splited[splited.length -1]
					let name = item.name.replace(`.${extension}`, '')
					filename = `${name}_${Date.now()}.${extension}`
				}
				saveOfflineFile(filename, item.type, result);
				let fileContent = {'name': filename, 'type': item.type, 'lastModified': item.lastModified, 'content': ''};
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
	if(window.RESEND_LOOP_ITEM == undefined) window.RESEND_LOOP_ITEM = [];
	if(raw != undefined) window.RESEND_LOOP_ITEM.push(raw);
	if(window.RESEND_LOOP == undefined){
		window.RESEND_LOOP = setInterval(async function() {
			const items = await readOfflineStorage();
			while(items.length > 0) {
				const item = items.shift();
				if(item.type == 'json') {
					await POST(item.url, item.data, undefined, undefined, true, true, item.token);
				} else if(item.type == 'form') {
					const form = new FormData();
					for(let key in item.data) {
						const data = item.data[key];
						if(data.type == 'string') form.append(key, data.data);
						else if(data.type == 'file') {
							const fileContent = data.data;
							const content = await readOfflineFile(fileContent.name, fileContent.type);
							console.log(`length: ${content.length}`)
							const file = new File([arrayBufferFromBase64(content)], fileContent.name, {type:fileContent.type, lastModified: fileContent.lastModified});
							form.append(key, file);
						}
					}
					await POST(item.url, form, undefined, undefined, true, true, item.token);
				}
			}
			while(window.RESEND_LOOP_ITEM.length > 0) {
				items.push(window.RESEND_LOOP_ITEM.shift());
			}
			window.OFFLINE_ITEMS = JSON.parse(JSON.stringify(items));
			writeOfflineStorage(window.OFFLINE_ITEMS);
		}, 10000);
	}
}

async function saveOfflineFile(name, type, content) {
	if(window.CALLBACK == undefined) window.CALLBACK = {};
	async function saveFile(name, mimeType, content, isFirst, isLast) {
		const key = randomString(10);
		return new Promise(function(resolve, reject) {
			window.CALLBACK[key] = function(result) {
				resolve(result);
			};
			try {
				const dict = {key, name, mimeType, content, isFirst, isLast};
				webkit.messageHandlers.saveOfflineFile.postMessage(JSON.stringify(dict));
			} catch(error) {
				reject(error);
			}
		});
	}
	const maxSize = 50000;
	const encoded = arrayBufferToBase64(content);
	const length = parseInt(Math.ceil(encoded.length/maxSize));
	let result = false;
	for(let i=0; i<length; i++) {
		const startIndex = i*maxSize;
		let endIndex = startIndex + maxSize;
		if(endIndex > encoded.length) endIndex = encoded.length;
		const chunk = encoded.substring(startIndex, endIndex);
		result = await saveFile(name, type, chunk, i==0, i==length-1);
	}
	return result;
}

async function writeOfflineStorage(content) {
	if(window.CALLBACK == undefined) window.CALLBACK = {};
	return new Promise(async function(resolve, reject) {
		const key = randomString(10);
		window.CALLBACK[key] = function(result) {
			resolve(result);
		};
		try {
			const encoded = await encodeHex(JSON.stringify(content));
			const dict = {key, content:encoded};
			webkit.messageHandlers.writeOfflineStorage.postMessage(JSON.stringify(dict));
		} catch(error) {
			reject(error);
		}
	});
}

async function readOfflineStorage() {
	if(window.CALLBACK == undefined) window.CALLBACK = {};
	return new Promise(function(resolve, reject) {
		const key = randomString(10);
		window.CALLBACK[key] = async function(result) {
			const decoded = await decodeHex(result);
			const json = JSON.parse(decoded);
			resolve(json);
		};
		try {
			webkit.messageHandlers.readOfflineStorage.postMessage(JSON.stringify({key}));
		} catch(error) {
			reject(error);
		}
	});
}

function readOfflineFile(name, mimeType) {
	if(window.CALLBACK == undefined) window.CALLBACK = {};
	return new Promise(function(resolve, reject) {
		const key = randomString(10);
		window.CALLBACK[key] = async function(result) {
			resolve(result);
		};
		try {
			const dict = {key, name, mimeType};
			webkit.messageHandlers.readOfflineFile.postMessage(JSON.stringify(dict));
		} catch(error) {
			reject(error);
		}
	});
}

async function encodeHex(value) {
	let result = "";
	const encoder = new TextEncoder("utf-8");
	const array = encoder.encode(value)
	for(let i=0; i < array.length; i++) {
		result += array[i].toString(16);
	}
	return result;
};

async function decodeHex(value) {
	const decoder = new TextDecoder("utf-8");
	const code = [];
	for(let n=0; n<value.length; n+=2) {
		const tmp = value.substring(n, n + 2);
		code.push(parseInt(tmp, 16));
	}
	return decoder.decode(new Uint8Array(code));
};

async function parseFromNative(json) {
	const result = {};
	for(let key in json) {
		const value = json[key];
		if(typeof value == 'string') result[key] = await decodeHex(value);
		if(typeof value == 'number') result[key] = value;
		if(typeof value == 'object') result[key] = await parseFromNative(value);
	}
	return result;
};