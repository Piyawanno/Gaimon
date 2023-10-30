
async function getMustacheTemplate(branch, callback) {
	let response = await GET('mustache/get/'+branch, callback, 'json');
	if (callback != undefined) callback(response.results);
	return response.results;
}

async function getMustacheIcon(callback) {
	let response = await GET('mustache/icon/get', callback, 'json');
	if (callback != undefined) callback(response.results);
	return response.results;
}

async function getExtensionMustacheTemplate(extension, branch, callback) {
	let response = await GET(`mustache/extension/get/${extension}/${branch}`, callback, 'json');
	if (callback != undefined) callback(response.results);
	return response.results;
}

async function getAllCountry(callback) {
	let response = await GET('country/all', callback, 'json');
	if (callback != undefined) callback(response);
	return response;
}

async function getLocale(language, oldLanguage, callback) {
	let response = await GET('locale/'+language+'/'+oldLanguage, callback, 'json', true);
	if (response == undefined) response = {results: {}}
	if (callback != undefined) callback(response.results);
	return response.results;
}

async function setTextLocale(text, callback) {
	let response = await GET('locale/set/'+text.encodeHex(), callback, 'json');
	if (callback != undefined) callback(response);
	return response;
}

async function setChunkTextLocale(data, callback) {
	let response = await GET('locale/chunk/set', data, callback, 'json');
	if (callback != undefined) callback(response);
	return response;
}

async function START(page) {
	await main.init();
}

String.prototype.encodeHex = function(){
	let encoder = new TextEncoder();
	let array = encoder.encode(this)
	let result = "";
	for (let i=0; i < array.length; i++) {
		result += array[i].toString(16);
	}
	return result
}

String.prototype.decodeHex = function(){
	let str = '';
	for (let n = 0; n < this.length; n += 2) {
		str += String.fromCharCode(parseInt(this.substr(n, 2), 16));
	}
	return str;
}

// async function sha256(str) {
//     return crypto.subtle.digest("SHA-256", new TextEncoder("utf-8").encode(str)).then(buf => {
//       return Array.prototype.map.call(new Uint8Array(buf), x=>(('00'+x.toString(16)).slice(-2))).join('');
//     });
// }

async function sha1(str) {
	const enc = new TextEncoder();
	const hash = await crypto.subtle.digest('SHA-1', enc.encode(str));
	return Array.from(new Uint8Array(hash))
		.map(v => v.toString(16).padStart(2, '0'))
		.join('');
}

async function sha512(str) {
	let hasher = new Sha512();
	let bytes = new TextEncoder().encode(str);
	hasher.process(bytes);
	hasher.finish();
	let hashedArray = Array.from(new Uint8Array(hasher.result));
	return hashedArray.map(b => b.toString(16).padStart(2, '0')).join('');
	// return crypto.subtle.digest("SHA-512", new TextEncoder("utf-8").encode(str)).then(buf => {
	//   return Array.prototype.map.call(new Uint8Array(buf), x=>(('00'+x.toString(16)).slice(-2))).join('');
	// });
}

function randomString(length) {
	let result = '';
	let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let charactersLength = characters.length;
	for (let i = 0; i < length; i++ ) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
}

async function GET_TEMPLATE(name, isExtension) {
	if (!isExtension) return eval(`TEMPLATE.${name}`);
	if (window.EXTENSION_TEMPLATE == undefined) window.EXTENSION_TEMPLATE = {};
	if (window.EXTENSION_TEMPLATE[name] != undefined) return window.EXTENSION_TEMPLATE[name];
	let response = await GET('mustache/each/get/'+name);
	window.EXTENSION_TEMPLATE[name] = response.results;
	return response.results;
}

