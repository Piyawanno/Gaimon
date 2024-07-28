class DocumentView{
	constructor(page){
		this.page = page;
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

	async render(title, record){
		if(this.form == null){
			this.record = record;
			this.protocol = this.page.protocol;
			this.template = TEMPLATE.DocumentView;
			this.form = new DOMObject(this.template, {title});
			await this.setButton();
		}else{

		}
		this.message = [];
		this.isPass = true;
		return this.form;
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
		return isPass;
	}

	async handleUpdate(data){
		let id = undefined;
		if(this.protocol != null){
			let result = await this.protocol.update(data);
			id = result.id;
			this?.close();
		}else{
			console.error('Protocol is not set.');
		}
		return id;
	}

	async submit(){
		let isPass = await this.getValue();
		if(isPass){
			delete this.record.documentStatus;
			Object.assign(this.data, this.record);
			this.handleUpdate(this.data);
		}else{
			console.error(this.message);
			this.page.handleSubmitError(this.message);
		}
	}

	async getValue(){
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
		return isPass;
	}

	async close() {
		history.back();
	}
}