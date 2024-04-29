class FormView{
	constructor(page){
		this.page = page;
		this.meta = page.meta;
		this.template = null;
		this.form = null;
		this.button = [];
		this.setSubmitButton();
		this.tableForm = [];
		this.eventMapper = {};
		this.currentInputMap = {};
	}

	appendTableForm(tableForm){
		this.tableForm.push(tableForm);
	}

	setSubmitButton(){
		this.submitButton = new Button(
			"Submit",
			'100.0',
			this.submit.bind(this),
			["submit_button"],
		);
		this.button.push(this.submitButton);
		this.cancelButton = new Button(
			"Cancel",
			'100.0',
			this.close.bind(this),
			["cancel_button"],	
		);
		this.button.push(this.cancelButton);
	}

	async renderInsert(title, selectedData=null, handleSubmit){
		this.record = {};
		this.viewType = ViewType.INSERT;
		this.handleSubmit = handleSubmit;
		await this.render(title);
		this.setData(selectedData);
		return this.form;
	}

	async renderUpdate(title, record, handleSubmit){
		this.record = record;
		this.viewType = ViewType.UPDATE;
		this.handleSubmit = handleSubmit;
		await this.render(title);
		this.setData(record);
		return this.form;
	}

	async render(title){
		if(this.form == null){
			this.template = TEMPLATE.FormView;
			this.form = new DOMObject(this.template, {title});
			await this.setInput(this.record);
			await this.setButton();
			this.page.onCreateForm(this);
			await this.renderTableForm();
			this.setInputEvent();
		}else{
			await this.setInput(this.record);
			this.form.dom.title.innerHTML = title;
		}
		this.message = [];
		this.isPass = true;
		this.onRender();
		return this.form;
	}

	onRender(){
		for(let input of this.meta.inputList){
			if (!input.config.isForm) continue;
			input.isPass = true;
			if (input.input == undefined) continue;
			input.onRender(input.input);
		}
	}

	async setInput(record){
		let container = this.form.dom.form;
		let excludeList = this.meta.excludeInputViewMap[ViewType.FORM];
		excludeList = excludeList != undefined ? excludeList : [];
		for(let input of this.meta.inputList){
			if (!input.config.isForm) continue;
			input.formView = this;
			if (excludeList.indexOf(input.columnName) != -1) continue;
			if(!input.isGrouped){
				let isRendered = input.input != undefined;
				let rendered = await input.renderForm(record);
				this.currentInputMap[input.columnName] = {input: input, dom: rendered};
				if (rendered.html == null) continue;
				if (!isRendered) container.appendChild(rendered.html);
			}
		}
		for(let group of this.meta.groupList){
			let isRendered = group.group != undefined;
			group.meta = this.meta;
			let rendered = await group.renderForm(record);
			this.extendInputMap(group.currentInputMap)
			if (!isRendered) container.appendChild(rendered.html);
			container.appendChild(rendered.html);
		}
	}

	extendInputMap(inputMap) {
		for (let columnName in inputMap) {
			this.currentInputMap[columnName] = inputMap[columnName];
		}
	}

	appendButton(button){
		this.button.push(button);
		this.button.sort((a, b) => VersionParser.compare(a.order, b.order));
	}

	async setButton(){
		for(let i of this.button){
			let rendered = await i.render();
			this.form.dom.operation.appendChild(rendered.html);
		}
	}

	getFormValue(form, data, file, message) {
		let isPass = true;
		for(let input of this.meta.inputList){
			if (!input.config.isForm) continue;
			isPass = input.getFormValue(this.form, input.input, data, file, message) && isPass;
			isPass = input.isPass && isPass;
		}
		return isPass;
	}

	async submit(){
		this.data = {};
		this.file = new FormData();
		let isPass = this.isPass;
		this.message = [];
		isPass = this.getFormValue(this.form, this.data, this.file, this.message) && isPass;
		let components = this.page.modelComponentViewMap[this.viewType];
		components = components != undefined ? components:[];
		for (let item of components) {
			if (item.viewType == ViewType.TABLE || item.viewType == ViewType.TABLE_FORM) {
				this.data[item.component.modelName] = [];
			} else {
				this.data[item.component.modelName] = {};
			}
			let modelName = item.component.modelName;
			let file = new FormData();
			isPass = item.getFormValue(this.form, this.data[modelName], file, this.message) && isPass;
			if (!file.isEmpty()) {
				this.file.append(`data_${modelName}`, this.data[modelName]);
				let iterator = file.keys();
				while (true) {
					let result = iterator.next();
					if (result.value != 'data') {
						let items = file.getAll(result.value);
						for (let item of items) {
							this.file.append(`${modelName}_${result.value}`, item);
						}
					}
					if (result.done) break;
				}
			}
		}
		console.log(this.data);
		console.log(this.file);
		if(isPass){
			if (Object.keys(this.record).length > 0) {
				this.data.id = this.record.id;
			}
			if (!this.file.isEmpty()) {
				if (this.file.get('data') == null) {
					this.file.append('data', JSON.stringify(this.data));
				}
				this.handleSubmit(this.file);
			} else {
				this.handleSubmit(this.data);
			}
		}else{
			for(let input of this.meta.inputList){
				if (!input.config.isForm) continue;
				if (input.message == undefined) continue;
				if(input.message.length > 0) this.message.push(input.message);
			}
			console.error(this.message);
			this.page.handleSubmitError(this.message);
		}
	}

	async close() {
		history.back();
	}

	setData(record){
		for(let input of this.meta.inputList){
			if (!input.config.isForm) continue;
			input.setFormValue(input.input, record);
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
			if (!input.config.isForm) continue;
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
				console.log(dom.onchange);
			}
		}
	}

	async renderTableForm(){
		this.tableForm.sort((a, b) => VersionParser.compare(a.order, b.order));
		for(let tableForm of this.tableForm){
			await tableForm.render();
		}
	}
}