async function LOAD_CSS(url, callback) {
	if (window.LOADED_CSS == undefined) window.LOADED_CSS = {};
	if (window.LOADED_CSS[url] != undefined) return;
	return new Promise(function(resolve, reject) {
		let script = document.createElement("link");
		script.onload = function() {
			window.LOADED_CSS[url] = url;
			resolve();
			if (callback != undefined) callback();
		}
		script.setAttribute("rel", "stylesheet");
		script.setAttribute("type", "text/css");
		script.setAttribute("href", `${rootURL}${url}?${Date.now()}`);
		document.getElementsByTagName("head")[0].appendChild(script);
	});
}

async function APPEND_LINK_TO_HEAD(rel, url) {
	if (window.HEAD_LINK == undefined) window.HEAD_LINK = {};
	if (window.HEAD_LINK[url] != undefined) return;
	return new Promise(function(resolve, reject) {
		let script = document.createElement("link");
		script.onload = function() {
			window.HEAD_LINK[url] = url;
			resolve();
		}
		script.setAttribute("rel", rel);
		script.setAttribute("href", `${rootURL}${url}?${Date.now()}`);
		document.getElementsByTagName("head")[0].appendChild(script);
	});
}

async function LOAD_JS(url, callback) {
	if (window.LOADED_JS == undefined) window.LOADED_JS = {};
	if (window.LOADED_JS[url] != undefined) return;
	return new Promise(function(resolve, reject) {
		let script = document.createElement("script");
		script.onload = function(event) {
			window.LOADED_JS[url] = url;
			resolve();
			if (callback != undefined) callback();
		}

		script.onerror = function(event){
			reject(event);
		}
		script.setAttribute("type", "text/javascript");
		script.setAttribute("src", `${rootURL}${url}?${Date.now()}`);
		document.getElementsByTagName("head")[0].appendChild(script);
	});
}

async function LOAD_JS_EXTENSION(extension, url, callback) {
	if (window.LOADED_JS == undefined) window.LOADED_JS = {};
	if (window.LOADED_JS[url] != undefined) return;
	try {
		let temp = url.split('/');
		temp = temp[temp.length-1]
		let name = temp.split('.');
		name = name[0];
		eval(name);
		return;
	} catch {
	}
	return new Promise(function(resolve, reject) {
		let script = document.createElement("script");
		script.onload = function() {
			window.LOADED_JS[url] = url;
			resolve();
			if (callback != undefined) callback();
		}
		script.setAttribute("type", "text/javascript");
		script.setAttribute("src", `${rootURL}share/${extension}/js/${url}?${Date.now()}`);
		document.getElementsByTagName("head")[0].appendChild(script);
	});
}

async function GET_JS_EXTENSION(extension, name, callback) {
	try {
		let temp = eval(name);
		if (typeof temp == 'function') return temp;
	} catch (error) {
	}
	return new Promise(function(resolve, reject) {
		let script = document.createElement("script");
		let urls = JS_EXTENSION[extension];
		if (urls == undefined) return;
		let url = JS_EXTENSION[extension][name];
		if (url == undefined) return;
		if (window.LOADED_JS == undefined) window.LOADED_JS = {};
		let path = `share/${extension}/js/${url}`;
		script.onload = function() {
			window.LOADED_JS[path] = path;
			resolve(eval(name));
			if (callback != undefined) callback();
		}
		script.onerror = function() {
			resolve(undefined);
		}
		script.setAttribute("type", "text/javascript");
		script.setAttribute("src", `${rootURL}${path}?${Date.now()}`);
		document.getElementsByTagName("head")[0].appendChild(script);
	});
}

async function INIT_STATE() {
	window.addEventListener('popstate', async (event) => {
		await RENDER_STATE(event);
	});
}

async function GET_CURRENT_PAGE(event) {
	if (event == undefined) event = history;
	let page = main.pageIDDict[event.state.PAGE];
	return page
}

