let ViewCreatorState = function(parent, modelName, config, viewType){
	let object = this;
	
	if (config == undefined) config = {};
	if (config.showAvatar == undefined) config.showAvatar = true;

	this.parent = parent;
	this.modelName = modelName;
	this.config = config;
	this.viewType = viewType;

	this.page = parent.page;

	this.viewGroupTemplate = null;
	this.isSearchForm = false;
	this.columnLinkMap = {};

	this.finish = false;

	this.create = async function(){
		object.setTitle(object.config, object.viewType);
		object.getGroupTemplate(object.viewType);
		if(object.finish) return;
		let {config, view, input} = await object.createView();
		object.preparedInput = await object.page.util.prepareInput(object.modelName, object.input);
		await object.renderView(config, view, input);
		await object.setPage(config, view);
		object.setEditData(config, view);
		object.parent.setOperationButton(config, view);
		await object.initAdvanceSearch(view);
		object.prepareTable(view, input);
		await object.setTableInput(config, view, input);
		return view;
	}

	this.setTableInput = async function(config, view, input){
		for (let child of input.childInput) {
			let tableConfig = {};
			tableConfig.isView = config.isView;
			tableConfig.title = input.childInputParentMap[child.modelName].title;
			let table = await object.page.tableView.getView(child.modelName, tableConfig, 'TableForm');
			table.modelName = child.modelName;
			table.inputName = input.childInputParentMap[child.modelName].name;
			table.childDetail = input.childInputParentMap[child.modelName];
			view.dom.childTable[child.modelName] = table;
			view.dom.form.tables.push(table);
			if (view.dom.additionalForm) view.dom.additionalForm.append(table);
			if (config.data) {
				if (config.data[table.inputName]) {
					table.onCreateRecord = async function(record){
						record.onDelete = async function(data){
							if(!data) return;
							if(!table.removed) table.removed = [];
							table.removed.push(data.id);
						}
					}
					await table.createMultipleRecord(config.data[table.inputName]);
				}
			}
		}
	}

	this.prepareTable = function(view, input){
		view.dom.childTable = {};
		view.dom.form.tables = [];
		if(!input.childInput) input.childInput = [];
	}

	this.initAdvanceSearch = async function(view){
		// await object.initViewEvent(view, config, viewType);
		let advanceInputMap = object.preparedInput.advanceInputMap;
		if(Object.keys(advanceInputMap).length){
			await object.parent.initAdvanceFormEvent(view, advanceInputMap);
		}
	}

	this.setEditData = function(config, view){
		if (config.hasEdit) {
			view.setData(config.data, ['form']);
			view.id = config.data.id;
		}
	}

	this.setPage = async function(config, view){
		let {exceptURL, autoCompleteMap, fileMatrixMap, imageMap, fileMap, advanceInputMap, inputs} = object.preparedInput;
		await object.page.util.setAutoCompleteMap(view, autoCompleteMap);
		await object.page.util.setFileMatrixMap(view, fileMatrixMap);
		await object.page.util.setImageMap(view, imageMap);
		await object.page.util.setFileMap(view, fileMap);
		await object.page.util.setPrerequisiteInput(modelName, exceptURL, view, config.data);
	}

	this.renderView = async function(config, view, input){
		if(object.viewType == 'SearchDialog'){
			await object.renderSearchDialog(view, input);
		}else if(object.viewType == 'ExportExcelDialog'){
			await object.renderExportExcelDialog(view, input);
		}else{
			await object.renderForm(config, view, input);
		}
	}

	this.renderSearchDialog = async function(view, input){
		let filter = await object.parent.getSearchDialogView(view, input);
		view.dom.form.append(filter);
		view.dom.form.filter = filter;
	}

	this.renderExportExcelDialog = async function(view, input){
		let excel = await object.parent.getExportExcelDialogView(view, input);
		view.dom.form.append(excel);
		view.dom.form.excel = excel;
	}

	this.renderForm = async function(config, view, input){
		if (config.data) {
			object.columnLinkMap = AbstractInputUtil.prototype.getLinkColumn(input, config.data)
		}
		let preventGroup = object.viewType == 'Dialog' && input.length == 1;
		let groupView = await object.createAvatarGroupView(config, view, input);
		let count = 0;
		for (let item of input) {
			if (item.isGroup) {
				if(!preventGroup){
					let isAvatar = (count == 0 && config.showAvatar);
					await object.renderGroupedFormItem(config, view, item, isAvatar);
				}else{
					object.renderFormItemNoGroup(config, view, item.input);
				}
				count += 1;
			}
		}
		for (let item of input) {
			if (view.dom[item.columnName]) continue;
			if(config.isView && groupView != undefined) {
				object.renderFormItem(config, view, item, groupView.dom.group);
			} else {
				object.renderFormItem(config, view, item, view.dom.form);
			}
		}
	}

	this.renderFormItemNoGroup = async function(config, view, input){
		for (let item of input) {
			object.renderFormItem(config, view, item, view.dom.form);
		}
	}

	this.createAvatarGroupView = async function(config, view, input){
		let isGroup = false;
		let group = {
			input: [],
			label: '',
		};
		let groupView;
		for (let item of input) {
			if (item.isGroup){
				isGroup = true;
				break;
			}else{
				group.input.push(item);
				group.inputPerLine = item.inputPerLine;
			}
		}
		if(!isGroup && config.isView && config.showAvatar){
			groupView = new InputDOMObject(object.viewGroupTemplate, group);
			await object.setGroupAvatar(config, groupView);
			view.dom.form.append(groupView, undefined, undefined, view.dom);
		}
		return groupView;
	}

	this.renderFormItemWithAvatar = async function(config, view, item){
		if (!object.isSearchForm || (object.isSearchForm && item.isSearch)) {
			let group = new InputDOMObject(object.viewGroupTemplate, item);
			await object.setGroupAvatar(config, group);
			let tag = await object.parent.appendInput(
				view,
				item,
				config,
				group.dom.group,
				object.isSearchForm
			);
			await object.parent.initInputView(
				tag,
				item,
				config,
				object.columnLinkMap
			);
			view.dom.form.append(group, undefined, undefined, view.dom);
		}
	}

	this.renderFormItem = async function(config, view, item, parent){
		if (!object.isSearchForm || (object.isSearchForm && item.isSearch)) {
			let tag = await object.parent.appendInput(
				view,
				item,
				config,
				parent,
				object.isSearchForm
			);
			await object.parent.initInputView(
				tag,
				item,
				config,
				object.columnLinkMap
			);
		}
	}

	this.renderGroupedFormItem = async function(config, view, item, isAvatar){
		let group = new InputDOMObject(object.viewGroupTemplate, item);
		if (item.input == undefined) return;
		let count = 0;
		for (let subItem of item.input) {
			if (!object.isSearchForm || (object.isSearchForm && subItem.isSearch)) {
				if(count == 0 && config.isView && isAvatar){
					await object.setGroupAvatar(config, group);
				}
				let tag = await object.parent.appendInput(
					view,
					subItem,
					config,
					group.dom.group,
					object.isSearchForm
				);
				await object.parent.initInputView(
					tag,
					subItem,
					config,
					object.columnLinkMap
				);
				count += 1;
			}
		}
		if (count > 0){
			view.dom.form.append(group, undefined, undefined, view.dom);
		}
	}

	this.setGroupAvatar = async function(config, group){
		if(!config.showAvatar) return;
		let avatarConfig = await AbstractInputUtil.prototype.getAvatar(object.modelName);
		if(avatarConfig == undefined || avatarConfig == null){
			avatarConfig = 'share/icon/logo_padding.png';
		}
		let avatar = new Image();
		let isDefault = false;
		if(typeof avatarConfig == 'object'){
			avatar.onerror = function(){
				if(!isDefault) avatar.src = rootURL + avatarConfig.default;
				isDefault = true;
			}
			avatar.src = rootURL+avatarConfig.url+config.data[avatarConfig.column];
		}else{
			avatar.src = rootURL+avatarConfig;
		}
		console.log(avatarConfig);
		avatar.classList.add('abstract_form_avatar');
		if (group.dom.label) group.dom.label.appendChild(avatar);
	}

	this.createView = async function(){
		let view = await object.parent.getBlankView(object.config, object.viewType)
		let input = await object.parent.prepareConfig(object.modelName, object.config);
		let config = await object.parent.getViewConfig(object.config);
		object.view = view;
		object.input = input;
		object.config = config;
		view.dom.form.html('');
		return {config, view, input};
	}

	this.setTitle = function(config, viewType){
		if (config.title != undefined) return;
		if (config.data == undefined) {
			config.prefixTitle = 'Add';
			config.title = `${object.page.title}`;
		} else {
			config.prefixTitle = 'Edit';
			config.title = `${object.page.title}`;
		}
		if(config.isView) {
			config.prefixTitle = 'View';
			config.title = `${object.page.title}`;
		}
		if (viewType == 'SearchForm' || viewType == 'SearchDialog'){
			config.prefixTitle = `Filter`;
			config.title = `${object.page.title}`;
		}
	}

	this.getGroupTemplate = function(viewType){
		if (viewType == 'Form'){
			object.viewGroupTemplate = TEMPLATE.Group;
		} else if (viewType == 'Dialog'){
			object.viewGroupTemplate = TEMPLATE.GroupDialog;
		} else if (viewType == 'SearchForm' || viewType == 'SearchDialog') {
			object.viewGroupTemplate = TEMPLATE.Group;
			object.isSearchForm = true;
		} else if (viewType == 'ConfirmDialog'){
			object.viewGroupTemplate = TEMPLATE.GroupDialog;
		} else if (viewType == 'ExportExcelDialog') {
			object.viewGroupTemplate = TEMPLATE.ExportExcelDialog;
		} else {
			object.finish = true;
		}
	}
}