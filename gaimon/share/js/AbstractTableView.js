const AbstractTableView = function(page) {
	let object = this;

	object.page = page;
	object.isAppendColumnGroup = true;
	object.prerequisiteCache = {};
	object.avatar;

	this.getView = async function(modelName, config, viewType) {
		let pagination;
		let componentTemplate = object.getViewTemplate(config, viewType);
		if (componentTemplate == null) return;
		if (config == undefined) config = {};
		config = await object.getConfig(config, viewType);
		let data = config.data;
		let input = await object.getColumn(modelName, config, viewType);
		await object.configureAvatar(modelName, config);
		let component = new InputDOMObject(componentTemplate, config);
		component.input = input;
		await object.prepareViewComponent(component, viewType, modelName);
		await object.initViewEvent(component, modelName, config, viewType);
		if(config.count != undefined){
			component.pageNumber = 1;
			pagination = await object.getPagination(component.limit, config.count, component);
			component.pagination = pagination;
		}
		await component.createMultipleRecord(data);
		await object.initSelectEvent(component, component.currentTableHead);
		if (pagination == undefined) return component;
		return {component, pagination};
	}

	this.prepareViewComponent = async function(component, viewType, modelName){
		let config = component.data;
		let input = component.input;
		if (component.dom.card) component.dom.table = component.dom.card;
		if (component.dom.table) component.dom.table.limit = 10;
		let thead;
		if (viewType == 'Table' || viewType == 'TableForm') {
			thead = await object.getTableHeader(modelName, config, viewType, input);
			if (object.isAppendColumnGroup){
				let columnGroup = await object.appendColumnGroup(input.length)
				component.dom.table.prepend(columnGroup);
			}
			component.dom.thead.append(thead);
		}
		component.currentTableHead = thead;
		component.records = [];
		component.selectedRecords = [];
		return component
	}

	this.configureAvatar = async function(modelName, config){
		object.avatar = await AbstractInputUtil.prototype.getAvatar(modelName);
		config.avatar = object.avatar;
		config.hasAvatarURL = false;
		config.avatarColumn = 'id';
		if (typeof object.avatar == 'object') {
			config.avatar = object.avatar.url;
			config.hasAvatarURL = true;
			config.avatarColumn = object.avatar.column;
		}
	}

	this.getViewTemplate = function(config, viewType){
		let componentTemplate = null;
		if (viewType == 'Table') {
			componentTemplate = TEMPLATE.Table;
			if (config.hasAdd == undefined) config.hasAdd = true;
		} else if (viewType == 'Card') {
			componentTemplate = TEMPLATE.Card;
		} else if (viewType == 'TableForm') {
			componentTemplate = TEMPLATE.Table;
			config.isTableForm = true;
			if (config.hasAdd == undefined) config.hasAdd = true;
			if (config.isView) {
				config.hasAdd = false;
				config.hasDelete = false;
			}
		}
		return componentTemplate;
	}

	this.renderOperation = async function(record, operationTemplate, config) {
		for(let i in config.operation){
			let svg = await CREATE_SVG_ICON(config.operation[i].icon);
			config.operation[i].isSVG = svg.isSVG;
			config.operation[i].svg = svg.icon;
			let operation = new DOMObject(operationTemplate, config.operation[i]);
			if(record.dom.operation != undefined) record.dom.operation.append(operation);
			else record.html.append(operation);
			record.dom[config.operation[i].ID] = operation.dom[config.operation[i].ID];
			if (operation.dom[`${config.operation[i].ID}_td`] != undefined) {
				record.dom[`${config.operation[i].ID}_td`] = operation.dom[`${config.operation[i].ID}_td`];
			}
		}
		if (config.operation.length == 0) {
			if (record.dom.operation) record.dom.operation.hide();
		}
	}

	this.getRecord = async function(modelName, config, column, table, viewType) {
		let state = new TableRecordRenderState(object, modelName, config, column, table, viewType);
		let record = await state.render();
		return record;
	}

	this.setMouseOverOnStatus = async function(record){
		let statusList = record.html.getElementsByClassName('status_flag');
		for(let item in statusList){
			if(typeof(statusList[item]) != 'object') continue;
			statusList[item].onmouseover = async function(){
				let tooltip = statusList[item].getElementsByClassName('tooltiptext');
				tooltip = tooltip[0];
				let width = tooltip.getBoundingClientRect().width;
				tooltip.style.marginLeft = `-${width/2}px`;
			}
		}
	}

	this.renderView = async function(modelName, config, viewType) {
		if(modelName == undefined || modelName == null){
			throw new Error('Model name is not defined.');
		}
		let component, pagination;
		let generalView = await object.getView(modelName, config, viewType);
		if (config == undefined) config = {};
		if (config.count == undefined) {
			component = generalView
		} else {
			component = generalView.component;
			pagination = generalView.pagination;
		}
		component.modelName = modelName;
		object.page.home.dom.table.html('');
		object.page.home.dom.table.append(component);
		if(pagination != undefined) object.page.home.dom.table.append(pagination);
		if (object.page.config.hasAdd) {
			object.page.home.dom.add.onclick = async function(){
				await object.page.renderView(modelName, undefined, 'Form');
			}
		}
		if (object.page.config.hasExcel) object.initExcelEvent();
		if (object.page.config.hasFilter) {
			object.page.home.dom.search.onclick = async function() {
				await object.page.renderSearchForm(modelName, {data : object.filter});
				// await object.page.renderSearchDialog(modelName, {data : object.filter});
				await object.page.home.dom.filter.toggle();
			}
		}
		if (object.page.config.hasLimit) {
			object.page.home.dom.limit.onchange = async function() {
				object.page.home.dom.additionalButton.html('');
				let limit = parseInt(this.value);
				// component.limit = limit;
				SHOW_LOADING_DIALOG(async function(){
					await object.page.setPageNumber(1);
					await object.page.getData(limit);
				});
			}
			// component.limit = parseInt(object.page.home.dom.limit.value);
			component.limit = object.page.home.dom.limit;
		} else if (object.page.home.dom.limit) {
			component.limit = object.page.home.dom.limit;
		}
		return component;
	}

	this.initExcelEvent = async function(){
		object.page.home.dom.downloadTemplate.onclick = async function(){
			object.page.downloadExcelTemplate();
		}
		object.page.home.dom.importExcel.onclick = async function(){
			object.page.home.dom.excelFile.click();
		}
		object.page.home.dom.exportExcel.onclick = async function(){
			object.renderExportExcelDialog();
		}
		object.page.home.dom.excelFile.onchange = async function(){
			if(this.files.length == 0) return;
			object.page.importExcel(this.files[0]);
			this.type = 'text';
			this.type = 'file';
		}
	}

	this.renderExportExcelDialog = async function(){
		await object.page.renderExportExcelDialog(object.page.model);
		object.page.home.dom.excel.show();
	}

	this.getPagination = async function(limit, count, component){
		let state = new TablePaginationRenderState(object, limit, count, component);
		let pagination = await state.render();
		return pagination;
	}

	this.getTableHeader = async function(modelName, config, viewType, column) {
		let headerTemplate;
		let input;
		if (column != undefined) input = column;
		else input =  await object.getColumn(modelName, config, viewType);
		if (viewType == 'Table') {
			headerTemplate = TEMPLATE.TableHead;
		} else if (viewType == 'TableForm') {
			headerTemplate = TEMPLATE.TableFormHead;
		} else {
			return;
		}
		let tableConfig = JSON.parse(JSON.stringify(config));
		tableConfig['thead'] = input;
		let thead = new DOMObject(headerTemplate, tableConfig);
		for(let i in config.operation){
			let operation = new DOMObject(TEMPLATE.TableOperationHead, config.operation[i]);
			thead.html.append(operation);
			if (config.operation[i].ID) {
				for (let i in operation.dom) {
					thead.dom[i] = operation.dom[i];
				}
			}
		}
		// NOTE
		// Colspan with operation length
		let isSetColspan = false;
		if(config.operation.length && isSetColspan){
			let operation = new DOMObject(TEMPLATE.TableOperationHead, {colspan: config.operation.length, label: 'Operation', style: ''});
			thead.html.append(operation);
		}
		return thead;
	}

	this.appendColumnGroup = async function(length){
		let colgroup = '<colgroup>';
		for(let i=0;i<length;i++){
			colgroup += '<col style="min-width:unset !important;width:unset !important;">';
		}
		colgroup += '</colgroup>';
		return new DOMObject(colgroup);
	}

	this.fetchValueFromTasks = async function(tasks) {
		for (let url in tasks) {
			let data = {IDList: []}
			for (let id in tasks[url].id) {
				data.IDList.push(id);
			}
			let response = await POST(url, data);
			if (!response.isSuccess) continue;
			let result = response.result;
			for (let item of tasks[url].item) {
				if (result[item.value] != undefined) {
					let value = result[item.value].label;
					if (tasks[url].foreignModelName) {
						let column = await AbstractInputUtil.prototype.getBaseInputData(tasks[url].foreignModelName);
						if (!column.isDefaultAvatar) {
							let data = {};
							if(result[item.value].avatar != undefined){
								data.__avatar__ = result[item.value].avatar;
							} else if (typeof column.avatar == 'string') {
								data["id"] = "";
								data.__avatar__ = {column: "id", url: column.avatar};
							} else {
								data[column.avatar.column] = item.value;
								data.__avatar__ = column.avatar;
							}
							value = AbstractInputUtil.prototype.getRenderedTemplate(data, result[item.value].label);
						}
					}
					if(typeof value == 'string') item.target.innerHTML = value;
					else item.target.html(value);
				}
			}
		}
	}

	this.fetchValueFromPrerequisiteTasks = async function(tasks) {
		for (let url in tasks) {
			let data = {IDList: []}
			for (let i in tasks[url].id) {
				data.IDList.push(tasks[url].id[i]);
			}
			let response = await POST(url, data);
			if (!response.isSuccess) continue;
			let result = response.result;
			for (let item of tasks[url].item) {
				let key = item.value.join();
				if (result[key] != undefined) {
					item.target.innerHTML = result[key].label;
				}
			}
		}
	}

	this.initViewEvent = async function(table, modelName, config, viewType) {
		let input = table.input;
		table.createMultipleRecord = async function(data) {
			let records = [];
			let tableTasks = {};
			let prerequisiteTableTasks = {};
			if (data == undefined) data = [];
			for (let item of data) {
				if (item == null || item == undefined) continue; 
				let record = await table.createRecord(item);
				for (let url in record.tasks) {
					if (tableTasks[url] == undefined) tableTasks[url] = {item: [], id: {}, foreignModelName: record.tasks[url][0].foreignModelName};
					for (let task of record.tasks[url]) {
						let parameter = JSON.parse(JSON.stringify(task));
						parameter.target = record.dom[parameter.column];
						tableTasks[url].item.push(parameter)
						tableTasks[url].id[parameter.value] = parameter.value;
					}
				}
				for (let url in record.prerequisiteTasks) {
					if (prerequisiteTableTasks[url] == undefined) prerequisiteTableTasks[url] = {item: [], id: {}, foreignModelName: record.prerequisiteTasks[url][0].foreignModelName};
					for (let task of record.prerequisiteTasks[url]) {
						let parameter = JSON.parse(JSON.stringify(task));
						parameter.target = record.dom[parameter.column];
						prerequisiteTableTasks[url].item.push(parameter)
						prerequisiteTableTasks[url].id[parameter.value.join()] = parameter.value;
					}
				}
				records.push(record);
			}
			table.records = records;
			object.fetchValueFromTasks(tableTasks);
			object.fetchValueFromPrerequisiteTasks(prerequisiteTableTasks);
		}
		table.getRecord = async function(data) {
			if (table.records == undefined) table.records = [];
			if (!Array.isArray(table.records)) table.records = [];
			let offset = 0;
			let limit;
			if (table.limit) {
				if (typeof table.limit == 'object') {
					limit = parseInt(table.limit.value);
				} else {
					limit = parseInt(table.limit);
				}
			} else if (object.page.home && object.page.home.dom.limit) {
				limit = parseInt(object.page.home.dom.limit.value);
			}
			if (table.pagination) {
				let pageNumber = parseInt(table.pagination.dom.pageNumber.placeholder.split('/')[0]);
				offset = (pageNumber - 1) * limit;
			}
			let index = offset + (table.records.length + 1);
			let cssClass = '';
			if (data != undefined) cssClass = data.cssClass;
			let options = {
				'data': data,
				// 'rootURL': rootURL,
				'index': index,
				'hasAvatar': config.hasAvatar,
				'hasIndex': config.hasIndex,
				'hasView': config.hasView,
				'hasEdit': config.hasEdit,
				'hasDelete': config.hasDelete,
				'editFunction': config.editFunction,
				'deleteFunction': config.deleteFunction,
				'hasSelect': config.hasSelect,
				'operation': config.operation,
				'isView': config.isView,
				'cssClass': cssClass,
				'avatar': config.avatar,
				'hasAvatarURL': config.hasAvatarURL,
				'avatarColumn': config.avatarColumn,
				'avatarID': data != undefined ? data[config.avatarColumn]: -1,
			}
			let tbody = await object.getRecord(modelName, options, input, table, viewType);
			return tbody;
		}

		table.createRecord = async function(data) {
			let tbody = await table.getRecord(data);
			table.dom.tbody.append(tbody, 'records');
			if (table.records) table.records.push(tbody);
			if (table.onCreateRecord != undefined) await table.onCreateRecord(tbody);
			return tbody;
		}

		table.prependRecord = async function(data) {
			let tbody = await table.getRecord(data);
			table.dom.tbody.prepend(tbody, 'records');
			if (table.records) table.records.unshift(tbody);
			if (table.onCreateRecord != undefined) await table.onCreateRecord(tbody);
			return tbody;
		}
		table.dom.tbody.createMultipleRecord = table.createMultipleRecord;
		table.dom.tbody.createRecord = table.createRecord;
		table.clearRecord = async function() {
			table.dom.tbody.html('');
			table.records = [];
		}
		table.getData = function() {
			let data = [];
			let formData = new FormData();
			let isPass = true;
			for (let i in table.records) {
				let record = table.records[i];
				let result = record.getData();
				isPass = isPass & result.isPass;
				if (record.record != undefined) result.data.id = record.record.id;
				data.push(result.data);
				for (let item of result.file.entries()) {
					formData.append(item[0], item[1])
				}
			}
			return {isPass, data, file: formData};
		}

		if (viewType == 'TableForm') {
			if (table.dom.add != undefined) {
				table.dom.add.onclick = async function() {
					if (table.dom.add.disabled) return;
					let tbody = await table.createRecord();
				}
			}
		}
	}

	this.initSelectEvent = async function(table, thead) {
		if (thead == undefined) return;
		if (thead.dom.checkAll != undefined) {
			thead.dom.checkAll.onclick = function() {
				for (let i in table.records) {
					if(table.records[i].dom.check.getAttribute('disabled') != null) continue;
					table.records[i].dom.check.checked = thead.dom.checkAll.checked;
				}
				if (thead.dom.checkAll.checked) table.selectedRecords = Object.assign([], table.records);
				else table.selectedRecords = [];
			}
		}
		for (let i in table.records) {
			let record = table.records[i];
			if (record.dom.check == undefined) continue;
			record.dom.check.onclick = function() {
				let index = table.selectedRecords.indexOf(record);
				if (record.dom.check.checked) {
					if (index == -1) table.selectedRecords.push(record);
				} else {
					if (index != -1) table.selectedRecords.splice(index, 1);
				}
				let length = table.selectedRecords.length;
				if (length == 0) {
					thead.dom.checkAll.checked = false;
					thead.dom.checkAll.indeterminate = false;
				} else if (length == table.records.length) {
					thead.dom.checkAll.checked = true;
					thead.dom.checkAll.indeterminate = false;
				} else {
					thead.dom.checkAll.indeterminate = true;
				}
			} 
		}
	}

	this.getColumn = async function(modelName, config, viewType) {
		let input;
		if (config != undefined && config.inputs != undefined) input = config.inputs;
		if (input == undefined) input = await object.page.util.getTableInputData(modelName);
		let column = [];
		for(let i in input){
			input[i].width = '150px';
			input[i].isStatus = false;
			if(input[i].typeName == 'Status') input[i].isStatus = true;
			if(input[i].isNumber) input[i].width = '150px';
			if(input[i].typeName == 'AutoComplete' || input[i].typeName == 'TextArea') input[i].width = '300px';
			if(input[i].typeName == 'FileMatrix') input[i].width = '400px';
			if(input[i].typeName == 'Hidden') input[i].isHidden = true;
			if(config.excludeInput && config.excludeInput.includes(input[i].columnName)) continue;
			if(viewType == "TableForm" && !input[i].isForm) continue;
			else if(viewType == "TableForm" || input[i].isTable) column.push(input[i]);
		}
		return column;
	}

	this.getDefaultOperation = async function(hasEdit = true, hasDelete = true, hasView = false){
		let operation = [];
		if(hasView) operation.push({label: 'View', ID: 'view', icon: 'View'});
		if(hasEdit) operation.push({label: 'Edit', ID: 'edit', icon: 'Edit'});
		if(hasDelete) operation.push({label: 'Delete', ID: 'delete', icon: 'Delete'});
		return operation;
	}

	this.getConfig = async function(config, viewType) {
		if (config == undefined) config = {};
		if (config.data == undefined) config.data = [];
		if (config.hasView == undefined) config.hasView = false;
		if (config.hasAvatar == undefined) object.getAvatarConfig(config);
		if (config.hasIndex == undefined) config.hasIndex = true;
		if (config.hasEdit == undefined) config.hasEdit = true;
		if (config.hasDelete == undefined) config.hasDelete = true;
		if (config.hasSelect == undefined) config.hasSelect = false;
		if (config.style == undefined) config.style = '';
		if (config.operation == undefined) config.operation = [];
		if (viewType == "TableForm")  config.hasEdit = false;
		let operation = await object.getDefaultOperation(
			config.hasEdit,
			config.hasDelete,
			config.hasView
		);
		config.operation = config.operation.concat(operation);
		return config;
	}

	this.getAvatarConfig = function(config){
		if (object.page.hasAvatar != undefined){
			config.hasAvatar = object.page.hasAvatar;
		}
		if (object.page.config != undefined && object.page.config.hasAvatar != undefined){
			config.hasAvatar = object.page.config.hasAvatar;
		} else {
			config.hasAvatar = true;
		}
	}

	this.getColumnValue = async function (column, data) {
		return await getColumnValue(object, column, data);
	}
}