let TableRecordRenderState = function(parent, modelName, config, column, table, viewType){
	let object = this;
	
	if (column == undefined) column = table.input;

	this.parent = parent;
	this.modelName = modelName;
	this.config = config;
	this.column = column;
	this.table = table;
	this.viewType = viewType;

	this.recordTemplate;
	this.operationTemplate;

	this.page = parent.page;

	this.tasks = {};
	this.prerequisiteTasks = {}
	this.data = config.data;
	this.list = [];
	this.columnLinkMap = [];

	this.finish = false;

	this.render = async function(){
		await object.getTemplate();
		if(object.finish) return object.record;
		await object.processColumn(object.data);
		let option = object.createOption();
		let record = await object.createRecord(option);
		if(object.viewType == 'Table' || object.viewType == 'Card'){
			await object.renderAvatar(record);
		}
		await object.parent.renderOperation(record, object.operationTemplate, object.config);
		object.setRecordEvent(record);
		return record;
	}

	this.setRecordEvent = function(record){
		object.setRecordColumnEvent(record)
		if(config.hasView) object.setViewEvent(record);
		if(config.hasEdit) object.setEditEvent(record);
		if(config.hasDelete) object.setDeleteEvent(record);
		object.setContextMenuEvent(record);
		object.setMouseEvent(record);
	}

	this.renderAvatar = async function(record){
		if(record.dom.avatar == undefined) return;
		let avatar = new Image();
		let data = object.config.data;
		let config = await AbstractInputUtil.prototype.getAvatar(object.modelName);
		let isDefault = false;
		if(typeof config == 'object'){
			avatar.onerror = function(){
				if(!isDefault) avatar.src = rootURL + config.default;
				isDefault = true;
			}
			avatar.src = rootURL+config.url+data[config.column];
		}else{
			avatar.src = rootURL+config;
		}
		record.dom.avatar.appendChild(avatar);
	}

	this.setContextMenuEvent = function(record){
		let contextMenu = new InputDOMObject(TEMPLATE.ContextMenu, object.config);
		record.contextMenu = contextMenu;
		record.html.append(contextMenu);
		record.html.oncontextmenu = async function(e){
			e.preventDefault();
			let contextMenuList = main.body.querySelectorAll('.contextMenu');
			for(let i in contextMenuList){
				if(typeof(contextMenuList[i]) == 'object'){
					contextMenuList[i].classList.add('hidden');
				}
			}
		}
	}

	this.setMouseEvent = function(record){
		let recordMouseDown;
		record.html.onmousedown = async function() {
			recordMouseDown = setTimeout(function() {
				if (record.html.classList.contains('selected')) record.html.classList.remove('selected');
				else record.html.classList.add('selected');
			}, 300);
		}
		record.html.onmouseup = async function(){
			clearTimeout(recordMouseDown);
		}
	}

	this.setEditEvent = function(record){
		let config = object.config;
		let table = object.table;
		if(!record.dom.edit) return;
		record.dom.edit.onclick = async function(){
			if(config.editFunction != undefined){
				config.editFunction(data.id);
			} else if (table.onEditRecord != undefined){
				await table.onEditRecord(record);
			} else {
				let detail = object.data;
				if (object.page.config == undefined) object.page.config = {};
				if (object.page.config.isFetchByID == undefined) object.page.config.isFetchByID = true;
				if (object.page.restProtocol != undefined && object.page.config.isFetchByID) {
					detail = await object.page.restProtocol.getByID(object.data.id);
				}
				await object.page.renderView(
					modelName, {
						data: detail,
						isView: false
					},
					'Form'
				);
			}
		}
	}

	this.setDeleteEvent = function(record){
		let config = object.config;
		let table = object.table;
		if(!record.dom.delete) return;
		record.dom.delete.onclick = async function(){
			SHOW_CONFIRM_DELETE_DIALOG('Do you want to delete this data?', async function(){
				let index = table.records.indexOf(record);
				if (index > -1) table.records.splice(index, 1);
				record.html.remove();
				if(config.deleteFunction != undefined){
					object.page.delete(record);
					config.deleteFunction(object.data.id);
				} else {
					object.page.delete(record);
					if (table.onDeleteRecord != undefined) await table.onDeleteRecord(record);
					else if (record.onDelete != undefined) await record.onDelete(object.data);
				}
			});
		}
	}

	this.setViewEvent = function(record){
		let config = object.config;
		let table = object.table;
		record.dom.view.onclick = async function(){
			if(config.viewFunction != undefined) config.viewFunction(object.data.id);
			else if (table.onViewRecord != undefined) await table.onViewRecord(record);
			else{
				let detail = object.data;
				if (object.page.config == undefined) object.page.config = {};
				if (object.page.config.isFetchByID == undefined) object.page.config.isFetchByID = true;
				if (object.page.restProtocol != undefined && object.page.config.isFetchByID) {
					detail = await object.page.restProtocol.getByID(object.data.id);
				}
				await object.page.renderView(
					modelName, {
						data: detail,
						isView: true
					},
					'Form'
				);
			}
		}
	}

	this.setRecordColumnEvent = function(record){
		let columnLinkMap = object.columnLinkMap;
		for (let column in columnLinkMap) {
			if (record.dom[column] == undefined) continue;
			if (record.dom[`${column}_link`] != undefined) {
				record.dom[`${column}_link`].onclick = async function(e) {
					e.preventDefault();
				}
			}
			record.dom[column].onclick = async function(e) {
				e.preventDefault();
				if (columnLinkMap[column] == '') return;
				if (columnLinkMap[column] == -1) return;
				AbstractInputUtil.prototype.triggerLinkEvent(object.page, columnLinkMap[column]);
				// let value = columnLinkMap[column].value;
				// if (columnLinkMap[column].column.foreignModelName) {
				// 	if (main.pageModelDict[columnLinkMap[column].column.foreignModelName] == undefined) return;
				// 	let modelName = columnLinkMap[column].column.foreignModelName;
				// 	main.pageModelDict[modelName].renderViewFromExternal(modelName, {data: {id: value}, isView: true}, 'Form');
				// } else {
				// 	object.page.renderViewFromExternal(object.page.model, {data: {id: value}, isView: true}, 'Form')
				// }
			}
		}
	}

	this.createRecord = async function(option){
		let record = new InputDOMObject(object.recordTemplate, option);
		await object.parent.setMouseOverOnStatus(record);
		record.id = object.data.id;
		record.uid = `${randomString(10)}_${Date.now()}`;
		record.modelName = modelName;
		record.record = object.data;
		record.tasks = object.tasks;
		record.prerequisiteTasks = object.prerequisiteTasks;
		return record;
	}

	this.createOption = function(){
		let config = object.config;
		let now = new Date();
		return  {
			'id': object.data != undefined ? object.data.id : -1,
			'rootURL': rootURL,
			'tbody': object.list,
			'index': config.index,
			'hasView': config.hasView,
			'hasEdit': config.hasEdit, 
			'hasDelete': config.hasDelete, 
			'hasSelect': config.hasSelect,
			'hasIndex': config.hasIndex,
			'cssClass': config.cssClass,
			'avatar': config.avatar,
			'hasAvatar': config.hasAvatar,
			'hasAvatarURL': config.hasAvatarURL,
			'avatarColumn': config.avatarColumn,
			'avatarID': object.data[config.avatarColumn],
			'timestamp': now.getTime()
		};
	}

	this.getTemplate = async function(){
		if (object.viewType == 'Table') {
			object.recordTemplate = TEMPLATE.TableBody;
			object.operationTemplate = TEMPLATE.TableOperationRecord;
		} else if (object.viewType == 'Card') {
			object.recordTemplate = TEMPLATE.CardDetail;
			object.operationTemplate = TEMPLATE.MobileOperation;
		} else if (object.viewType == 'TableForm') {
			object.record = await object.page.tableForm.getRecord(modelName, config, column, table, viewType);
			object.finish = true;
		} else {
			object.record = undefined;
			object.finish = true;
		}
	}

	this.processColumn = async function(data){
		for(let item of object.column){
			let type = item.typeName;
			if (type == "ReferenceSelect") object.processSelect(item, data);
			else if (type == "ReferenceRadio") object.processSelect(item, data);
			else if(type == "AutoComplete") object.processSelect(item, data);
			else if (type == "PrerequisiteReferenceSelect") object.processPrerequisite(item, data);
			else if (type == "Status") object.processStatus(item, data);
			object.processLink(item, data);
			await object.setColumnOption(item, data);
		}
	}

	this.setColumnOption = async function(item, data){
		let value = await object.parent.getColumnValue(item, data);
		let option = {
			'align': object.getAlign(item),
			'value': value,
			'key': item.columnName,
			'label': item.label,
			'isLink': item.isLink,
			'isStatus': item.isStatus,
			'isHidden': item.typeName == 'Hidden' ? true : false,
		}
		object.list.push(option);
	}

	this.getAlign = function(item){
		let align = '';
		if (item.isNumber) align = 'right';
		else if (item.isStatus) align = 'center';
		return align;
	}

	this.processLink = function(item, data){
		if (item.isLink) {
			let referenceValue = data[item.columnName];
			if (item.linkColumn) {
				referenceValue = data[item.linkColumn];
			}
			object.columnLinkMap[item.columnName] = {
				column: item,
				value: referenceValue
			};
		} else {
			item.isLink = false;
		}
	}

	this.processSelect = function(item, data){
		if (item.tableURL != undefined && data[item.columnName] != null) {
			if (object.tasks[item.tableURL] == undefined){
				object.tasks[item.tableURL] = [];
			}
			object.tasks[item.tableURL].push({
				column: item.columnName,
				value: data[item.columnName],
				foreignModelName: item.foreignModelName
			})
		}
	}

	this.processPrerequisite = function(item, data){
		let prerequisite = item.prerequisite.split('.')[1];
		if (item.tableURL != undefined && data[item.columnName] != null) {
			if (object.prerequisiteTasks[item.tableURL] == undefined){
				object.prerequisiteTasks[item.tableURL] = [];
			}
			object.prerequisiteTasks[item.tableURL].push({
				column: item.columnName,
				value: [data[prerequisite],
				data[item.columnName]],
				foreignModelName: item.foreignModelName
			})
		}
	}

	this.processStatus = function(item, data){
		item.isStatus = true;
	}
}