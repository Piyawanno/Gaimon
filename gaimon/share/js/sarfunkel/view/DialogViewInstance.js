class DialogViewInstance extends DialogView{
	constructor(page){
		super(page);
	}

	async render(title){
		if(this.dialog == null){
			this.template = TEMPLATE.DialogView;
			this.dialog = new DOMObject(this.template, {title});
			await this.setInput(this.record);
			await this.setButton();
			this.page.onCreateForm(this);
			await this.renderTableForm();
			this.setInputEvent();
		}else{
			await this.setInput(this.record);
			this.dialog.dom.title.innerHTML = title;
		}
		this.message = [];
		this.isPass = true;
		this.onRender();
		this.dialog.__instance__ = this;
		return this.dialog;
	}

	async renderInsert(title, selectedData=null, handleSubmit, callback){
		this.record = {};
		this.handleSubmit = handleSubmit;
		this.callback = callback;
		await this.render(title);
		this.setData(selectedData);
		this.viewType = ViewType.INSERT_DIALOG;
		this.dialog.instance = this;
		return this.dialog;
	}

	async renderUpdate(title, record, handleSubmit, callback){
		this.record = record;
		this.handleSubmit = handleSubmit;
		this.callback = callback;
		await this.render(title);
		this.setData(record);
		this.viewType = ViewType.UPDATE_DIALOG;
		this.dialog.__instance__ = this;
		return this.dialog;
	}
}