
/**
 * 
 * @param {string} pageName 
 * @returns
 */
AbstractPage.prototype.generate = async function(pageName) {
	return new Promise(function(resolve, reject) {
		let script = document.createElement("script");
		script.onchange = function() {
			resolve(eval(pageName));
			if (callback != undefined) callback();
		}
		let command = `(typeof ${pageName} === 'undefined');`
		let notExist = eval(command);
		if(notExist){
			script.innerHTML = `const ${pageName} = function(main, parent) {
				AbstractPage.call(this, main, parent);
				let object = this;
				this.register = async function() {}
			};`;
			document.getElementsByTagName("head")[0].appendChild(script);
		}else{
			console.log(`${pageName} exists.`)
		}
		script.onchange();
	});
}

AbstractPage.prototype.create = async function(scriptName, main, parent) {
	let extension = main.scriptNameExtensionMapper[scriptName];
	let scriptType = eval(`typeof ${scriptName}`);
	let pageClass = undefined;
	if(scriptName != 'General'){
		if(scriptType === 'undefined'){
			pageClass = await GET_JS_EXTENSION(extension, scriptName);
		}else{
			pageClass = eval(scriptName);
		}
	}
	let object;
	if (pageClass != undefined) {
		object = new pageClass(main, parent);
		object.extension = extension;
		object.isGenerate = false;
	} else {
		let pageName = GET_PAGE_NAME(scriptName);
		pageClass = await AbstractPage.prototype.generate(pageName);
		object = new pageClass(main, parent);
		object.isGenerate = true;
	}
	await object.initJS();
	return object;
	
}

AbstractPage.prototype.init = async function() {
	let object = this;
	await object.prepare();
	await object.render();
}

AbstractPage.prototype.renderState = async function(state) {
	let object = this;
}

AbstractPage.prototype.render = async function(config) {
	if (config == undefined) config = {};
	if (config.isInit == undefined) config.isInit = true;
	if (config.isRenderFromTab == undefined) config.isRenderFromTab = false;
	if (!config.isInit) return;
	let object = this;
	await object.preload();
	if(object.title == undefined) object.title = object.pageID.replace(/([A-Z])/g, ' $1').trim();
	if(object.config == undefined) object.config = {};
	if(object.config.hasView == undefined) object.config.hasView = true;
	if(object.config.hasAdd == undefined) object.config.hasAdd = true;
	if(object.config.hasFilter == undefined) object.config.hasFilter = true;
	if(object.config.hasLimit == undefined) object.config.hasLimit = true;
	if(object.config.hasTableView == undefined) object.config.hasTableView = true;
	if(object.config.hasDateFilter == undefined) object.config.hasDateFilter = false;
	if(!CHECK_PERMISSION_USER(object.extension, object.role, ['WRITE'])) object.config.hasAdd = false;
	object.home = new DOMObject(TEMPLATE.AbstractPage, {
		name: object.title,
		hasAdd: object.config.hasAdd,
		hasFilter: object.config.hasFilter,
		hasLimit: object.config.hasLimit,
		hasTableView: object.config.hasTableView
	});
	if (object.tabs.length > 0) {
		await object.renderTabMenu();
		let classList = object.home.dom.menuList.getElementsByClassName('abstract_tab_menu');
		if (object.main.pageIDDict[object.pageID].isTabVisible) {
			await object.setHighlightTab(classList, object.home.dom.menuList[object.pageID]);
		} else {
			object.tabs[0].page.render({isRenderFromTab: true, isSetState: false, tabPageID: object.pageID});
		}
		
	} else if (config.isRenderFromTab) {
		let tags = await object.main.pageIDDict[config.tabPageID].getTabMenuList();
		await object.renderTabMenuFromTags(tags);
		let classList = object.home.dom.menuList.getElementsByClassName('abstract_tab_menu');
		await object.setHighlightTab(classList, object.home.dom.menuList[object.pageID]);
	}

	if (object.config.hasDateFilter) {
		await object.createDateFilter();
	}

	object.main.home.dom.container.html('');
	object.main.home.dom.container.appendChild(object.home.html);

	if(object.config.hasTableView){
		if(main.tableViewType == 'Card'){
			object.home.dom.cardView.classList.add('highlight');
			object.home.dom.tableView.classList.remove('highlight');
		}else if(main.tableViewType == 'Table'){
			object.home.dom.cardView.classList.remove('highlight');
			object.home.dom.tableView.classList.add('highlight');
		}
	}

	if(object.config.hasTableView){
		if (object.home.dom.cardView) {
			object.home.dom.cardView.onclick = async function(){				
				main.tableViewType = 'Card';
				RENDER_STATE();
			}
		}
		if (object.home.dom.tableView) {
			object.home.dom.tableView.onclick = async function(){
				main.tableViewType = 'Table';
				RENDER_STATE();
			}
		}
	}
	if (object.restURL == undefined) return;
	await object.getData(object.limit);
}

AbstractPage.prototype.getData = async function(limit=10){
	let object = this;
	if (object.restURL == undefined) return;
	object.limit = limit;
	let data = {
		pageNumber: object.pageNumber,
		limit: limit,
		data : object.filter
	}
	let result = await object.restProtocol.getAll(data);
	result.hasView = true;
	if (object.config) {
		result.hasView = object.config.hasView == undefined ? true : object.config.hasView;
		result.hasEdit = object.config.hasEdit;
		result.hasDelete = object.config.hasDelete;
		result.hasSelect = object.config.hasSelect;
	}
	object.defaultTable = await object.renderTableView(object.model, result, main.tableViewType);
}


