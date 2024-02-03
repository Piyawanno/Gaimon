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
	}

	appendTableForm(tableForm){
		this.tableForm.push(tableForm);
	}

	setSubmitButton(){
		let object = this;
		this.submitButton = new Button(
			"Submit",
			'100.0',
			async () => {await object.submit();},
			["submit_button"],
		);
		this.button.push(this.submitButton);
	}

	async renderInsert(title, selectedData=null, handleSubmit){
		this.record = {};
		this.handleSubmit = handleSubmit;
		await this.render(title);
		this.setData(selectedData);
		return this.form;
	}

	async renderUpdate(title, record, handleSubmit){
		this.record = record;
		this.handleSubmit = handleSubmit;
		await this.render(title);
		this.setData(record);
		return this.form;
	}

	async render(title){
		if(this.form == null){
			this.template = TEMPLATE.FormView;
			this.form = new DOMObject(this.template, {title});
			await this.setInput();
			await this.setButton();
			this.page.onCreateForm(this);
			await this.renderTableForm();
			this.setInputEvent();
		}else{
			this.form.dom.title.innerHTML = title;
		}
		this.message = [];
		this.isPass = true;
		this.onRender();
		return this.form;
	}

	onRender(){
		for(let input of this.meta.inputList){
			input.isPass = true;
			input.onRender();
		}
	}

	async setInput(){
		let container = this.form.dom.form;
		for(let input of this.meta.inputList){
			if(!input.isGrouped){
				let rendered = await input.renderForm();
				container.appendChild(rendered.html);
			}
		}
		for(let group in this.meta.groupList){
			let rendered = await group.renderForm();
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
			this.form.dom.operation.appendChild(rendered.html);
		}
	}

	async submit(){
		this.data = {};
		let isPass = this.isPass;
		for(let i of this.meta.inputList){
			isPass = i.getFormValue(this.form, this.data, this.message) && isPass;
			isPass = i.isPass && isPass;
		}
		if(isPass){
			this.handleSubmit(this.data);
		}else{
			for(let i of this.meta.inputList){
				if(i.message.length > 0) this.message.push(i.message);
			}
			console.error(this.message);
			this.page.handleSubmitError(this.message);
		}
	}

	setData(record){
		for(let input of this.meta.inputList){
			input.setFormValue(record);
		}
	}

	appendInputEvent(columnName, eventName, eventHandler=async ()={}){
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
				console.log(dom.onchange);
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