async function RENDER_STATE(event) {
	if (event == undefined) event = history;
	let query = new URLSearchParams(window.location.search);
	let state = event.state;
	let pageID = query.get('pageID');
	if (pageID != null) {
		state = query.get('state');
		state= JSON.parse(state.b64decode());
	}
	let pageName = query.get('p');
	// if (pageName != null) {
	// 	state = localStorage.getItem(pageName);
	// 	state = JSON.parse(state);
	// }
	if ((pageName == null && pageID == null) || state == null) {
		if (main.homeMenu != undefined) {
			await main.homeMenu.dom.menu.click();
		} else {
			await main.render();
		}
		return;
	}
	let page = main.pageIDDict[state.PAGE];
	if (page == undefined) return;
	await RENDER_NAVIGATOR();
	if (state.isInit != undefined && state.isInit) {
		let isSubMenu = false;
		let menuDetail = main.menuDict[page.pageID];
		let parentID;
		if (menuDetail && menuDetail.parent) {
			parentID = menuDetail.parent;
			isSubMenu = true;
		}
		if (state.isRenderFromTab) {
			menuDetail = main.menuDict[state.tabPageID];
			if (menuDetail && menuDetail.parent) {
				parentID = menuDetail.parent;
				isSubMenu = true;
			}
		}
		let subMenu = main.subMenu[page.pageID];
		
		if (menuDetail && !isSubMenu && subMenu != undefined) {
			for (let item of subMenu) {
				if (!item.html.classList.contains("hidden")) {
					let subPage = main.pageIDDict[item.data.pageID];
					await subPage.highlightMenu(item.dom.menu, isSubMenu, false);
					await page.highlightMenu(menuDetail.menu.dom.menu, false, false);
					main.selectedSubMenu.push(item.dom.menu);
					await subPage.setPageState();
					SHOW_LOADING_DIALOG(async function(){
						await subPage.onPrepareState();
						await subPage.render();
					});
					return;
				}
			}
		}

		if (menuDetail && isSubMenu) {
			let parent = main.menuDict[parentID];
			if (parent) await page.highlightMenu(parent.menu.dom.menu, false, true);
			await page.highlightMenu(menuDetail.menu.dom.menu, isSubMenu, !isSubMenu);
			if (parent) main.selectedMenu.push(parent.menu.dom.menu);
			main.selectedSubMenu.push(menuDetail.menu.dom.menu);
		} else if (menuDetail) {
			await page.highlightMenu(menuDetail.menu.dom.menu, false, false);
			main.selectedMenu.push(menuDetail.menu.dom.menu);
		} 
		
		SHOW_LOADING_DIALOG(async function(){
			await page.onPrepareState();
			await page.render(state);
		});
	} else {
		SHOW_LOADING_DIALOG(async function(){
			await page.onPrepareState();
			await page.renderState(state);
			await page.renderOtherState(state);
		});
	}
	// await RENDER_MOST_USED(page);
}

async function GET_STATE_URL(page, data) {
	data.PAGE = page.pageID;
	data.PAGE_NAME = page.title;
	state = JSON.stringify(data);
	state = state.b64encode();
	// let url = await sha1(`${randomString(10)}_${Date.now()}`);
	// localStorage.setItem(url, state);
	return window.location.pathname + `?pageID=${page.pageID}&title=${page.title}&state=${state}`;
	// return rootURL + `?pageID=${page.pageID}&title=${page.title}&state=${state}`;
	// return rootURL + `?p=${url}`;
}

async function PUSH_STATE(page, data, url) {
	if(history.state){
		let state = history.state;
		let dataPAGE = url.split('/')[0];
		let dataState = url.split('/')[1];
		if(state.PAGE == dataPAGE && state.state == dataState) return;
		else if(state.PAGE == dataPAGE && !dataState) return;
	}
	data.PAGE = page.pageID;
	data.PAGE_NAME = page.title;
	state = JSON.stringify(data)
	state = state.b64encode()

	let pathName = "";
	// localStorage.setItem(url, state);
	if (!data.isLegacy) {
		let parameter = `?pageID=${page.pageID}&title=${page.title}&state=${state}`
		pathName = window.location.pathname + parameter;
	} else {
		url = await sha1(`${randomString(10)}_${Date.now()}`);
		pathName = window.location.pathname + '?p='+url;
	}
	history.pushState(data, '', pathName);
}

