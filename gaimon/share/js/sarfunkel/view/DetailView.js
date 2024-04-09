class DetailView{
	constructor(page){
		this.page = page;
		this.meta = page.meta;
		this.detail = null;

		this.currentReferencedData = {};

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
		this.button = [this.editButton, this.cancelButton];
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
		} else{
			await this.setInput(this.record);
			this.detail.dom.title.innerHTML = title;
		}
		return this.detail;
	}

	appendButton(button){
		this.button.push(button);
		this.button.sort((a, b) => {VersionParser.compare(a.order, b.order)});
	}
	
	async setButton(){
		for(let i of this.button){
			let rendered = await i.render();
			this.detail.dom.operation.appendChild(rendered.html);
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
		await this.page.renderUpdate(this.record.id);
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
				} else {
					this.currentReferencedData[i.columnName] = {};
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