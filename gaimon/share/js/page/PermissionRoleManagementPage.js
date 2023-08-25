const PermissionRoleManagementPage = function(main, parent) {
	AbstractPage.call(this, main, parent);
	
	let object = this;
	this.title = 'Permission Role';
	this.pageNumber = 1;
	this.limit = 10;

	this.parentTabConfig = [
		{
			'parent': 'UserManagementPage', 
			'label': 'Permission Role',
			'order': '1.0',
		}
	]

	object.role = ['Role'];

	this.prepare = async function() {
	}

	this.render = async function(config) {
		AbstractPage.prototype.render.call(this, config);
		await object.renderRole(object.limit);
	}

	this.renderState = async function(state) {
		if (state.state == 'form') await object.renderForm('UserGroup', {isSetState: false, data: state.data, inputs: state.inputs, isView: state.isView});
	}

	this.getData = async function(limit){
		await object.renderRole(limit);
	}

	this.renderForm = async function(modelName, config = {}) {
		await object.renderRoleForm(modelName, config);
	}

	this.renderRole = async function(limit = 10) {
		let data = {
			pageNumber: object.pageNumber,
			limit: limit
		}
		let results = await main.protocol.user.getAllUserGroup(data);
		results.hasView = true;
		let table = await object.renderTable('UserGroup', results);
	}

	this.renderRoleForm = async function(modelName, config = {}) {
		config.title = 'Add Permission Role';
		if (config.data) config.title = 'Edit Permission Role';
		let form = await AbstractPage.prototype.renderForm.call(this, modelName, config);
		form.dom.form.tables = [];
		let permissions = undefined;
		if (config == undefined) config = {};
		if (config.data != undefined) permissions = config.data.permissions
		table = await object.renderPermissionForm(config);
		form.dom.form.append(table);
		form.dom.form.tables.push(table);
		table.dom.all.onchange = async function(){
			table.dom.none.checked = false;
			for(let i in table.module){
				table.module[i].dom.all.checked = table.dom.all.checked;
				table.module[i].dom.all.onchange();
				for(let j in table.records[i]){
					table.records[i][j].dom.all.checked = table.dom.all.checked;
				}
			}
		}
		table.dom.none.onchange = async function(){
			table.dom.all.checked = false;
			for(let i in table.module){
				table.module[i].dom.all.checked = false;
				table.module[i].dom.all.onchange();
				for(let j in table.records[i]){
					table.records[i][j].dom.all.checked = false;
				}
			}
		}
		object.initRecordEvent(table, config);
	}

	this.initRecordEvent = function(table, config){
		let module = table.module;
		let records = table.records;
		if (config.isView) table.disable();
		for(let i in records){
			for(let j in records[i]){
				let record = records[i][j];
				if (config.isView) record.disable();
				record.dom.all.onchange = async function(){
					record.dom.read.checked = this.checked;
					record.dom.write.checked = this.checked;
					record.dom.update.checked = this.checked;
					record.dom.drop.checked = this.checked;
					record.dom.decision.checked = this.checked;
					if(!this.checked){
						module[i].dom.all.checked = this.checked;
						module[i].dom.read.checked = this.checked;
						module[i].dom.write.checked = this.checked;
						module[i].dom.update.checked = this.checked;
						module[i].dom.drop.checked = this.checked;
						module[i].dom.decision.checked = this.checked;
					}
				}
				record.dom.read.onchange = async function(){
					object.checkTickPermissionType(table, records);
				}
				record.dom.write.onchange = async function(){
					object.checkTickPermissionType(table, records);
				}
				record.dom.update.onchange = async function(){
					object.checkTickPermissionType(table, records);
				}
				record.dom.drop.onchange = async function(){
					object.checkTickPermissionType(table, records);
				}
				record.dom.decision.onchange = async function(){
					object.checkTickPermissionType(table, records);
				}
			}
		}
	}

	this.renderPermissionForm = async function(config){
		let table = new DOMObject(TEMPLATE.PermissionTable);
		table = await object.getPermissionModule(table, config);
		return table;
	}

	this.getPermissionModule = async function(table, config = {}){
		table.records = {};
		table.module = {};
		let module = (await main.protocol.user.getPermissionModule()).results;
		for(let i in module){
			if(module[i].length == 0) continue;
			let permission = [];
			let content = `<tr>`;
			content += await object.getModuleRecord(i);
			content += await object.getPermissionChecker();
			content += `</tr>`;
			let record = new DOMObject(content);
			if (config.isView) record.disable();
			table.dom.tbody.append(record);
			table.module[i] = record;
			for(let j in module[i]){
				let content = `<tr>`;
				content += await object.getSubModuleRecord(i, module[i][j]);
				content += await object.getPermissionChecker();
				content += `</tr>`;
				let record = new DOMObject(content);
				table.dom.tbody.append(record);
				if(table.records[i] == undefined) table.records[i] = [];
				table.records[i].push(record);
				permission.push(record);
				if(config.data != undefined) object.setTickPermissionType(i, module[i][j], config.data, record);
			}
		}
		await object.initModulePermissionEvent(table);
		if(config.data != undefined) object.checkTickPermissionType(table, table.records);
		return table;
	}

	this.getModuleRecord = async function(module){
		let content = `<td style="font-weight:bold;">`;
		content += `<div class="flex gap-5px">`;
		content += `<div><input type="checkbox" rel="all"></div>`;
		content += `<div class="flex-column center"><label class="user-select-none" rel="allLabel" localize>${module}</label>`;
		content += `<input rel="module" class="hidden" value="${module}"></div>`;
		content += `</div>`;
		content += `</td>`;
		return content;
	}

	this.getSubModuleRecord = async function(module, subModule){
		let content = `<td style="padding-left:40px;">`;
		content += `<div class="flex gap-5px">`;
		content += `<div><input type="checkbox" rel="all"></div>`;
		content += `<div class="flex-column center"><label class="user-select-none" rel="allLabel" localize>${subModule}</label>`;
		content += `<input rel="module" class="hidden" value="${module}">`;
		content += `<input rel="permission" class="hidden" value="${subModule}">`;
		content += `</div>`;
		content += `</div>`;
		content += `</td>`;
		return content;
	}

	this.getPermissionChecker = async function(){
		let content = `<td align="center"><input type="checkbox" rel="read"></td>`;
		content += `<td align="center"><input type="checkbox" rel="write"></td>`;
		content += `<td align="center"><input type="checkbox" rel="update"></td>`;
		content += `<td align="center"><input type="checkbox" rel="drop"></td>`;
		content += `<td align="center"><input type="checkbox" rel="decision"></td>`;
		return content;
	}

	this.initModulePermissionEvent = async function(table){
		for(let i in table.module){
			let module = table.module[i];
			module.dom.all.onchange = async function(){
				module.dom.read.checked = this.checked;
				module.dom.write.checked = this.checked;
				module.dom.update.checked = this.checked;
				module.dom.drop.checked = this.checked;
				module.dom.decision.checked = this.checked;
				for(let j in table.records[i]){
					let record = table.records[i][j];
					record.dom.all.checked = this.checked;
					record.dom.all.onchange();
				}
			}
			module.dom.read.onchange = async function(){
				for(let j in table.records[i]){
					let record = table.records[i][j];
					record.dom.read.checked = this.checked;
				}
				object.checkTickPermissionType(table, table.records);
			}
			module.dom.write.onchange = async function(){
				for(let j in table.records[i]){
					let record = table.records[i][j];
					record.dom.write.checked = this.checked;
				}
				object.checkTickPermissionType(table, table.records);
			}
			module.dom.update.onchange = async function(){
				for(let j in table.records[i]){
					let record = table.records[i][j];
					record.dom.update.checked = this.checked;
				}
				object.checkTickPermissionType(table, table.records);
			}
			module.dom.drop.onchange = async function(){
				for(let j in table.records[i]){
					let record = table.records[i][j];
					record.dom.drop.checked = this.checked;
				}
				object.checkTickPermissionType(table, table.records);
			}
			module.dom.decision.onchange = async function(){
				for(let j in table.records[i]){
					let record = table.records[i][j];
					record.dom.decision.checked = this.checked;
				}
				object.checkTickPermissionType(table, table.records);
			}
		}
	}

	this.edit = async function(tag){
		console.log(tag);
	}

	this.delete = async function(tag) {
		if (tag.modelName == 'User') await main.protocol.user.dropUser(tag.id);
		else if (tag.modelName == 'UserGroup') await main.protocol.user.dropUserGroup(tag.id);
		await object.tabMenu[object.tab].click();
	}

	this.submit = async function(form) {
		let result = await AbstractPage.prototype.submit.call(this, form);
		if (result.isPass) {
			await object.submitUserGroup(form, result.data);
		}
	}

	this.submitUserGroup = async function(form, data) {
		if (form.id != undefined) data.id = form.id;
		if (form.dom.form.tables == undefined) return;
		let isPass = true;
		data.records = [];
		for (let i in form.dom.form.tables) {
			let records = form.dom.form.tables[i].records;
			for(let j in records){
				for (let k in records[j]) {
					let record = records[j][k];
					let result = record.getData();
					isPass = isPass & result.isPass;
					result.data.module = record.dom.module.value;
					result.data.permission = record.dom.permission.value;
					data.records.push(result.data);
				}
			}
		}
		data.records = await object.checkPermissionType(data.records);
		if (!isPass) return;
		let response = await main.protocol.user.addUserGroup(data);
		if (response.isSuccess) history.back();
	}

	this.checkTickPermissionType = async function(table, records){
		table.dom.all.checked = false;
		table.dom.none.checked = false;
		let allChecked = true;
		for(let i in records){
			let allReadChecked = true, allWriteChecked = true, allUpdateChecked = true, allDropChecked = true, allDecisionChecked = true;
			for(let j in records[i]){
				let record = records[i][j];
				let readChecked = record.dom.read.checked;
				let writeChecked = record.dom.write.checked;
				let updateChecked = record.dom.update.checked;
				let dropChecked = record.dom.drop.checked;
				let decisionChecked = record.dom.decision.checked;

				if(!readChecked){
					allChecked = false;
					allReadChecked = false;
				}
				if(!writeChecked){
					allChecked = false;
					allWriteChecked = false;
				}
				if(!updateChecked){
					allChecked = false;
					allUpdateChecked = false;
				}
				if(!dropChecked){
					allChecked = false;
					allDropChecked = false;
				}
				if(!decisionChecked){
					allChecked = false;
					allDecisionChecked = false;
				}
				record.dom.all.checked = readChecked && writeChecked && updateChecked && dropChecked && decisionChecked;
			}
			table.module[i].dom.all.checked = allReadChecked && allWriteChecked && allUpdateChecked && allDropChecked && allDecisionChecked;
			table.module[i].dom.read.checked = allReadChecked;
			table.module[i].dom.write.checked = allWriteChecked;
			table.module[i].dom.update.checked = allUpdateChecked;
			table.module[i].dom.drop.checked = allDropChecked;
			table.module[i].dom.decision.checked = allDecisionChecked;
		}
		if(allChecked) table.dom.all.checked = true;
		else table.dom.none.checked = true;
	}

	this.setTickPermissionType = async function(module, permission, data, record){
		let permissions = data.permissions;
		for(let i in permissions){
			if(module == permissions[i].module && permission == permissions[i].permission){
				if(permissions[i].permissionType == 1) record.dom.read.checked = true;
				if(permissions[i].permissionType == 2) record.dom.write.checked = true;
				if(permissions[i].permissionType == 3) record.dom.update.checked = true;
				if(permissions[i].permissionType == 4) record.dom.drop.checked = true;
				if(permissions[i].permissionType == 5) record.dom.decision.checked = true;
			}
		}
	}

	this.checkPermissionType = async function(data){
		let list = [];
		for(let i in data){
			if(data[i].read) list.push(await object.getPermissionType(data[i], 1));
			if(data[i].write) list.push(await object.getPermissionType(data[i], 2));
			if(data[i].update) list.push(await object.getPermissionType(data[i], 3));
			if(data[i].drop) list.push(await object.getPermissionType(data[i], 4));
			if(data[i].decision) list.push(await object.getPermissionType(data[i], 5));
		}
		return list;
	}

	this.getPermissionType = async function(data, permissionType){
		if(data.permission == undefined) data.permission = -1;
		return {
			module: data.module,
			permission: data.permission,
			permissionType: permissionType
		}
	}

	this.delete = async function(tag) {
		await main.protocol.user.dropUserGroup(tag.id);
		RENDER_STATE();
	}
}