async function CREATE_MENU(pageID, name, icon, isSubMenu, isImage, hasAdd = false) {
	if (isImage == undefined) isImage = false;
	let iconDict = {}
	if (!isImage) iconDict = await CREATE_SVG_ICON(icon)
	else iconDict = await CREATE_IMAGE_ICON(icon)
	let menu = {'name': name, 'isSVG': iconDict.isSVG, 'icon': iconDict.icon, 'hasAdd': hasAdd, 'isMobile': isMobile()};
	let tag;
	if (isSubMenu == undefined) isSubMenu = false;
	let page = main.pageIDDict[pageID];
	if (page == undefined) return;
	let url = await page.getPageStateURL();
	menu.url = url;
	menu.pageID = pageID;
	if (isSubMenu) {
		tag = new DOMObject(TEMPLATE.SubMenuItem, menu);
	} else {
		tag = new DOMObject(TEMPLATE.MenuItem, menu);
	}
	
	main.home.dom.container.onclick = function(){
		main.home.dom.subMenuContainer.hide();
	}
	tag.dom.link.onclick = async function(e) {
		e.preventDefault();
	}
	if (!isSubMenu) {
		
		tag.dom.menu.addEventListener('click', async function(e) {
			e.preventDefault();
			if (tag.hasChild) {
				await page.highlightMenu(tag.dom.menu, isSubMenu, true);
				main.selectedMenu.push(tag.dom.menu);
				main.home.dom.menuName.html(name);
				await APPEND_SUB_MENU(main.subMenu[pageID]);
				main.home.dom.subMenuContainer.show();
				
			} else {
				await page.highlightMenu(tag.dom.menu, isSubMenu, false);
				main.selectedMenu.push(tag.dom.menu);
				if (isMobile()) main.home.dom.menuContainer.classList.add('hidden');				
				await page.setPageState();
				SHOW_LOADING_DIALOG(async function(){
					await page.onPrepareState();
					await page.render();
				});
				main.home.dom.subMenuContainer.hide();
				await setMostUsed(page);
				// await RENDER_MOST_USED(page);
			}
			await RENDER_NAVIGATOR();
		});
	} else {
		tag.dom.menuButton.addEventListener('click', async function(e) {
			e.preventDefault();
			if (isMobile()) main.home.dom.menuContainer.classList.add('hidden');
			await page.highlightMenu(tag.dom.menu, isSubMenu, false);
			main.selectedSubMenu.push(tag.dom.menu);
			await page.setPageState();
			SHOW_LOADING_DIALOG(async function(){
				await page.onPrepareState();
				await page.render();
			});
			main.home.dom.subMenuContainer.hide();
			await RENDER_NAVIGATOR();
			await setMostUsed(page);
			// await RENDER_MOST_USED(page);
		});
		if(tag.dom.add){
			if(!CHECK_PERMISSION_USER(page.extension, page.role, ['WRITE'])) tag.dom.add.remove();
			else{
				tag.dom.add.addEventListener('click', async function(e) {
					if (isMobile()) main.home.dom.menuContainer.classList.add('hidden');
					await page.highlightMenu(tag.dom.menu, isSubMenu, false);
					main.selectedSubMenu.push(tag.dom.menu);
					SHOW_LOADING_DIALOG(async function(){
						await page.onPrepareState();
						await page.renderView(page.model);
					});
					main.home.dom.subMenuContainer.hide();
					await setMostUsed(page);
				});
			}						
		}
	}

	async function setMostUsed(page){
		if(localStorage.getItem('mostUsed') == null) localStorage.setItem('mostUsed', JSON.stringify({}));
		let mostUsed = JSON.parse(localStorage.getItem('mostUsed'));
		if(mostUsed[page.pageID] == undefined){
			mostUsed[page.pageID] = {};
			mostUsed[page.pageID].count = 0;
			mostUsed[page.pageID].pageID = page.pageID;
		}
		mostUsed[page.pageID].title = page.title;
		mostUsed[page.pageID].extension = page.extension;
		mostUsed[page.pageID].count += 1;
		localStorage.setItem('mostUsed', JSON.stringify(mostUsed));
	}
	return tag;
}

