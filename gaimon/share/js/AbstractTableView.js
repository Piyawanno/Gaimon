const AbstractTableView = function(page) {
	let object = this;

	object.page = page;
	object.isAppendColumnGroup = true;
	object.prerequisiteCache = {};
	object.avatar;

	this.getView = async function(modelName, config, viewType) {
		let pagination;
		let componentTemplate;
		if (config == undefined) config = {};
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
		} else {
			return;
		}
		config = await object.getConfig(config, viewType);
		let data = config.data;
		let input = await object.getColumn(modelName, config, viewType);
		object.avatar = await AbstractInputUtil.prototype.getAvatar(modelName);
		config.avatar = object.avatar;
		config.hasAvatarURL = false;
		config.avatarColumn = 'id';
		if (typeof object.avatar == 'object') {
			config.avatar = object.avatar.url;
			config.hasAvatarURL = true;
			config.avatarColumn = object.avatar.column;
		}
		let component = new DOMObject(componentTemplate, config);
		component.input = input;
		if (component.dom.card) component.dom.table = component.dom.card;
		if (component.dom.table) component.dom.table.limit = 10;
		let thead;
		if (viewType == 'Table' || viewType == 'TableForm') {
			thead = await object.getTableHeader(modelName, config, viewType, input);
			if (object.isAppendColumnGroup) component.dom.table.prepend(await object.appendColumnGroup(input.length));
			component.dom.thead.append(thead);
		}
		component.records = [];
		component.selectedRecords = [];
		await object.initViewEvent(component, modelName, config, viewType);
		if(config.count != undefined){
			component.pageNumber = 1;
			pagination = await object.getPagination(component.limit, config.count, component);
			component.pagination = pagination;
		}
		await component.createMultipleRecord(data);
		await object.initSelectEvent(component, thead);
		
		if (pagination == undefined) return component;
		return {component, pagination};
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
		let recordTemplate;
		let operationTemplate;
		if (viewType == 'Table') {
			recordTemplate = TEMPLATE.TableBody;
			operationTemplate = TEMPLATE.TableOperationRecord;
		} else if (viewType == 'Card') {
			recordTemplate = TEMPLATE.CardDetail;
			operationTemplate = TEMPLATE.MobileOperation;
		} else if (viewType == 'TableForm') {
			return await object.page.tableForm.getRecord(modelName, config, column, table, viewType);
		} else {
			return;
		}
		let tasks = {};
		let prerequisiteTasks = {}
		let data = config.data;
		let list = [];
		if (column == undefined) column = table.input;
		for(let item of column){
			let value = await object.getColumnValue(item, data);
			if (item.typeName == "ReferenceSelect" || item.typeName == "AutoComplete") {
				if (item.tableURL != undefined && data[item.columnName] != null) {
					if (tasks[item.tableURL] == undefined) tasks[item.tableURL] = [];
					tasks[item.tableURL].push({column: item.columnName, value: data[item.columnName]})
				}
			} else if (item.typeName == "PrerequisiteReferenceSelect") {
				let prerequisite = item.prerequisite.split('.')[1];
				if (item.tableURL != undefined && data[item.columnName] != null) {
					if (prerequisiteTasks[item.tableURL] == undefined) prerequisiteTasks[item.tableURL] = [];
					prerequisiteTasks[item.tableURL].push({column: item.columnName, value: [data[prerequisite], data[item.columnName]]})
				}
			}
			let option = {
				'align': item.isNumber == true ? 'right' : '',
				'value': value,
				'key': item.columnName,
				'label': item.label,
				'isHidden': item.typeName == 'Hidden' ? true : false
			}
			list.push(option);
		}
		let now = new Date();
		let options = {
			'id': data != undefined ? data.id : -1,
			'rootURL': rootURL,
			'tbody': list, 
			'index': config.index,
			'hasView': config.hasView,
			'hasAvatar': config.hasAvatar,
			'hasEdit': config.hasEdit, 
			'hasDelete': config.hasDelete, 
			'hasSelect': config.hasSelect,
			'hasIndex': config.hasIndex,
			'cssClass': config.cssClass,
			'avatar': config.avatar,
			'hasAvatarURL': config.hasAvatarURL,
			'avatarColumn': config.avatarColumn,
			'avatarID': data[config.avatarColumn],
			'timestamp': now.getTime()
		};
		let record = new DOMObject(recordTemplate, options);
		record.id = data.id;
		record.uid = `${randomString(10)}_${Date.now()}`;
		record.modelName = modelName;
		record.record = data;
		record.tasks = tasks;
		record.prerequisiteTasks = prerequisiteTasks;
		await object.renderOperation(record, operationTemplate, config);
		if(config.hasView){
			record.dom.view.onclick = async function(){
				if(config.viewFunction != undefined) config.viewFunction(data.id);
				else if (table.onViewRecord != undefined) await table.onViewRecord(record);
				else{
					await object.page.renderForm(modelName, {data: data, isView: true});
				}
			}
		}
		if(config.hasEdit){
			record.dom.edit.onclick = async function(){
				if(config.editFunction != undefined) config.editFunction(data.id);
				else if (table.onEditRecord != undefined) await table.onEditRecord(record);
				else await object.page.renderForm(modelName, {data: data, isView: false});
			}
		}
		if(config.hasDelete){
			record.dom.delete.onclick = async function(){
				SHOW_CONFIRM_DELETE_DIALOG('Do you want to delete this data?', async function(){
					let index = table.records.indexOf(record);
					if (index > -1) table.records.splice(index, 1);
					record.html.remove();
					if(config.deleteFunction != undefined){
						object.page.delete(record);
						config.deleteFunction(data.id);
					} else {
						object.page.delete(record);
						if (table.onDeleteRecord != undefined) await table.onDeleteRecord(record);
						else if (record.onDelete != undefined) await record.onDelete(data);
					}
				});
			}
		}
		let contextMenu = new DOMObject(TEMPLATE.ContextMenu, config);
		record.contextMenu = contextMenu;
		record.html.append(contextMenu);
		let recordMouseDown;
		record.html.oncontextmenu = async function(e){
			e.preventDefault();
			let contextMenuList = main.body.querySelectorAll('.contextMenu');
			for(let i in contextMenuList){
				if(typeof(contextMenuList[i]) == 'object'){
					contextMenuList[i].classList.add('hidden');
				}
			}
		}
		record.html.onmousedown = async function() {
			recordMouseDown = setTimeout(function() {
				if (record.html.classList.contains('selected')) record.html.classList.remove('selected');
				else record.html.classList.add('selected');
			}, 300);
		}
		record.html.onmouseup = async function(){
			clearTimeout(recordMouseDown);
		}
		return record;
	}

	this.renderView = async function(modelName, config, viewType) {
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
				await object.page.renderForm(modelName);
			}
		}
		if (object.page.config.hasFilter) {
			object.page.home.dom.search.onclick = async function() {
				await object.page.renderSearchForm(modelName, {data : object.filter});
				// await object.page.renderSearchDialog(modelName, {data : object.filter});
				await object.page.home.dom.filter.toggle();
			}
		}
		if (object.page.config.hasLimit) {
			object.page.home.dom.limit.onchange = async function() {
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

	this.getPagination = async function(limit, count, component){
		if (limit == undefined || isNaN(parseInt(limit))) limit = object.page.limit;
		limit = parseInt(limit);
		let options = {
			pageNumber: await object.page.getPageNumber(),
			limit: count
		}
		if (component.getPageNumber) options.pageNumber = await component.getPageNumber();
		let pagination = new DOMObject(TEMPLATE.Pagination, options);
		pagination.dom.firstPage.onclick = async function(){
			if (component && component.limit && typeof component.limit == 'object') limit = parseInt(component.limit.value);
			SHOW_LOADING_DIALOG(async function(){
				if (component && component.setPageNumber) component.setPageNumber(1);
				else await object.page.setPageNumber(1);
				if (component && component.renderFunction) component.renderFunction(limit);
				else await object.page.getData(limit);
			});			
		}
		pagination.dom.backPage.onclick = async function(){
			let pageNumber;
			if (component && component.getPageNumber) pageNumber = component.getPageNumber();
			else pageNumber = await object.page.getPageNumber();
			pageNumber = pageNumber - 1;
			if(pageNumber < 1) pageNumber = 1;
			if (component && component.limit && typeof component.limit == 'object') limit = parseInt(component.limit.value);
			SHOW_LOADING_DIALOG(async function(){
				// await object.page.setPageNumber(pageNumber);
				// await object.page.getData(limit);
				if (component && component.setPageNumber) component.setPageNumber(pageNumber);
				else await object.page.setPageNumber(pageNumber);
				if (component && component.renderFunction) component.renderFunction(limit);
				else await object.page.getData(limit);
			});
		}
		pagination.dom.pageNumber.onkeyup = async function(event){
			if(event.keyCode == 13){
				let pageNumber = parseInt(this.value);
				if(pageNumber < 1) pageNumber = 1;
				if(pageNumber > count) pageNumber = count;
				if (component && component.limit && typeof component.limit == 'object') limit = parseInt(component.limit.value);
				SHOW_LOADING_DIALOG(async function(){
					// await object.page.setPageNumber(pageNumber);
					// await object.page.getData(limit);
					if (component && component.setPageNumber) component.setPageNumber(pageNumber);
					else await object.page.setPageNumber(pageNumber);
					if (component && component.renderFunction) component.renderFunction(limit);
					else await object.page.getData(limit);
				});
			}
		}
		pagination.dom.nextPage.onclick = async function(){
			let pageNumber;
			if (component && component.getPageNumber) pageNumber = component.getPageNumber();
			else pageNumber = await object.page.getPageNumber();
			pageNumber = pageNumber + 1;
			if(pageNumber > count) pageNumber = count;
			if (component && component.limit && typeof component.limit == 'object') limit = parseInt(component.limit.value);
			SHOW_LOADING_DIALOG(async function(){
				// await object.page.setPageNumber(pageNumber);
				// await object.page.getData(limit);
				if (component && component.setPageNumber) component.setPageNumber(pageNumber);
				else await object.page.setPageNumber(pageNumber);
				if (component && component.renderFunction) component.renderFunction(limit);
				else await object.page.getData(limit);
			});
		}
		pagination.dom.lastPage.onclick = async function(){
			if (component && component.limit && typeof component.limit == 'object') limit = parseInt(component.limit.value);
			SHOW_LOADING_DIALOG(async function(){
				// await object.page.setPageNumber(count);
				// await object.page.getData(limit);
				if (component && component.setPageNumber) component.setPageNumber(count);
				else await object.page.setPageNumber(count);
				if (component && component.renderFunction) component.renderFunction(limit);
				else await object.page.getData(limit);
			});
		}
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
					item.target.innerHTML = result[item.value].label;
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
			for (let item of data) {
				if (item == null || item == undefined) continue; 
				let record = await table.createRecord(item);
				for (let url in record.tasks) {
					if (tableTasks[url] == undefined) tableTasks[url] = {item: [], id: {}};
					for (let task of record.tasks[url]) {
						let parameter = JSON.parse(JSON.stringify(task));
						parameter.target = record.dom[parameter.column];
						tableTasks[url].item.push(parameter)
						tableTasks[url].id[parameter.value] = parameter.value;
					}
				}
				for (let url in record.prerequisiteTasks) {
					if (prerequisiteTableTasks[url] == undefined) prerequisiteTableTasks[url] = {item: [], id: {}};
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
		table.createRecord = async function(data) {
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
			table.dom.tbody.append(tbody, 'records');
			if (table.records) table.records.push(tbody);
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
		if (config.hasAvatar == undefined) {
			if (object.page.hasAvatar != undefined) config.hasAvatar = object.page.hasAvatar;
			if (object.page.config != undefined && object.page.config.hasAvatar != undefined) config.hasAvatar = object.page.config.hasAvatar;
			else config.hasAvatar = true;
		} if (config.hasIndex == undefined) config.hasIndex = true;
		if (config.hasEdit == undefined) config.hasEdit = true;
		if (config.hasDelete == undefined) config.hasDelete = true;
		if (config.hasSelect == undefined) config.hasSelect = false;
		if (config.style == undefined) config.style = '';
		if (config.operation == undefined) config.operation = [];
		if (viewType == "TableForm") {
			config.hasEdit = false;
		}
		config.operation = config.operation.concat(await object.getDefaultOperation(config.hasEdit, config.hasDelete, config.hasView));
		return config;
	}

	this.getColumnValue = async function(column, data) {
		let value = "";
		if (data == undefined) return value;
		if (column.typeName == "EnumSelect" || column.typeName == "Select" || column.typeName == "EnumCheckBox") {
			value = data[column.columnName];
			for (let j in column.option) {
				if (column.option[j].value == value) return column.option[j].label;
			}
		} else if (column.typeName == "Enable") {
			value = data[column.columnName];
			if (value) value = 'Enable'
			else value = 'Disable'
		} else if (column.typeName == "ReferenceSelect") {
			if (column.option != undefined) {
				column.optionMap = {}
				for (let option of column.option) {
					column.optionMap[option.value] = option.label;
				}
			}
			if (column.optionMap == undefined) return "-";
			if (column.optionMap[data[column.columnName]] == undefined) return "-";
			if (column.optionMap[data[column.columnName]] != undefined) value = column.optionMap[data[column.columnName]]
		} else if (column.typeName == "PrerequisiteReferenceSelect") {
			if (column.tableURL) return '-';
			value = data[column.columnName];
			let prerequisite = column.prerequisite.split('.');
			prerequisite = data[prerequisite[prerequisite.length-1]];
			if (prerequisite != undefined && prerequisite != -1) {
				let results;
				if (object.prerequisiteCache[column.url+prerequisite] == undefined) {
					let response = await GET(column.url+prerequisite, undefined, 'json', true);
					if (!response.isSuccess) return "-";
					results = response.results;
					if (response.result != undefined) results = response.result;
					object.prerequisiteCache[column.url+prerequisite] = {time: Date.now(), results: results};
				} else if (object.prerequisiteCache[column.url+prerequisite].time - Date.now() > 5000){
					let response = await GET(column.url+prerequisite, undefined, 'json', true);
					if (!response.isSuccess) return "-";
					results = response.results;
					if (response.result != undefined) results = response.result;
					object.prerequisiteCache[column.url+prerequisite] = {time: Date.now(), results: results};
				} else {
					results = object.prerequisiteCache[column.url+prerequisite].results;
				}
				let valueMap = {};
				try {
					valueMap = results.reduce((a, v) => ({ ...a, [v.value]: v.label}), {});
				} catch (error) {
					// console.error(error);
				}
				if (valueMap[value] == undefined){
					return "-"
				}
				value = valueMap[value];
			} else {
				return '-'
			}
		} else if (column.typeName == "AutoComplete") {
			if (column.tableURL) return '-';
			if(data[column.columnName] == '') return value;
			let response = await POST(`${column.url}/by/reference`, {'reference': data[column.columnName]}, undefined, 'json', true);
			if (response == undefined) return value;
			if (response.isSuccess) value = response.label;
		} else if(column.typeName == "Fraction") {
			let fraction = data[column.columnName];
			value = (new Fraction(fraction)).toString();
			value = new Intl.NumberFormat('th-TH', {}).format(value);
		} else if (column.typeName == "Currency") {
			let currency = data[column.columnName];
			if (typeof currency != 'object') {
				value = new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB'}).format(currency);
			} else {
				value = new Intl.NumberFormat('th-TH', { style: 'currency', currency: currency.originCurrency}).format(currency.originValue);
			}
		} else if (column.typeName == "Number") {
			value = new Intl.NumberFormat('th-TH', {}).format(data[column.columnName]);
		} else if (column.typeName == "FileMatrix") {
			value = JSON.parse(data[column.columnName]);
		} else if (column.typeName == "Color") {
			value = `<input style="width:100%;" type="color" disabled value="${data[column.columnName]}"/>`
		} else if (column.typeName == "Status") {
			let item = data[column.columnName];
			let classList = item.classList != undefined ? item.classList.join(" "): "";
			value = `<div class="status_flag ${classList}"><span class="tooltiptext">${item.label}</span></div>`
		} else if (column.typeName == "Image") {
			let item = data[column.columnName];
			let icon = await CREATE_SVG_ICON("Image");
			let template = `
					<div class="flex center">
						<div class="abstract_operation_button " rel="view" onclick="">${icon.icon}</div>
					</div>
					`
			value = template;
		} else if (column.typeName == "Date") {
			if (data[column.columnName] != undefined && data[column.columnName] != 0) {
				value = new Intl.DateTimeFormat(LANGUAGE, {day: "2-digit", month: "2-digit", year: "numeric"}).format(new Date(data[column.columnName]))
			}
		} else if (column.typeName == "DateTime") {
			if (data[column.columnName] != undefined && data[column.columnName] != 0) {
				value = new Intl.DateTimeFormat(LANGUAGE, {day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false}).format(new Date(data[column.columnName]))
			}
		} else if (column.optionMap != undefined) {
			value = data[column.columnName];
		} else {
			value = data[column.columnName];
		}
		return value
	}
}