const UserManagementPage = function(main, parent) {
	AbstractPage.call(this, main, parent);
	
	let object = this;
	this.title = 'User';
	this.model = 'User';
	this.pageNumber = 1;
	this.limit = 10;
	this.tab = 'user';
	this.filter = {};

	object.role = ['User'];

	this.prepare = async function() {
		object.handbook = new Handbook(object.main, object); 
	}

	this.getMenu = async function(isSubMenu) {
		object.menu = await CREATE_MENU(object.pageID, 'User', 'User', isSubMenu);
		return object.menu;
	}

	this.render = async function(config) {
		AbstractPage.prototype.render.call(this, config);
		await object.renderUser(object.limit);
		object.handbook.init('gaimon.User');
	}

	this.renderState = async function(state) {
		if (state.state == 'form') await object.renderForm('User', {isSetState: false, data: state.data, inputs: state.inputs, isView: state.isView});
	}

	this.getData = async function(limit){
		await object.renderUser(limit);
	}

	this.renderForm = async function(modelName, config = {}, viewType='Form') {
		if(config.data != undefined){
			delete config.data.localize;
			config.data = await main.protocol.user.getUserByID({id: config.data.id});
		}
		let view = await object.renderView(modelName, config, viewType);
		if(config.data && config.data.driver){
			view.setData(config.data.driver);
		}
		view.onSubmit = async function() {
			let result = await AbstractPage.prototype.submit.call(this, view);
			let data = result.data;
			if (view.id != undefined) {
				if (data.passwordHash.length > 0 || data.confirm_passwordHash.length > 0) {
					if (data.passwordHash != data.confirm_passwordHash) {
						view.dom.passwordHash.classList.add('error');
						view.dom.confirm_passwordHash.classList.add('error');
						return;
					} else {
						view.dom.passwordHash.classList.remove('error');
						view.dom.confirm_passwordHash.classList.remove('error');
					}
				}
				data.id = view.id;
			}
			delete data.avatar;
			let formData = new FormData();
			formData = result.file;
			formData.append('data', JSON.stringify(data));
			// await object.getFile(formData, view.dom.avatar, 'avatar');
			let handle = ('id' in data) ? main.protocol.user.update : main.protocol.user.insert;
			let response = await handle(formData);
			if (response.isSuccess) view.close();
		}
	}

	this.renderUser = async function(limit = 10){
		// let data = {
		// 	pageNumber: object.pageNumber,
		// 	limit: limit
		// }
		// let results = await main.protocol.user.getAllUser(data);
		// results.hasView = true;
		// let table = await object.renderTable('User', results);
		// console.log(table);
		object.filter.isDrop = 0;
		object.limit = limit;
		let data = {
			pageNumber: object.pageNumber,
			limit: limit,
			data : object.filter
		}
		let result = await main.protocol.user.getAllUser(data);
		let option = {
			count: result.count,
			hasView: true,
		}
		let table = await object.renderTableView(object.model, option, main.tableViewType);
		if(table.dom.thead.salaryList_th) table.dom.thead.salaryList_th.style.width = '0';
		table.onCreateRecord = async function(record) {
			let id = record.id;
			if(!record.dom.salaryList) return;
			await object.initSalaryRecord(record);
		}
		await table.createMultipleRecord(result.data);
	}

	this.delete = async function(tag) {
		await main.protocol.user.dropUser(tag.id);
		RENDER_STATE();
	}

	this.getFile = async function(formData, fileInput, name){
		for(let file of fileInput.files){
			formData.append(name, file);
		}
	}

	this.initSalaryRecord = async function(record){
		let icon = await CREATE_SVG_ICON('salary.List');
		let salary = new DOMObject(`<div class="abstract_operation_button" style="max-width:unset;" rel="salary">${icon.icon}</div>`);
		salary.dom.salary.onclick = async function(){
			
			await object.renderSalaryPaymentDialog(record);
		}
		record.dom.salaryList.html(salary);
	}

	this.renderSalaryPaymentDialog = async function(record){
		let protocol = main.extension.salary.SalaryPage.protocol;
		let result = await protocol.payment.getByUID(record.record.id);
		if(!result.length){
			SHOW_ALERT_DIALOG('ไม่พบข้อมูลการจ่ายเงินเดือน');
			return;
		}
		let config = {};
		config.title = `Salary Payment - ${record.record.firstName} ${record.record.lastName}`;
		config.data = result;
		let dialog = await AbstractPage.prototype.renderBlankDialog.call(this, config);
		dialog.dom.dialog_container.classList.add('xlarge');
		dialog.dom.submit.remove();
		dialog.dom.cancel.innerHTML = 'Close';
		config.hasAvatar = false;
		config.hasEdit = false;
		config.hasDelete = false;
		let table = await AbstractPage.prototype.getTableView.call(this, 'SalaryPayment', config, 'Table');
		dialog.dom.form.html(table);
	}
}