async function RENDER_NAVIGATOR(){
	let event = history;
	if (main.personalBar != undefined && event.state.PAGE_NAME != undefined) {
		let navigator = main.personalBar.home.dom.navigator;
		navigator.html(`<div class="item">${event.state.PAGE_NAME}</div>`);
	}
}

async function RENDER_MOST_USED(page){
	if(localStorage.getItem('mostUsed') == null) return;
	let mostUsed = JSON.parse(localStorage.getItem('mostUsed'));
	let mostUsedList = Object.keys(mostUsed).map(function(key) {
		return [key, mostUsed[key]];
	});
	mostUsedList.sort(function(a, b) {
		return b[1].count - a[1].count;
	});
	if(page.home == undefined) return;
	page.home.dom.mostUsed.html('');
	let extension = {};
	for(let i in mostUsedList){
		if(extension[mostUsedList[i][1].extension] == undefined) extension[mostUsedList[i][1].extension] = [];
		extension[mostUsedList[i][1].extension].push(mostUsedList[i][1]);
		if(i == 4) break;
	}
	for(let i in extension){
		let title = `${i.charAt(0).toUpperCase()}${i.substring(1, i.length)}`;
		title = `<div class="bold" style="padding:10px 15px;user-select:none;text-decoration:underline;">${title}</div>`;
		if(i != 'undefined') page.home.dom.mostUsed.append(title);
		for(let j in extension[i]){
			let onclickEvent = `RENDER_MOST_USED_PAGE(main.pageIDDict['${extension[i][j].pageID}'])`;
			let menu = {
				onclickEvent: onclickEvent, 
				name: main.pageIDDict[extension[i][j].pageID].title,
			}
			let domObject = new DOMObject(TEMPLATE.MostUsedItem, menu);
			if(i == 'undefined') domObject.html.style = 'padding:10px 15px;';
			page.home.dom.mostUsed.append(domObject);
		}
	}
}

async function RENDER_MOST_USED_PAGE(page){
	await page.setPageState();
	await page.onPrepareState();
	await page.render();
	// await RENDER_MOST_USED(page);
}

async function SHOW_LOADING_DIALOG(callback){
	main.home.dom.loading.show();
	if(callback != undefined) await callback();
	main.home.dom.loading.hide();
}

async function CREATE_IMAGE_ICON(path) {
	return {'isSVG': false, 'icon': path};
}

async function CREATE_SVG_ICON(name) {
	if (Object.keys(ICON).length == 0) ICON = await getMustacheIcon();
	if (name == undefined) return {'isSVG': true, 'icon': ''};
	let items = name.split('.');
	let template = JSON.parse(JSON.stringify(ICON));
	for (let item of items) {
		if (template[item] != undefined) template = template[item]
		else break
	}
	if (typeof template == 'object') template = '';
	return {'isSVG': true, 'icon': template};
}

async function APPEND_SUB_MENU(subMenu) {
	main.home.dom.subMenuBar.html('');
	for(let i in subMenu){
		main.home.dom.subMenuBar.append(subMenu[i]);
		subMenu[i].renderLocalize();
	}
}

function GET_PAGE_NAME(label) {
	return label.replace(/ /g, '') + 'Page';
}

function isMobile() {
	return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase());
}

function isTablet() {
	return /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/.test(navigator.userAgent.toLowerCase());
}

function swapArrayIndex(array, origin, destination) {
	let temp = JSON.parse(JSON.stringify(array));
	let value = temp[origin];
	array.splice(origin, 1)
	array.splice(destination, 0, value);
}

function getScheduleEventType(eventType) {
	if (GLOBAL.SCHEDULE_EVENT_TYPE == undefined) return;
	return GLOBAL.SCHEDULE_EVENT_TYPE[eventType];
}

