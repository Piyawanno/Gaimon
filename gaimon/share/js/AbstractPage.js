function renderInput(config){
	let template = TEMPLATE.input[`${config.typeName}Input`];
	config.rootURL = rootURL;
	if(template == undefined){
		console.log(config.typeName, config, "not found");
	}
	let input = new InputDOMObject(template, config);
	return input;
}

const AbstractPage = function(main, parent) {
	let object = this;

	object.main = main;
	object.pageID = object.__proto__.constructor.name;
	object.hasParent = false;
	object.home;
	object.extension;
	object.role = [];
	object.permission = [];
	object.permissions = [];
	object.tabs = [];
	object.tabMapper = {};
	object.otherState = {};
	object.dynamicState = {};
	object.viewStepMap = {}
	object.viewStepSubMap = {};

	object.viewTabMap = {}
	object.viewTabSubMap = {};
	
	object.isModelPage = true;

	object.table = new AbstractTable(this);
	object.form = new AbstractForm(this);
	object.searchForm = new AbstractSearchForm(this);
	object.dialog = new AbstractDialog(this);
	object.view = new AbstractView(this);
	object.tableView = new AbstractTableView(this);
	object.tableForm = new AbstractTableForm(this);
	object.util = new AbstractInputUtil(this);

	object.pageNumber = 1;
	object.limit = 10;
	object.tabTitle;
	object.restURL;

	object.isTabVisible = true;

	if (parent != undefined) {
		object.hasParent = true;
		object.parent = parent;
		object.parentPageID = parent.pageID;
	}
	if (main != undefined) {
		object.main.pageIDDict[object.pageID] = object;
	}

	for (let i in AbstractPage.prototype) {
		object.__proto__[i] = AbstractPage.prototype[i];
	}

	for (let i in AbstractInputUtil.prototype) {
		object.__proto__[i] = AbstractInputUtil.prototype[i];
	}

	this.preload = async function() {
		if (object.restURL != undefined && object.restProtocol == undefined) object.restProtocol = new AbstractProtocol(main, object.restURL);
	}

	this.initModel = function() {
		if (object.model) {
			if (object.isModelPage) object.main.pageModelDict[object.model] = object;
		}
	}

	this.loadPermission = function(extension) {
		object.permissions = [];
		for (let i in object.role) {
			if (object.permission.length == 0) object.permission = [PermissionType.READ, PermissionType.WRITE, PermissionType.UPDATE, PermissionType.DROP]
			for (let j in object.permission) {
				if (extension != undefined) {
					object.permissions.push(`${extension}.${object.role[i]}.${PermissionTypeMap[object.permission[j]]}`)
				} else {
					object.permissions.push(`${object.role[i]}.${PermissionTypeMap[object.permission[j]]}`)
				}
				
			}
		}
		object.initModel();
	}

	this.setParent = function(parent) {
		object.hasParent = true;
		object.parent = parent;
		object.parentPageID = parent.pageID;
	}
	
	this.initMenuEvent = async function(menu) {
		menu.html.onclick = function() {
			console.log('Not Implement');
		}
	}

	this.onPrepareState = async function() {
		main.home.dom.tabContainer.classList.add('hidden');
		await object.preload();
		await object.prepare();
		await object.initStep();
		await object.getAllState();
	}

	this.register = async function() {
	}

	this.initJS = async function() {
	}

	this.prepare = async function() {
	}

	this.getMenu = async function(isSubMenu, label, icon, hasAdd = false) {
		let object = this;
		object.menu = await CREATE_MENU(object.pageID, label, icon, isSubMenu, false, hasAdd);
		return object.menu;
	}

	this.renderState = async function(state) {
		await object.preload();
		if (object.restProtocol == undefined) return;
		if (state.state == 'form') await object.renderView(object.model, {isSetState: false, data: state.data, isView: state.isView}, 'Form');
		if (state.state == 'locale_en_form'){
			state.data.languageCode = 'en';
			await object.renderLocaleForm(object.model, {isSetState: false, data: state.data, isView: state.isView});
		}
	}

	this.registerState = async function(name, callback) {
		object.otherState[name] = callback;
	}

	this.renderOtherState = async function(state) {
		if (object.otherState[state.state]) {
			await object.otherState[state.state](object.model, {isSetState: false, data: state.data, isView: state.isView}, 'Form')
			return;
		}
		await object.renderDynamicState(state);
	}

	this.renderDynamicState = async function(state) {
		if (object.dynamicState[state.state]) {
			let config = object.dynamicState[state.state];
			if (main.pageIDDict[config.pageID] == undefined) return;
			if (main.pageIDDict[config.pageID][config.render] == undefined) return;
			await main.pageIDDict[config.pageID][config.render](object.model, {isSetState: false, data: state.data, isView: state.isView}, 'Form')
			return;
		}
	}

	this.setPageState = async function(config) {
		if (config == undefined) config = {}
		if (config.isInit == undefined) config.isInit = true;
		object.changeState(config, object.pageID);
	}

	this.changeState = async function(data, url, page = undefined) {
		let object = this;
		if (page != undefined) object = page;
		if(data.isLegacy == undefined) data.isLegacy = false;
		await PUSH_STATE(object, data, url);
	}

	this.changeFormState = async function(data, url, page = undefined) {
		let object = this;
		if (page != undefined) object = page;
		data.isLegacy = true;
		await PUSH_STATE(object, data, url);
	}

	this.getPageStateURL = async function(config) {
		if (config == undefined) config = {}
		if (config.isInit == undefined) config.isInit = true;
		return await GET_STATE_URL(object, config);
	}

	this.initStep = async function() {
		
	}

	this.registerTabView = async function(group, step){
		if (main.viewPageMap == undefined) main.viewPageMap = {};
		if (main.viewPageSubMap == undefined) main.viewPageSubMap = {};
		if (main.viewPageMap[group] == undefined) {
			main.viewPageMap[group] = []
			main.viewPageSubMap[group] = {}
		}
		let uniqueID = `${step.pageID}_${step.render}`
		if (main.viewPageSubMap[group][uniqueID] == undefined) {
			main.viewPageMap[group].push(step);
			main.viewPageSubMap[group][uniqueID] = step;
			main.viewPageMap[group].sort((a, b) => a.order - b.order);
		}
		step.group = group;
	}
	
	this.registerTag = async function(group, step){

	}

	this.registerTab = async function(group, step){
		if (main.viewTabMap == undefined) main.viewTabMap = {};
		if (main.viewTabSubMap == undefined) main.viewTabSubMap = {};
		if (main.viewTabMap[group] == undefined) {
			main.viewTabMap[group] = []
			main.viewTabSubMap[group] = {}
		}
		let uniqueID = `${step.pageID}_${step.render}`
		if (main.viewTabSubMap[group][uniqueID] == undefined) {
			main.viewTabMap[group].push(step);
			main.viewTabSubMap[group][uniqueID] = step;
			main.viewTabMap[group].sort((a, b) => a.order - b.order);
		}
		step.group = group;
	}

	this.registerStep = async function(group, step) {
		if (main.viewStepMap == undefined) main.viewStepMap = {};
		if (main.viewStepSubMap == undefined) main.viewStepSubMap = {};
		if (main.viewStepMap[group] == undefined) {
			main.viewStepMap[group] = []
			main.viewStepSubMap[group] = {}
		}
		let uniqueID = `${step.pageID}_${step.render}`
		if (main.viewStepSubMap[group][uniqueID] == undefined) {
			main.viewStepMap[group].push(step);
			main.viewStepSubMap[group][uniqueID] = step;
			main.viewStepMap[group].sort((a, b) => a.order - b.order);
		}
		step.group = group;
	}

	this.getAllState = async function() {
		if (Object.keys(object.viewStepMap).length > 0) {
			for (let i in object.viewStepMap) {
				let steps = object.viewStepMap[i];
				for(let step of steps){
					step.state = `${object.pageID}_step_${step.pageID}_form`;
					object.dynamicState[step.state] = step;
				}
			}
		}
	}

	

	this.highlightMenu = async function(menu, isSubMenu, hasSubMenu) {
		if (!hasSubMenu) {
			for (let i in main.selectedSubMenu) {
				main.selectedSubMenu[i].classList.remove('highlightMenu');
			}
			main.selectedSubMenu = [];
		}
		if (!isSubMenu) {
			for (let i in main.selectedMenu) {
				main.selectedMenu[i].classList.remove('highlightMenu');
			}
			main.selectedMenu = [];
		}
		menu.classList.add('highlightMenu');
	}

	this.appendButton = async function(config){
		let button = await object.getButton(config);
		object.home.dom.button.append(button);
		return button;
	}

	this.appendAdditionalButton = async function(config){
		let button = await object.getButton(config);
		object.home.dom.additionalButton.append(button);
		return button;
	}

	this.prependButton = async function(config){
		let button = await object.getButton(config);
		object.home.dom.button.prepend(button);
		return button;
	}

	this.appendTab = function(config) {
		if (main.tabsByPageID == undefined) main.tabsByPageID = {};
		if (main.tabsByPageID[object.pageID] == undefined) main.tabsByPageID[object.pageID] = object.tabs;
		if (main.tabMapperByPageID == undefined) main.tabMapperByPageID = {};
		if (main.tabMapperByPageID[object.pageID] == undefined) main.tabMapperByPageID[object.pageID] = object.tabMapper;
		object.tabs = main.tabsByPageID[object.pageID];
		object.tabMapper = main.tabMapperByPageID[object.pageID];
		if (object.tabs.length == 0) {
			if (object.isTabVisible) {
				object.tabs.push(
					{
						page: object,
						value: object.pageID,
						label: object.tabTitle ? object.tabTitle:object.title,
						order: '0.0',
					}
				)
				object.tabMapper[object.pageID] = object;
			}
		}
		if (object.tabMapper[config.page.pageID] != undefined) return;
		object.tabs.push(
			{
				page: config.page,
				value: config.page.pageID,
				label: config.label,
				order: config.order,
			}
		)
		object.tabs.sort((a,b) => parseFloat(a.order) - parseFloat(b.order));
		object.tabMapper[config.page.pageID] = config.page;
	}
	
	this.appendTabButton = async function(modelName, config){
		if(config == undefined) config = {};
		let buttons = [];
		if(config.hasFilter) buttons.push({'cssClass': 'filter_button', 'ID': 'filter', 'icon': 'Filter'});
		let tabButton = await object.renderTabButton(buttons);
		if(config.hasFilter){
			tabButton.filter.onclick = async function(){
				await object.page.renderSearchForm(modelName, {data : object.filter});
				// await object.page.renderSearchDialog(modelName, {data : object.filter});
				await object.page.home.dom.filter.toggle();
			}
		}
		return tabButton;
	}
	
	this.getButton = async function(config){
		let button = new DOMObject(TEMPLATE.Button, config);
		return button;
	}

	this.getTabMenu = async function(menus){
		let menuDict = {};
		for(let i in menus){
			let menu = new DOMObject(TEMPLATE.TabMenu, menus[i]);
			menuDict[menus[i].value] = menu;
		}
		return menuDict;
	}
	
	this.renderTabMenu = async function(menus = []){
		let mergedMenu = [];
		if (object.tabs.length > 0) {
			mergedMenu.push(...object.tabs);
		}
		mergedMenu.push(...menus);
		let tabMenu = await object.getTabMenu(mergedMenu);
		object.home.dom.menuList.html('');
		for(let i in tabMenu){
			object.home.dom.menuList.append(tabMenu[i]);
			object.home.dom.menuList[i] = tabMenu[i].dom[i];
			if (object.tabMapper[i] != undefined) {
				await object.initTabMenuEvent(tabMenu[i].dom[i], object.tabMapper[i]);
			}
		}
		object.home.dom.menu.classList.remove('hidden');
		return object.home.dom.menuList;
	}

	this.renderTabMenuFromTags = async function(tabMenu = []){
		object.home.dom.menuList.html('');
		for(let i in tabMenu){
			object.home.dom.menuList.append(tabMenu[i]);
			object.home.dom.menuList[i] = tabMenu[i].dom[i];
			if (object.tabMapper[i] != undefined) {
				await object.initTabMenuEvent(tabMenu[i].dom[i], object.tabMapper[i]);
			}
		}
		object.home.dom.menu.classList.remove('hidden');
		return object.home.dom.menuList;
	}

	this.getTabMenuList = async function(menus = []){
		let tabMenuList = []
		let mergedMenu = [];
		if (object.tabs.length > 0) {
			mergedMenu.push(...object.tabs);
		}
		mergedMenu.push(...menus);
		let tabMenu = await object.getTabMenu(mergedMenu);
		for(let i in tabMenu){
			tabMenuList.push(tabMenu[i]);
			if (object.tabMapper[i] != undefined) {
				await object.initTabMenuEvent(tabMenu[i].dom[i], object.tabMapper[i]);
			}
		}
		return tabMenuList;
	}

	this.initTabMenuEvent = async function(tab, page) {
		// console.log(tab, page);
		let url = await page.getPageStateURL({isRenderFromTab: true, tabPageID: object.pageID});
		let link = tab.getElementsByTagName('a')[0];
		link.href = url;
		link.onclick = async function(e) {
			e.preventDefault();
		}
		tab.onclick = async function() {
			let isChangeState = true;
			if (tab.classList.contains('highlightTab')) isChangeState = false;
			SHOW_LOADING_DIALOG(async function() {
				await page.onPrepareState();
				await page.render({
					isRenderFromTab: true,
					tabPageID: object.pageID
				});
				if (isChangeState){
					await page.setPageState({
						isRenderFromTab: true,
						tabPageID: object.pageID
					});
				}
			});
			
		}
	}
	
	this.getTabButton = async function(buttons){
		let buttonDict = {};
		object.home.dom.buttonList.html('');
		for(let i in buttons){
			buttons[i].svg = (await CREATE_SVG_ICON(buttons[i].icon)).icon;
			let button = new DOMObject(TEMPLATE.TabButton, buttons[i]);
			buttonDict[buttons[i].ID] = button;
		}
		return buttonDict;
	}
	
	this.renderTabButton = async function(buttons, tabButton){
		if(tabButton == undefined) tabButton = await object.getTabButton(buttons);
		for(let i in tabButton){
			object.home.dom.buttonList.append(tabButton[i]);
			object.home.dom.buttonList[i] = tabButton[i].dom[i];
		}
		object.home.dom.menu.classList.remove('hidden');
		return object.home.dom.buttonList;
	}
	
	this.getTagCard = async function(data){
		data.label = `${data.name} (${data.supplierID.name})`;
		data.SVG = await CREATE_SVG_ICON('Close');
		let tagCard = new DOMObject(await TEMPLATE.TagCard, data);
		return tagCard;
	}

	this.setHighlightTab = async function(classList, tag){
		for(let i in classList){
			if(typeof(classList[i]) == 'object'){
				classList[i].classList.remove('highlightTab');
			}
		}
		tag.classList.add('highlightTab');
	}

	this.getPageNumber = async function() {
		return object.pageNumber;
	}

	this.setPageNumber = async function(pageNumber) {
		object.pageNumber = pageNumber;
	}

	this.createDateFilter = async function(){
		if(object.home == undefined) return;
		console.log(TEMPLATE.DateFilter);
		let filterDate = new DOMObject(TEMPLATE.DateFilter);
		if (object.dateFilter == undefined) object.dateFilter = {}
		filterDate.dom.startDate.onchange = async function(){
			let limit = parseInt(object.home.dom.limit.value);
			SHOW_LOADING_DIALOG(async function(){
				object.dateFilter.start = filterDate.dom.startDate.value;
				object.dateFilter.end = filterDate.dom.endDate.value;
				await object.getData(limit);
			});
		}
		filterDate.dom.endDate.onchange = async function(){
			let limit = parseInt(object.home.dom.limit.value);
			SHOW_LOADING_DIALOG(async function(){
				object.dateFilter.start = filterDate.dom.startDate.value;
				object.dateFilter.end = filterDate.dom.endDate.value;
				await object.getData(limit);
			});
		}
		// filterDate.dom.startDate.value = object.dateFilter.start;
		let now = new Date()
		if (object.dateFilter.end == undefined) {
			let date = now.getDate() < 10 ? '0'+now.getDate() : now.getDate();
			let month = (now.getMonth()+1) < 10 ? '0'+(now.getMonth()+1) : now.getMonth()+1;
			let year = now.getFullYear();
			let endDate = `${year}-${month}-${date}`;
			filterDate.dom.endDate.value = endDate;
			object.dateFilter.end = endDate;
		} else {
			filterDate.dom.endDate.value = object.dateFilter.end;
		}
		if (object.dateFilter.start == undefined) {
			let startDate = `1970-01-01`;
			filterDate.dom.startDate.value = startDate;
			object.dateFilter.start = startDate;
		} else {
			filterDate.dom.startDate.value = object.dateFilter.start;
		}
		object.home.dom.button.prepend(filterDate);
	}

	this.getFilter = function(limit = 10) {
		object.limit = limit;
		return {
			pageNumber: object.pageNumber,
			limit: limit,
			data : object.filter
		}
	}
}