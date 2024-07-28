class DetailView{
	constructor(page){
		this.page = page;
		this.meta = page.meta;
		this.detail = null;

		this.currentReferencedData = {};

		let object = this;
		this.hasEdit = true;
		this.hasCancel = true;
		this.operation = [];
	}

	async render(title, record){
		await this.getRelatedData();
		this.record = record;
		if(this.detail == null){
			this.template = TEMPLATE.FormView;
			this.detail = new DOMObject(this.template, {title});
			await this.setInput(this.record);
			this.page.onCreateDetail(this);
			this.setButton();
			this.setOperation(record);
		} else{
			await this.setInput(this.record);
			this.detail.dom.title.innerHTML = title;
		}
		return this.detail;
	}

	appendButton(button){
		this.button.push(button);
		this.button.sort((a, b) => VersionParser.compare(a.order, b.order));
	}

	appendOperation(operation){
		this.operation.push(operation);
		this.operation.sort((a, b) => VersionParser.compare(a.order, b.order));
	}

	async getOperation(){}
	
	async setButton(){
		let object = this;
		this.editButton = new Button(
			"Edit",
			'1.0',
			async () => {await object.callEditPage();},
			["edit_form_button"],
		);
		this.cancelButton = new Button(
			"Cancel",
			'2.0',
			async () => {await object.close();},
			["cancel_button"],
		);
		this.button = [];
		if (this.hasEdit) {
			this.button.push(this.editButton);
		}
		if (this.hasCancel) {
			this.button.push(this.cancelButton);
		}
		for(let i of this.button){
			let rendered = await i.render();
			this.detail.dom.operation.appendChild(rendered.html);
		}
	}

	async reloadButton(){
		if(this.editButton) this.editButton.isRendered = false;
		if(this.cancelButton) this.cancelButton.isRendered = false;
		this.button = [];
		await this.setButton();
	}

	async showEditButton() {
		this.editButton.button.html.show();
	}

	async hideEditButton() {
		this.editButton.button.html.hide();
	}

	async showCancelButton() {
		this.cancelButton.button.html.show();
	}

	async hideCancelButton() {
		this.cancelButton.button.html.hide();
	}

	async setOperation(record){
		await this.getOperation();
		if(this.operation.length == 0) return;
		this.menu = new DOMObject(TEMPLATE.DetailMenu);
		this.detail.dom.operationContainer.append(this.menu);
		for(let i of this.operation){
			let rendered = await i.render(record);
			this.menu.dom.operation.appendChild(rendered.html);
		}		
	}

	async setInput(record){
		let container = this.detail.dom.form;
		for(let input of this.meta.inputList){
			if(!input.isGrouped){
				let rendered = await input.renderDetail(record, this.currentReferencedData);
				if (rendered.html == null) continue;
				container.appendChild(rendered.html);
			}
		}
		for(let group of this.meta.groupList){
			let rendered = await group.renderDetail(record, this.currentReferencedData);
			container.appendChild(rendered.html);
		}
	}

	async callEditPage(){
		await this.page.render(ViewType.UPDATE, this.record.id);
	}

	async close() {
		this.page.render(undefined, undefined, true);
	}

	async getRelatedData(){
		this.currentReferencedData = {}
		for(let input of this.meta.inputList){
			let i = input.column.input;
			if(i.isReferenced){
				if (i.isTagReferenced) {
				} else if (i.config.typeName == 'AutoComplete') {
				} else {
					this.currentReferencedData[i.columnName] = {};
					if (i.url == undefined || i.url == null) continue;
					if (i.prerequisiteColumn != undefined || i.prerequisiteColumn != null) continue;
					let response = await GET(i.url);
					if (!response.isSuccess) continue;
					let option = response.result;
					if (option == null) continue;
					for(let j of option){
						this.currentReferencedData[i.columnName][j.value] = j;
					}
				}
			}
		}
	}
}