function getNotificationEventType(eventType) {
	if (GLOBAL.NOTIFICATION_EVENT_TYPE == undefined) return;
	return GLOBAL.NOTIFICATION_EVENT_TYPE[eventType];
}

async function OPEN_FILE(blob, fileName) {
	let objectURL = window.URL.createObjectURL(blob);
	window.open(objectURL);
}

async function LOAD_FILE(filePath) {
	let result = null;
	let xmlhttp = new XMLHttpRequest();
	xmlhttp.open("GET", filePath, false);
	xmlhttp.send();
	if (xmlhttp.status==200) {
		result = xmlhttp.responseText;
	}
	return result;
}

function arrayBufferToBase64(buffer) {
	let binary = '';
	let bytes = new Uint8Array(buffer);
	let len = bytes.byteLength;
	for (let i = 0; i < len; i++) {
		binary += String.fromCharCode(bytes[ i ]);
	}
	return btoa(binary);
}

function uint8ArrayToBase64(bytes) {
	let binary = '';
	let len = bytes.byteLength;
	for (let i = 0; i < len; i++) {
		binary += String.fromCharCode(bytes[ i ]);
	}
	return btoa(binary);
}

function arrayBufferFromBase64(text) {
	let array = Uint8Array.from(atob(text), c => c.charCodeAt(0));
	return array.buffer;
}

async function REDIRECT(url) {
	location.href = `${rootURL}${url}`;
}

async function GET_PICTURE_FROM_CAMERA() {

}

async function SHOW_ALERT_DIALOG(text, callback){
	let dialog = new DOMObject(TEMPLATE.AlertDialog, {text: text});
	main.home.dom.alertDialog.html(dialog);

	let body = document.getElementsByTagName('body')[0];
	body.style.overflow = 'hidden';
	dialog.html.style.top = `${window.pageYOffset}px`;

	dialog.dom.confirm.onclick = async function(){
		await CLOSE_ALERT_DIALOG();
		if(callback != undefined) callback();
	}
}

async function SHOW_CONFIRM_DIALOG(text, confirmCallback, cancelCallback){
	let dialog = new DOMObject(TEMPLATE.ConfirmDialog, {text: text, isForm: false});
	main.home.dom.alertDialog.html(dialog);

	let body = document.getElementsByTagName('body')[0];
	body.style.overflow = 'hidden';
	dialog.html.style.top = `${window.pageYOffset}px`;

	dialog.dom.confirm.onclick = async function(){
		await CLOSE_ALERT_DIALOG();
		if(confirmCallback != undefined) confirmCallback();
	}
	dialog.dom.cancel.onclick = async function(){
		await CLOSE_ALERT_DIALOG();
		if(cancelCallback != undefined) cancelCallback();
	}
}

async function SHOW_FINISHED_DIALOG(text, callback){
	let dialog = new DOMObject(TEMPLATE.FinishedDialog, {text: text, isForm: false});
	main.home.dom.alertDialog.html(dialog);

	let body = document.getElementsByTagName('body')[0];
	body.style.overflow = 'hidden';
	dialog.html.style.top = `${window.pageYOffset}px`;

	dialog.dom.confirm.onclick = async function(){
		await CLOSE_ALERT_DIALOG();
		if(callback != undefined) callback();
	}
}

async function SHOW_CONFIRM_DELETE_DIALOG(text, confirmCallback, cancelCallback){
	let dialog = new DOMObject(TEMPLATE.ConfirmDeleteDialog, {text: text, isForm: false});
	main.home.dom.alertDialog.html(dialog);

	let body = document.getElementsByTagName('body')[0];
	body.style.overflow = 'hidden';
	dialog.html.style.top = `${window.pageYOffset}px`;

	dialog.dom.confirm.onclick = async function(){
		await CLOSE_ALERT_DIALOG();
		if(confirmCallback != undefined) confirmCallback();
	}
	dialog.dom.cancel.onclick = async function(){
		await CLOSE_ALERT_DIALOG();
		if(cancelCallback != undefined) cancelCallback();
	}
}

