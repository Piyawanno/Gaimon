class DetailView{
	constructor(page){
		this.page = page;
		this.detail = null;

		let object = this;
		this.editButton = new Button(
			"Edit",
			'1.0',
			async () => {await object.callEditPage();},
			["edit_form_button"],
		);
		this.deleteButton = new Button(
			"Delete",
			'2.0',
			async () => {await object.callDelete();},
			["delete_form_button"],
		);
		this.cancelButton = new Button(
			"Cancel",
			'3.0',
			async () => {await object.callCancel();},
			["cancel_button"],
		);
		this.button = [this.editButton, this.deleteButton, this.cancelButton];
	}

	async render(title, record){
		this.record = record;
		if(this.detail == null){
			this.template = TEMPLATE.FormView;
			this.detail = new DOMObject(this.template, {title});
			this.page.onCreateDetail(this);
			this.setButton();
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

	async callEditPage(){
		await this.page.renderUpdate(this.record.id);
	}

	async callDelete(){
	}

	async callCancel(){
	}
}