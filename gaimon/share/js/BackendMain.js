let BACKEND_PREPROCESS = [];
let BACKEND_POSTPROCESS = [];

const BackendMain = function() {
	let object = this;

	object.current = {};
	object.url = 'page';

	object.menus = [];
	object.menuDict = {};
	object.selectedMenu = [];
	object.selectedSubMenu = [];
	object.extensionMenu = {};
	object.extensionMenuMap = {};

	object.resizeFunction = {};

	object.homeMenu;
	object.homePage;

	object.extension = {};
	object.scriptNameExtensionMapper = {};

	object.pageIDDict = {};
	object.pageModelDict = {};
	object.tabExtension = {};
	object.tabsByPageID = {};
	object.tabMapperByPageID = {};

	object.page = {};
	object.websocketRegister = new GaimonSocketRegister(object);
	object.isWebSocket = (isWebSocket == undefined) ? true : isWebSocket;

	object.page.general = new GeneralPage(this, this);
	object.page.user = new UserManagementPage(this, this);
	object.page.permission = new PermissionRoleManagementPage(this, this);
	// object.page.unitPage = new UnitPage(this, this);
	// object.page.unit = new UnitManagementPage(this, object.page.unitPage);
	// object.page.unitCategory = new UnitCategoryManagementPage(this, object.page.unitPage);
	object.page.dashboard = new DashboardManagementPage(this, this);
	object.page.template = new TemplatePage(this, this);
	object.page.notificationPage = new NotificationPage(this, this);
	object.page.job = new MyJobPage(this, this);

	object.protocol = {};
	object.protocol.user = new UserProtocol(this);
	object.protocol.unit = new UnitProtocol(this);
	object.protocol.utility = new UtilityProtocol(this);
	object.protocol.schedule = new PersonalScheduleProtocol(this);

	object.personalBar = new PersonalBar(this);
	object.statusBar = new StatusBar(this);

	object.tableViewType = 'Table';

	this.init = async function() {
		for(let process of BACKEND_PREPROCESS){
			await process(object);
		}
		let result = await GLOBAL.AUTHEN.checkLogin();
		if (!result.isSuccess) {
			let url = `${window.location.search}${window.location.pathname}`;
			url.encodeHex();
		}
		let isAllow = await object.checkPagePermission();
		if (!isAllow) {
			// document.body
			document.body.innerHTML = "You don't have an permission.";
			return;
		}
		GLOBAL.USER = result.results;
		await object.prepareExtension();
		await INIT_STATE();
		await object.render();
		await RENDER_STATE();
		// await object.onresize();
		if(object.isWebSocket){
			await object.websocketRegister.connect();
			WEBSOCKET.isConnected = object.websocketRegister.socket.isConnected;
			WEBSOCKET.socket = object.websocketRegister.socket;
		}
		if(isPreload && preloader != null && preloader.socket.isConnected){
			await preloader.close();
			preloader = null;
		}

		for(let process of BACKEND_POSTPROCESS){
			process(object);
		}

		let language = localStorage.getItem('LANGUAGE');
		if (language != undefined && language != 'en') {
			object.personalBar.setLanguage(language);
		}
	}

	this.checkPagePermission = async function() {
		let response = await POST('authentication/checkPermission', {});
		if (response.isSuccess) {
			return response.result;
		}
		return false;
	}

	this.render = async function() {
		object.home = new DOMObject(TEMPLATE.Main, {rootURL});
		object.body = document.querySelector('body');
		object.body.innerHTML = '';
		object.body.classList.add('abstract');
		object.body.appendChild(object.home.html);
		await object.renderMenu();
		await object.personalBar.renderPersonalBar();
		if (DEFAULT_MENU.length != 0) {
			let query = new URLSearchParams(window.location.search);
			let pageName = query.get('pageID');
			let pageID = query.get('p');
			if (pageName == null && pageID == null) object.menuDict[DEFAULT_MENU].menu.dom.menu.click()	
		}
		// for (let pageID in object.extensionMenuMap) {
		// 	if (object.subMenu[pageID] == undefined) {
		// 		object.extensionMenuMap[pageID].html.classList.add('hidden');
		// 		continue;
		// 	};
		// 	if (object.subMenu[pageID].length == 0) {
		// 		object.extensionMenuMap[pageID].html.classList.add('hidden');
		// 		continue;
		// 	};
			
		// }
	}

	this.prepareExtension = async function() {
		for (let extension in JS_EXTENSION) {
			for (let scriptName in JS_EXTENSION[extension]) {
				object.scriptNameExtensionMapper[scriptName] = extension;
			}
		}
	}

	this.renderMenu = async function() {
		object.subMenu = {};
		object.menuDict = {};
		object.tabMenu = {};
		object.home.dom.menuBar.html('');
		if (isMobile()) await object.initMobile();
		else await object.initDesktop();
		object.tabExtension = []
		await object.renderGaimonMenu();
		await object.renderExtensionMenu();
		let tabs = await object.protocol.utility.getJSPageTabExtension();
		for (let pageID in tabs) {
			if (object.tabExtension[pageID] == undefined) object.tabExtension[pageID] = []
			object.tabExtension[pageID].push(...tabs[pageID])
		}
		if (object.menuDict['GeneralPage'] == undefined) {
			let generalMenu = await object.page.general.getMenu();
			generalMenu.hasChild = true;
			if (object.extensionMenuMap['GeneralPage'] == undefined) object.extensionMenuMap['GeneralPage'] = generalMenu;
			object.menuDict['GeneralPage'] = {menu: generalMenu};
			if (object.subMenu['GeneralPage'].length > 0) {
				object.home.dom.menuBar.append(generalMenu);
			}
		} else {
			if (object.subMenu['GeneralPage'].length == 0) {
				console.log(object.menuDict['GeneralPage']);
				console.log(object.menuDict['GeneralPage'].menu.html.classList.add("hidden"));
			}
		}

		for (let pageID in main.pageIDDict) {
			let page = main.pageIDDict[pageID];
			if(page.onCreate){
				await page.onCreate();
			}
		}

		for (let pageID in main.pageIDDict) {
			await object.appendTabFromPage(main.pageIDDict[pageID]);
		}
		for (let pageID in object.tabExtension) {
			if (main.pageIDDict[pageID] == undefined) continue;
			let parent = main.pageIDDict[pageID];
			for (let item of object.tabExtension[pageID]) {
				if (main.pageIDDict[item.ID] == undefined) continue;
				parent.appendTab(
					{
						page: main.pageIDDict[item.ID],
						label: item.label,
						order: item.order,
					}
				)
			}
		}
	}

	this.renderGaimonMenu = async function() {
		if (window.DISABLE_MENU == undefined) {
			window.DISABLE_MENU = {};
			if (typeof DISABLE_MENU != 'undefined') {
				window.DISABLE_MENU = DISABLE_MENU;
			}
		}
		object.page.user.loadPermission('gaimon');
		if (object.subMenu['GeneralPage'] == undefined) {
			object.subMenu['GeneralPage'] = [];
		}

		if (object.checkPermission(object.page.user) && window.DISABLE_MENU['user'] == undefined) {
			let userMenu = await object.page.user.getMenu(true);
			object.page.user.module = 'user';
			object.subMenu['GeneralPage'].push(userMenu);
			object.menuDict[object.page.user.pageID] = {
				menu: userMenu,
				parent: 'GeneralPage'
			}
		}

		if (object.checkPermission(object.page.permission) && window.DISABLE_MENU['permission'] == undefined) {
			let permissionMenu = await object.page.permission.getMenu(true);
			object.page.permission.module = 'permission';
			object.menuDict[object.page.permission.pageID] = {menu: permissionMenu};
		}

		// object.page.unitPage.loadPermission('gaimon');
		// if (object.checkPermission(object.page.unitPage) && window.DISABLE_MENU['unit'] == undefined) {
		// 	let unitMenu = await object.page.unitPage.getMenu(true);
		// 	object.page.unitPage.module = 'unit';
		// 	object.subMenu['GeneralPage'].push(unitMenu);
		// 	object.menuDict[object.page.unitPage.pageID] = {menu: unitMenu, parent: 'GeneralPage'}
		// }

		object.page.job.loadPermission('gaimon');
		if (object.checkPermission(object.page.template) && window.DISABLE_MENU['schedule'] == undefined) {
			let jobMenu = await object.page.job.getMenu();
			object.page.job.module = 'job';
			object.homeMenu = jobMenu;
			object.homePage = object.page.job;
			object.menus.push(jobMenu);
			object.home.dom.menuBar.append(jobMenu);
			object.menuDict[object.page.job.pageID] = {menu: jobMenu}
		}

		object.page.dashboard.loadPermission('gaimon');
		if (object.checkPermission(object.page.dashboard) && window.DISABLE_MENU['dashboard'] == undefined) {
			let dashboardMenu = await object.page.dashboard.getMenu();
			object.page.dashboard.module = 'dashboard';
			object.menus.push(dashboardMenu);
			object.home.dom.menuBar.append(dashboardMenu);
			object.menuDict[object.page.dashboard.pageID] = {menu: dashboardMenu}
		}

		// object.page.template.loadPermission('gaimon');
		// if (object.checkPermission(object.page.template)) {
		// 	let templateMenu = await object.page.template.getMenu();
		// 	object.menus.push(templateMenu);
		// 	object.home.dom.menuBar.append(templateMenu);
		// }
	}

	this.renderExtensionMenu = async function() {
		let config = {};
		let extensionMenus = object.extensionMenuMap;
		for (let item of EXTENSION_MENU_CONFIG) {
			config[item.ID] = item;
		}
		for (let group in EXTENSION_MENU) {
			let menuConfig = config[group];
			if (menuConfig.hasChild == undefined) menuConfig.hasChild = true
			if (!menuConfig.hasChild) {
				menuConfig.pageName = menuConfig.ID;
				if (object.extensionMenu[group] == undefined){
					let create = AbstractPage.prototype.create
					object.extensionMenu[group] = await create(menuConfig.pageName, this, this);
				}
			} else {
				menuConfig.pageName = GET_PAGE_NAME(menuConfig.label);
				if (object.extensionMenu[group] == undefined){
					let create = AbstractPage.prototype.create;
					object.extensionMenu[group] = await create(group, this, this);
				}
			}
			let parent = object.extensionMenu[group];
			if (!parent.isGenerate) {
				let extension = menuConfig.extension;
				parent.loadPermission(extension);
				parent.extension = extension;
				if (!object.checkPermission(parent)) continue;
				await parent.register();
				if (object.extension[extension] == undefined) object.extension[extension] = {};
				object.extension[extension][parent.pageID] = parent;
				menuConfig.pageName = menuConfig.label;
			}
			if (extensionMenus[menuConfig.pageName] == undefined){
				extensionMenus[menuConfig.pageName] = await parent.getMenu(
					false,
					menuConfig.label,
					menuConfig.icon
				);
			}
			let menu = extensionMenus[menuConfig.pageName];
			if (parent.isHidden) menu.html.classList.add('hidden');
			menu.hasChild = menuConfig.hasChild;
			object.menuDict[parent.pageID] = {menu: menu};
			if (menuConfig.hasChild) {
				for (let item of EXTENSION_MENU[group]) {
					let extension = item.extension;
					let scriptName = item.ID;
					let page = await AbstractPage.prototype.create(scriptName, this, parent);
					object.extendPage(page);
					page.extension = extension;
					page.loadPermission(extension);
					if (page.checkIsEnable != undefined && !page.checkIsEnable()) page.isHidden = true;
					if (item.isHidden) page.isHidden = true;
					// if (EXTENSION[item.groupExtension] == undefined) continue;
					if (window.DISABLE_MENU[item.ID] != undefined) continue;
					if (!object.checkPermission(page)) continue;
					await page.register();
					if (object.extension[extension] == undefined) object.extension[extension] = {};
					object.extension[extension][page.pageID] = page;
					let subMenu = await page.getMenu(true, item.label, item.icon, item.hasAdd);
					if (page.isHidden) subMenu.html.classList.add('hidden');
					if(object.subMenu[page.parentPageID] == undefined) object.subMenu[page.parentPageID] = [];
					object.subMenu[page.parentPageID].push(subMenu);
					object.menuDict[page.pageID] = {menu: subMenu, parent: page.parentPageID};
				}
			}
			if (window.DISABLE_MENU[group] != undefined) {
				menu.html.classList.add('hidden');
			}
		}
		for (let i in EXTENSION_MENU_CONFIG) {
			let pageName = EXTENSION_MENU_CONFIG[i].pageName;
			let menu = extensionMenus[pageName];
			if(menu == undefined) continue;
			object.menus.push(menu);
			object.home.dom.menuBar.append(menu);
		}
	}

	this.appendTabFromPage = async function(page) {
		if (page.parentTabConfig == undefined) return;
		for (let item of page.parentTabConfig) {
			if (object.tabExtension[item.parent] == undefined) object.tabExtension[item.parent] = []
			item['ID'] = page.pageID
			object.tabExtension[item.parent].push(item);
		}
	}

	this.checkPermission = function(page) {
		if (GLOBAL.USER.role.indexOf('root') != -1) return true;
		if (page.role.length == 0) return true;
		if (page.permissions == undefined) return true;
		const filteredArray = page.permissions.filter(value => GLOBAL.USER.permissions.includes(value));
		if (filteredArray.length > 0) return true;
		return false;
	}

	this.onresize = async function(){
		window.onresize = async function(event){
			if(window.innerWidth <= 600){
				await object.initMobile();
			}else{
				await object.initDesktop();
			}
			for (let i in object.resizeFunction) {
				await object.resizeFunction[i](event);
			}
		}
	}

	this.appendResizeEvent = function(key, callback) {
		object.resizeFunction[key] = callback;
	}

	this.initMobile = async function(){
		if(object.home.dom.menuBackContainer.classList.contains('hidden')) object.home.dom.menuBackContainer.classList.remove('hidden');
		if(object.home.dom.subMenuBackContainer.classList.contains('hidden')) object.home.dom.subMenuBackContainer.classList.remove('hidden');
		if(object.home.dom.topBar.classList.contains('hidden')) object.home.dom.topBar.classList.remove('hidden');
		if(!object.home.dom.menuContainer.classList.contains('hidden')) object.home.dom.menuContainer.classList.add('hidden');
		if(!object.home.dom.logo.classList.contains('hidden')) object.home.dom.logo.classList.add('hidden');
		object.home.dom.menuButton.onclick = async function(){
			object.home.dom.menuContainer.classList.remove('hidden');
		}
		object.home.dom.backButton.onclick = async function(){
			window.history.back();
		}
		object.home.dom.back.onclick = async function(){
			object.home.dom.menuContainer.classList.toggle('hidden');
		}
		object.home.dom.subMenuBack.onclick = async function(){
			object.home.dom.subMenuContainer.classList.toggle('hidden');
		}
	}

	this.initDesktop = async function(){
		await object.appendHeader();
		if(!object.home.dom.menuBackContainer.classList.contains('hidden')) object.home.dom.menuBackContainer.classList.add('hidden');
		if(!object.home.dom.subMenuBackContainer.classList.contains('hidden')) object.home.dom.subMenuBackContainer.classList.add('hidden');
		if(!object.home.dom.topBar.classList.contains('hidden')) object.home.dom.topBar.classList.add('hidden');
		if(object.home.dom.menuContainer.classList.contains('hidden')) object.home.dom.menuContainer.classList.remove('hidden');
		if(object.home.dom.logo.classList.contains('hidden')) object.home.dom.logo.classList.remove('hidden');
	}

	this.appendHeader = async function(){
		object.home.dom.logo.html('');
		if(HORIZONTAL_LOGO != undefined) horizontalLogo = HORIZONTAL_LOGO;
		else horizontalLogo = '';
		object.header = new DOMObject(TEMPLATE.Header, {title: TITLE, horizontalLogo: horizontalLogo});
		object.home.dom.logo.append(object.header);
		object.header.html.onclick = async function(){
			await object.expandMenu();
		}
		// object.header.dom.menu.onclick = async function(){
		// 	await object.expandMenu();
		// }
	}

	this.expandMenu = async function(){
		object.header.dom.logo.classList.toggle('hidden');
		object.header.dom.header.classList.toggle('center');
		// object.header.dom.svg.classList.toggle('hidden');
		// object.header.dom.img.classList.toggle('hidden');
		object.home.dom.menuContainer.classList.toggle('large_menu');
		object.home.dom.mainContainer.classList.toggle('large_menu');
		object.home.dom.subMenuContainer.classList.toggle('large_sub_menu');
		object.home.dom.container.classList.toggle('short_container');
	}

	this.scanQRCode = async function(input, template, dialog, onSubmit){
		let buttonClear = new DOMObject('<div class="abstract_button submit_button" rel="clear">clear</div>');
		dialog.dom.operation.prepend(buttonClear);
		dialog.dom.cancel.onclick = function(){
			html5QrCode.stop();
			object.home.dom.dialog.html('');
		}

		template.dom.qrCodeText.onkeyup = async function(e){
			if(e.key == 'Enter'){
				dialog.dom.submit.onclick();
			}
		}
		dialog.dom.submit.onclick = async function(){
			html5QrCode.stop();
			input.value = template.dom.qrCodeText.value;
			object.home.dom.dialog.html('');
			if(onSubmit != undefined)await onSubmit();
		}
		let html5QrCode = new Html5Qrcode("reader", { formatsToSupport: [ Html5QrcodeSupportedFormats.QR_CODE ] });
		let qrCodeSuccessCallback = async (decodedText, decodedResult) => {
				template.dom.qrCodeText.value = decodedText;
				template.dom.qrCode.getElementsByTagName('video')[0].pause();
				await html5QrCode.pause();
				template.dom.qrCodeText.focus();
				// html5QrCode.stop();
		};

		
		buttonClear.dom.clear.onclick = async function(){
			await html5QrCode.resume();
			template.dom.qrCode.getElementsByTagName('video')[0].play();
		}

		let config = { fps: 30, qrbox: { width: 230, height: 230 } };
		await html5QrCode.start({ facingMode: 'user' }, config, qrCodeSuccessCallback);
	}

	this.renderPersonalBar = async function(){
		let personalBar = await AbstractPage.prototype.renderPersonalBar.call();
	}

	this.appendScheduleEventType = async function(eventType, callback) {
		if (GLOBAL.SCHEDULE_EVENT_TYPE == undefined) GLOBAL.SCHEDULE_EVENT_TYPE = {};
		GLOBAL.SCHEDULE_EVENT_TYPE[eventType] = callback;
	}


	this.appendNotificationEventType = async function(eventType, callback) {
		if (GLOBAL.NOTIFICATION_EVENT_TYPE == undefined) GLOBAL.NOTIFICATION_EVENT_TYPE = {};
		GLOBAL.NOTIFICATION_EVENT_TYPE[eventType] = callback;
	}

	this.extendPage = function(page){
		if(!(page.constructor.name in PAGE_EXTENSION)) return;
		let extensionList = PAGE_EXTENSION[page.constructor.name];
		for(let i of extensionList){
			let extension = eval(`new ${i}(object)`);
			extension.extend(page);
		}
	}
}