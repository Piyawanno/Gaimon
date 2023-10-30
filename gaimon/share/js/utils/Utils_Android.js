alert = function(message) {
	let key = randomString(10);
	Android.postMessage(JSON.stringify({
		method: 'ALERT',
		key: key,
		message: message
	}));
}

async function onAndroidMessage(key, data) {
	if (window.CALLBACK == undefined) window.CALLBACK = {}
	if (window.CALLBACK[key] == undefined) return;
	CALLBACK[key](data);
	delete CALLBACK[key];
}

async function getMustacheTemplate(branch, callback) {
	if (window.CALLBACK == undefined) window.CALLBACK = {}
	let key = randomString(10);
	return new Promise(function(resolve, reject) {
		CALLBACK[key] = function(result) {
			window.ALL_TEMPLATE = result;
			resolve(window.ALL_TEMPLATE[branch])
		};
		Android.postMessage(JSON.stringify({
			method: 'MUSTACHE',
			key: key
		}));
	});
}

async function GET_TEMPLATE(name, isExtension) {
	return eval(`ALL_TEMPLATE.${name}`);
}

async function OPEN_FILE(blob, fileName) {
	async function blobToBase64(blob) {
		return new Promise((resolve, _) => {
		  const reader = new FileReader();
		  reader.onloadend = () => {
			let result = reader.result.replace(`data:${blob.type};base64,`, '')
			resolve(result);
		  }
		  reader.readAsDataURL(blob);
		});
	}
	let key = randomString(10);
	let base64 = await blobToBase64(blob);
	let temp = fileName.split(".");
	let type = temp.pop();
	let name = temp.join('')
	return new Promise(function(resolve, reject) {
		Android.postMessage(JSON.stringify({
			method: 'DOWNLOAD',
			content: base64,
			fileName: fileName,
			name: name,
			type: type,
			key: key
		}));
	});
}

async function START_APP() {
	let key = randomString(10);
	Android.postMessage(JSON.stringify({
		method: 'START',
		key: key
	}));
}

async function REDIRECT(url) {
	if (window.CALLBACK == undefined) window.CALLBACK = {}
	let key = randomString(10);
	return new Promise(function(resolve, reject) {
		CALLBACK[key] = function(result) {
			resolve(result)
		};
		Android.postMessage(JSON.stringify({
			method: 'REDIRECT',
			key: key,
			url: url,
		}));
	});
}

async function GET_PICTURE_FROM_CAMERA() {
	if (window.CALLBACK == undefined) window.CALLBACK = {}
	let key = randomString(10);
	let filename = parseInt(Date.now())+'';
	return new Promise(function(resolve, reject) {
		CALLBACK[key] = function() {
			let result = Android.getCurrentCaptureImage();
			let blob = new Blob([arrayBufferFromBase64(result)], {type: 'image/jpeg'});
			resolve(blob)
		};
		Android.postMessage(JSON.stringify({
			method: 'CAPTURE',
			key: key,
			filename: filename,
		}));
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
				let filename = item.name;
				// let stream = item.stream();
				// let result = await stream.getReader().read();
				// let content = uint8ArrayToBase64(result.value);
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
	if (window.RESEND_LOOP_ITEM == undefined) window.RESEND_LOOP_ITEM = [];
	if (raw != undefined) window.RESEND_LOOP_ITEM.push(raw);
	if (window.RESEND_LOOP == undefined){
		window.RESEND_LOOP = setInterval(async function() {
			let items = Android.readOfflineStorage();
			if (items == undefined) items = [];
			else {
				items = JSON.parse(items);
				console.log(items);
			}
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
							// let content = readOfflineFile(fileContent.name, fileContent.type);
							let content = readOfflineFullFile(fileContent.name, fileContent.type);
							console.log(`length: ${content.length}`)
							let file = new File([arrayBufferFromBase64(content)], fileContent.name, {type:fileContent.type, lastModified: fileContent.lastModified});
							form.append(key, file);
						}
					}
					await POST(item.url, form, undefined, undefined, true, true, item.token);
				}
			}
			while (window.RESEND_LOOP_ITEM.length > 0) {
				items.push(window.RESEND_LOOP_ITEM.shift());
			}
			window.OFFLINE_ITEMS = JSON.parse(JSON.stringify(items));
			Android.writeOfflineStorage();
		}, 10000);
	}
}

function saveOfflineFile(name, type, content) {
	let maxSize = 50000;
	let encoded = arrayBufferToBase64(content);
	console.log(content.byteLength);
	console.log(encoded.length);
	let length = parseInt(Math.ceil(encoded.length / maxSize));
	for (let i=0; i<length; i++) {
		let startIndex = i * maxSize;
		let endIndex = startIndex + maxSize;
		if (endIndex > encoded.length) endIndex = encoded.length;
		let chunk = encoded.substring(startIndex, endIndex)
		console.log(`${startIndex} : ${endIndex}`);
		Android.saveOfflineFile(name, type, chunk, i==0, i==length-1);
	}
	
}

function readOfflineFullFile(name, type) {
	return Android.readOfflineFullFile(name, type);
	
}

function readOfflineFile(name, type, index = 0, content="") {
	let data = JSON.parse(Android.readOfflineFile(name, type, index));
	content += data.content
	if (!data.isLast) {
		return readOfflineFile(name, type, data.index, content)
	} else {
		return content;
	}
	
}

function getOfflineItems() {
	return window.OFFLINE_ITEMS;
}

async function SEND_OPERATION(operation, data) {
	console.log(operation);
	console.log(data);
	if (window.CALLBACK == undefined) window.CALLBACK = {}
	let key = randomString(10);
	return new Promise(function(resolve, reject) {
		CALLBACK[key] = function(result) {
			resolve(result)
		};
		Android.postMessage(JSON.stringify({
			method: operation,
			key: key,
			data: data,
		}));
	});
}

function BACK(){
	history.back();
}