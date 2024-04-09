class DialogView{
	constructor(page){
		this.page = page;
		this.main = page.main;
		this.meta = page.meta;
		this.template = null;
		this.dialog = null;
		this.button = [];
		this.setOperationButton();
		this.tableForm = [];
		this.eventMapper = {};
		this.inputMapper = {};
	}

	appendTableForm(tableForm){
		this.tableForm.push(tableForm);
	}

	setOperationButton(){
		this.setSubmitButton();
		this.setCancelButton();
	}

	setSubmitButton(){
		let object = this;
		this.submitButton = new Button(
			"Submit",
			'100.0',
			this.submit.bind(this),
			["submit_button"],
		);
		this.button.push(this.submitButton);
	}

	setCancelButton(){
		this.cancelButton = new Button(
			"Cancel",
			'100.0',
			this.close.bind(this),
			["cancel_button"],
		);
		this.button.push(this.cancelButton);
	}

	async renderInsert(title, selectedData=null, handleSubmit, callback){
		let dialog = new DialogViewInstance(this.page);
		return await dialog.renderInsert(title, selectedData, handleSubmit, callback);
	}

	async renderUpdate(title, record, handleSubmit, callback){
		let dialog = new DialogViewInstance(this.page);
		return await dialog.renderUpdate(title, record, handleSubmit, callback);
	}

	async render(title){
		let dialog = new DialogViewInstance(this.page);
		return await dialog.render(title);
	}

	onRender(){
		for(let input of this.meta.inputList){
			input.isPass = true;
			input.onRender(this.inputMapper[input.columnName]);
		}
	}

	async setInput(record){
		let container = this.dialog.dom.form;
		for(let input of this.meta.inputList){
			if(!input.isGrouped){
				let rendered = await input.renderDialogForm(record);
				this.inputMapper[input.columnName] = rendered;
				if (rendered.html == null) continue;
				container.appendChild(rendered.html);
			}
		}
		for(let group of this.meta.groupList){
			let rendered = await group.renderDialogForm(record);
			this.inputMapper[group.columnName] = rendered;
			for (let columnName in group.inputMapper) {
				this.inputMapper[columnName] = group.inputMapper[columnName];
			}
			container.appendChild(rendered.html);
		}
	}

	appendButton(button){
		this.button.push(button);
		this.button.sort((a, b) => {VersionParser.compare(a.order, b.order)});
	}

	async setButton(){
		for(let i of this.button){
			let rendered = await i.render();
			this.dialog.dom.operation.appendChild(rendered.html);
		}
	}

	getFormValue(form, data, file, message) {
		let isPass = true;
		for(let i of this.meta.inputList){
			let input = this.inputMapper[i.columnName]
			if (input == undefined) continue;
			isPass = i.getFormValue(form, input, data, file, message) && isPass;
			isPass = i.isPass && isPass;
		}
		return isPass;
	}

	async submit(){
		this.data = {};
		if (Object.keys(this.record).length > 0) this.data = this.record;
		this.file = new FormData();
		let isPass = this.isPass;
		this.message = [];
		isPass = this.getFormValue(this.dialog, this.data, this.file, this.message) && isPass;
		let components = this.page.modelComponentViewMap[this.viewType];
		components = components != undefined ? components:[];
		for (let item of components) {
			if (item.viewType == ViewType.TABLE || item.viewType == ViewType.TABLE_FORM) {
				this.data[item.component.modelName] = [];
			} else {
				this.data[item.component.modelName] = {};
			}
			let file = new FormData();
			isPass = item.getFormValue(this.form, this.data[item.component.modelName], file, this.message) && isPass;
			if (this.formData != undefined) {
				if (!file.isEmpty()) {
					this.file.append(`data_${item.component.modelName}`, this.data[item.component.modelName]);
					let iterator = file.keys();
					while (true) {
						let result = iterator.next();
						if (result.value != 'data') {
							let items = file.getAll(result.value);
							for (let item of items) {
								this.file.append(`${item.component.modelName}_${result.value}`, item);
							}
						}
						if (result.done) break;
					}
				}
			}
		}
		if(isPass){
			let id = undefined;
			if (!this.file.isEmpty()) {
				if (this.file.get('data') == null) {
					this.file.append('data', JSON.stringify(this.data));
				}
				id = await this.handleSubmit(this.file);
			} else {
				id = await this.handleSubmit(this.data);
			}
			if (id != undefined && this.callback != undefined) {
				this.callback(id);
				console.log(this.callback);
			}
		}else{
			for(let i of this.meta.inputList){
				if (i.message == undefined) continue;
				if(i.message.length > 0) this.message.push(i.message);
			}
			console.error(this.message);
			this.page.handleSubmitError(this.message);
		}
	}

	async close() {
		if (this.main) this.main.closeDialog();
		if (main) main.closeDialog();
	}

	setData(record){
		for(let input of this.meta.inputList){
			if (this.inputMapper[input.columnName] == undefined) continue;
			input.setFormValue(this.inputMapper[input.columnName], record);
		}
	}

	appendInputEvent(columnName, eventName, eventHandler=async ()=>{}){
		let eventMapper = this.eventMapper[columnName];
		if(eventMapper == undefined){
			eventMapper = {};
			this.eventMapper[columnName] = eventMapper;
		}
		let eventList = eventMapper[eventName];
		if(eventList == undefined){
			eventList = [];
			eventMapper[eventName] = eventList;
		}
		eventList.push(eventHandler);
	}

	setInputEvent(){
		for(let input of this.meta.inputList){
			let eventMapper = this.eventMapper[input.columnName];
			if(eventMapper == undefined) continue;
			let dom = input.input.dom[input.columnName];
			if(dom == undefined) continue;
			for(let name in eventMapper){
				let eventList = eventMapper[name];
				dom[name] = async (event) => {
					for(let handler of eventList){
						await handler(event);
					}
				};
			}
		}
	}

	async renderTableForm(){
		this.tableForm.sort((a, b) => {VersionParser.compare(a.order, b.order)});
		for(let tableForm of this.tableForm){
			await tableForm.render();
		}
	}
}