AbstractPage.prototype.search = async function(form) {
	return form.getData();
}

AbstractPage.prototype.submit = async function(form) {
	return form.getData();
}

AbstractPage.prototype.cancel = async function() {
	window.history.back();
}

AbstractPage.prototype.edit = async function(tag) {
	return tag;
}

AbstractPage.prototype.delete = async function(tag) {
	return tag;
}

AbstractPage.prototype.renderLocalize = async function() {
	
}

AbstractPage.prototype.initViewEvent = async function(view, config, viewType) {
	return await this.view.initViewEvent(view, config, viewType);
}

AbstractPage.prototype.getView = async function(modelName, config, viewType) {
	return await this.view.getView(modelName, config, viewType);
}

AbstractPage.prototype.getBlankView = async function(config, viewType) {
	return await this.view.getBlankView(config, viewType);
}

AbstractPage.prototype.renderByView = async function(externalView, config, viewType) {
	if (config == undefined) config = {};
	let view = await this.view.renderByView(externalView, config, viewType);
	if(config.isView) view.readonly();
	return view;
}

AbstractPage.prototype.renderView = async function(modelName, config, viewType) {
	return await this.view.renderView(modelName, config, viewType);
}

AbstractPage.prototype.renderBlankView = async function(config, viewType) {
	return await this.view.renderBlankView(config, viewType);
}

AbstractPage.prototype.getSearchForm = async function(modelName, config) {
	return await this.view.getView(modelName, config, 'SearchForm');
}

AbstractPage.prototype.renderSearchForm = async function(modelName, config) {
	return await this.view.renderView(modelName, config, 'SearchForm');
}

AbstractPage.prototype.getSearchDialog = async function(modelName, config) {
	return await this.view.getView(modelName, config, 'SearchDialog');
}

AbstractPage.prototype.renderSearchDialog = async function(modelName, config) {
	return await this.view.renderView(modelName, config, 'SearchDialog');
}

AbstractPage.prototype.getForm = async function(modelName, config) {
	return await this.view.getView(modelName, config, 'Form');
}

AbstractPage.prototype.getInnerForm = async function(modelName, config) {
	return await this.view.getInnerView(modelName, config, 'Form');
}

AbstractPage.prototype.renderForm = async function(modelName, config) {
	return await this.view.renderView(modelName, config, 'Form');
}

AbstractPage.prototype.getBlankForm = async function(modelName, config) {
	return await this.view.getBlankView(modelName, config, 'Form');
}

AbstractPage.prototype.renderBlankForm = async function(modelName, config) {
	return await this.view.renderBlankView(modelName, config, 'Form');
}

AbstractPage.prototype.getTableView = async function(modelName, config, viewType) {
	return await this.tableView.getView(modelName, config, viewType);
}

AbstractPage.prototype.renderTableView = async function(modelName, config, viewType) {
	let object = this;
	if(!CHECK_PERMISSION_USER(object.extension, object.role, ['UPDATE'])) config.hasEdit = false;
	if(!CHECK_PERMISSION_USER(object.extension, object.role, ['DROP'])) config.hasDelete = false;
	let table = await this.tableView.renderView(modelName, config, viewType);
	if (this.restProtocol != undefined) {
		table.onDeleteRecord = async function(record) {
			await object.restProtocol.drop(record.record.id);
			RENDER_STATE();
		}
	}
	return table;
}

AbstractPage.prototype.getTable = async function(modelName, config) {
	return await this.tableView.getView(modelName, config, 'Table');
}

AbstractPage.prototype.renderTable = async function(modelName, config) {
	let object = this;
	let table = await this.tableView.renderView(modelName, config, 'Table');
	if (this.restProtocol != undefined) {
		table.onDeleteRecord = async function(record) {
			await object.restProtocol.drop(record.record.id);
			RENDER_STATE();
		}
	}
	return table;
}

AbstractPage.prototype.getTableForm = async function(modelName, config) {
	return await this.tableView.getView(modelName, config, "TableForm");
}

AbstractPage.prototype.getTableFormRecord = async function(modelName, options, input, table) {
	return await this.tableView.getRecord(modelName, options, input, table, "TableForm");
}

AbstractPage.prototype.getPageNumber = async function() {
	return await this.getPageNumber();
}

AbstractPage.prototype.setPageNumber = async function(pageNumber) {
	return await this.setPageNumber(pageNumber);
}

AbstractPage.prototype.getDialog = async function(modelName, config) {
	return await this.view.getView(modelName, config, 'Dialog');
}

AbstractPage.prototype.renderDialog = async function(modelName, config) {
	return await this.view.renderView(modelName, config, 'Dialog');
}

AbstractPage.prototype.getBlankDialog = async function(config) {
	return await this.view.getBlankView(config, 'Dialog');
}

AbstractPage.prototype.renderBlankDialog = async function(config) {
	return await this.view.renderBlankView(config, 'Dialog')
}

AbstractPage.prototype.renderDialogTabMenu = async function(modelName, config) {
	return await this.dialog.renderDialogTabMenu(modelName, config)
}

AbstractPage.prototype.appendDialogContent = async function(dialog, tabValue, inputList, data) {
	return await this.dialog.appendDialogContent(dialog, tabValue, inputList, data)
}

AbstractPage.prototype.appendDialogTable = async function(dialog, tabValue, table) {
	return await this.dialog.appendDialogTable(dialog, tabValue, table)
}

AbstractPage.prototype.setActiveDialogTab = async function(modelName, config) {
	return await this.dialog.setActiveDialogTab(modelName, config)
}