async function SHOW_INFORMATION_DIALOG(text, callback){
	let dialog = new DOMObject(TEMPLATE.InformationDialog, {text: text, isForm: false});
	main.home.dom.alertDialog.html(dialog);

	let body = document.getElementsByTagName('body')[0];
	body.style.overflow = 'hidden';
	dialog.html.style.top = `${window.pageYOffset}px`;

	dialog.dom.confirm.onclick = async function(){
		await CLOSE_ALERT_DIALOG();
		if(callback != undefined) callback();
	}
}

async function CLOSE_ALERT_DIALOG(){
	main.home.dom.alertDialog.html('');
	let body = document.getElementsByTagName('body')[0];
	body.style.overflowY = 'auto';
}

function START_PAGE_AFTER_LOAD(start){
	document.addEventListener("DOMContentLoaded", function(event){
		if(isPreload){
			preloader = new Preloader();
			preloader.preload(preloadJS, preloadCSS).then(function(){
				start();
			});
		}else{
			start();
		}
	});
}

async function getDateRangeInput() {
	let timeType = 'date';
	let now = new Date();
	let view = new DOMObject(await TEMPLATE.get("DateRangeInput"), {rootURL});
	let startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
	let endDate = now;

	function setDate(startDate, endDate) {
		view.dom.start.value = `${startDate.getFullYear()}-${String(startDate.getMonth()+1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}`;
		view.dom.end.value = `${endDate.getFullYear()}-${String(endDate.getMonth()+1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;
		let formatter = new Intl.DateTimeFormat(LANGUAGE, {year: "numeric", month: "long", day: '2-digit'});
		view.dom.filter.innerHTML = `${formatter.format(startDate)} - ${formatter.format(endDate)}`

		view.dom.start.max = view.dom.end.value;
		view.dom.end.min = view.dom.start.value;
	}

	setDate(startDate, endDate);
	view.dom.lastSevenDays.classList.add('highlight');
	
	view.dom.filterContainer.onclick = async function() {
		view.dom.filterContextMenu.classList.toggle('hideMenuOnMobile');
	}

	function highlightMenu(tag) {
		let contextMenus = view.html.getElementsByClassName("contextMenu");
		for (let contextMenu of contextMenus) {
			contextMenu.classList.remove('highlight');
		}
		tag.classList.add('highlight');
		view.dom.customRageContainer.classList.add('hidden');
		view.dom.filterContextMenu.classList.remove('expanded')
	}

	function getFilterData() {
		let result = {
			value: {},
			date: {},
			month: {},
			year: {}
		};
		let startTime = new Date(view.dom.start.value);
		let endTime = new Date(view.dom.end.value);

		result.value.start = view.dom.start.value;
		result.value.end = view.dom.end.value;

		result.date.start = dateToDateID(view.dom.start.value);
		result.date.end = dateToDateID(view.dom.end.value);
		result.timeType = timeType;
		
		result.month.start = 12 * (startTime.getFullYear() - 1970) + (startTime.getMonth() + 1);
		result.month.end = 12 * (endTime.getFullYear() - 1970) + (endTime.getMonth() + 1);

		result.year.start = startTime.getFullYear();
		result.year.end = endTime.getFullYear();
		return result
	}

	view.dom.today.onclick = async function() {
		let now = new Date();
		setDate(now, now);
		highlightMenu(this);
		timeType = 'date';
		view.refresh();
	}

	view.dom.yesterday.onclick = async function() {
		let now = new Date();
		now.setDate(now.getDate() - 1);
		timeType = 'date';
		setDate(now, now);
		highlightMenu(this);
		view.refresh();
	}

	view.dom.lastSevenDays.onclick = async function() {
		let now = new Date();
		let start = new Date();
		start.setDate(start.getDate() - 6);
		timeType = 'date';
		setDate(start, now);
		highlightMenu(this);
		view.refresh();
	}

	view.dom.lastThirtyDays.onclick = async function() {
		let now = new Date();
		let start = new Date();
		start.setDate(start.getDate() - 29);
		timeType = 'date';
		setDate(start, now);
		highlightMenu(this);
		view.refresh();
	}

	view.dom.thisMonth.onclick = async function() {
		let now = new Date();
		let start = new Date(now.getFullYear(), now.getMonth(), 1);
		let end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
		timeType = 'date';
		setDate(start, end);
		highlightMenu(this);
		view.refresh();
	}

	view.dom.lastMonth.onclick = async function() {
		let now = new Date();
		let start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
		let end = new Date(now.getFullYear(), now.getMonth(), 0);
		timeType = 'date';
		setDate(start, end);
		highlightMenu(this);
		view.refresh();
	}

	view.dom.thisYear.onclick = async function() {
		let now = new Date();
		let start = new Date(now.getFullYear(), 0, 1);
		let end = new Date(now.getFullYear(), 12, 0);
		timeType = 'month';
		setDate(start, end);
		highlightMenu(this);
		view.refresh();
	}

	view.dom.lastYear.onclick = async function() {
		let now = new Date();
		let start = new Date(now.getFullYear() - 1, 0, 1);
		let end = new Date(now.getFullYear() - 1, 12, 0);
		timeType = 'month';
		setDate(start, end);
		highlightMenu(this);
		view.refresh();
	}

	view.dom.lastFiveYears.onclick = async function() {
		let now = new Date();
		let start = new Date(now.getFullYear() - 4, 0, 1);
		let end = new Date(now.getFullYear(), 12, 0);
		timeType = 'year';
		setDate(start, end);
		highlightMenu(this);
		view.refresh();
	}

	view.dom.customRange.onclick = async function() {
		highlightMenu(this);
		view.dom.customRageContainer.classList.remove('hidden');
		view.dom.filterContextMenu.classList.add('expanded')
	}

	view.dom.start.onchange = async function() {
		let start = new Date(view.dom.start.value);
		let end = new Date(view.dom.end.value);
		setDate(start, end);
		view.refresh();
	}
	view.dom.end.onchange = async function() {
		view.refresh();
	}

	view.refresh = async function() {
		if (view.onchange != undefined) {
			let value = getFilterData();
			view.onchange(value);
		}
	}
	view.getFilterData = getFilterData;
	return view;
}

const isInStandaloneMode = () => (window.matchMedia('(display-mode: standalone)').matches) || (window.navigator.standalone) || document.referrer.includes('android-app://');

FormData.prototype.isEmpty = function() {
	return this.entries().next().done;
}

function CHECK_ROOT_USER(){
	IS_ROOT = false;
	if(GLOBAL.USER.permissions.indexOf('root') != -1) IS_ROOT = true;
	return IS_ROOT;
}

function CHECK_PERMISSION_USER(extension, roles, permissions){
	if(CHECK_ROOT_USER()) return true;
	for(let i in roles){
		let role = roles[i];
		for(let j in permissions){
			let permission = permissions[j];
			if(GLOBAL.USER.permissions.indexOf(`${extension}.${role}.${permission}`) != -1) return true;
		}		
	}
	return false;
}

async function SEND_OPERATION(operation, data) {
}

String.prototype.b64encode = function() { 
	let text = this + '';
	let result = btoa(unescape(encodeURIComponent(text)));
    return result; 
};
String.prototype.b64decode = function() {
	let text = this + '';
    return decodeURIComponent(escape(atob(text))); 
};

String.prototype.hexEncode = function(){
    let hex, i;

    let result = "";
    for (i=0; i<this.length; i++) {
        hex = this.charCodeAt(i).toString(16);
        result += ("000"+hex).slice(-4);
    }

    return result
}

String.prototype.hexDecode = function(){
    let j;
    let hexes = this.match(/.{1,4}/g) || [];
    let back = "";
    for(j = 0; j<hexes.length; j++) {
        back += String.fromCharCode(parseInt(hexes[j], 16));
    }

    return back;
}

function BACK(){
	history.back();
}