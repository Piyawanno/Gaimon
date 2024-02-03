class ModelPage{
	constructor(main, parent){
		this.main = main;
		this.parent = parent;
		this.pageID = '';
		this.title = '';
		this.modelName = '';
		this.parentPageID = '';
		this.extension = '';
		this.role = [];
		this.template = null;
		this.protocol = null;
		this.page = null;
		this.accessList = [
			PermissionType.READ, PermissionType.WRITE,
			PermissionType.UPDATE, PermissionType.DROP,
		];
		this.permissionList = [];
		this.defaultRender = this.renderSummary;
		
		this.form = null;
		this.detail = null;
		this.table = null;

		this.formClass = FormView;
		this.detailClass = DetailView;
		this.tableClass = TableView;
		this.recordClass = null;

		this.createFormHandler = [];
		this.createMetaDataHandler = [];
		this.createDetailHandler = [];
		this.createTableHandler = [];

		/// NOTE Map type can be later added to extend module
		/// and is not necessarily fixed to ViewType.
		this.renderMap = {};
		this.renderMap[ViewType.MAIN] = this.renderMain;
		this.renderMap[ViewType.INSERT] = this.renderInsert;
		this.renderMap[ViewType.UPDATE] = this.renderUpdate;
		this.renderMap[ViewType.TABLE] = this.renderTable;
		this.renderMap[ViewType.DETAIL] = this.renderDetail;
		this.renderMap[ViewType.SUMMARY] = this.renderSummary;
		this.renderMap[ViewType.MAIN_DIALOG] = this.renderMainDialog;
		this.renderMap[ViewType.INSERT_DIALOG] = this.renderInsertDialog;
		this.renderMap[ViewType.UPDATE_DIALOG] = this.renderUpdateDialog;
		this.renderMap[ViewType.TABLE_DIALOG] = this.renderTableDialog;
		this.renderMap[ViewType.DETAIL_DIALOG] = this.renderDetailDialog;
		this.renderMap[ViewType.SUMMARY_DIALOG] = this.renderSummaryDialog;
	}

	async createMeta(config){
		let response = await GET(`input/${this.modelName}`);
		if(response.isSuccess){
			this.meta = new ModelMetaData(this, this.modelName, response);
			this.meta.extract();
			this.checkOnCreateMetaData(this.metaData);
		}else{
			console.error(response.message);
		}
	}

	async initJS(){
	}

	loadPermission(extension){
		for (let role of this.role) {
			for (let permission of this.accessList) {
				if (extension != undefined) {
					this.permissionList.push(`${extension}.${role}.${PermissionTypeMap[permission]}`)
				} else {
					this.permissionList.push(`${role}.${PermissionTypeMap[permission]}`)
				}
			}
		}
	}

	register(){
	}

	getPageStateURL(){
		return '';
	}

	async onPrepareState(){
		await this.createMeta();
	}

	async setPageState(){
	}

	/// NOTE For update and detail, only ID will be given.
	/// Data should not be the entire record to prevent concurrency.
	async render(viewType, data){
		let render = viewType == undefined? this.defaultRender: this.renderMap[viewType];
		if(render != undefined){
			return await render.call(this, data);
		}else{
			console.error(`View type ${viewType} is not defined.`);
		}
	}

	async renderByURL(request){
		let viewType = request['v'];
		let tab = request['t'];
		if(viewType == 'UPDATE'){
			let id = request['id'];
		}
	}

	async renderMain(){
		return await this.renderSummary();
	}

	async renderInsert(selectedData){
		await this.renderInsertContent(selectedData);
		this.setToMain(this.page);
		return this.page;
	}

	async renderInsertContent(selectedData){
		this.checkTemplate();
		this.checkForm();
		let object = this;
		let rendered = await this.form.renderInsert(
			`Add ${this.title}`,
			selectedData,
			async (data) => {object.handleInsert(data);}
		);
		this.page.dom.container.html('');
		this.page.dom.container.appendChild(rendered.html);
	}

	async renderUpdate(ID){
		await this.renderUpdateContent(ID);
		this.setToMain(this.page);
		return this.page;
	}

	async renderUpdateContent(ID){
		let record = await this.protocol.getByID(ID);
		this.checkTemplate();
		this.checkForm();
		let object = this;
		let rendered = await this.form.renderUpdate(
			`Update ${this.title}`,
			record,
			async (data) => {object.handleUpdate(data);}
		);
		this.page.dom.container.html('');
		this.page.dom.container.appendChild(rendered.html);
	}

	async renderTable(filter){
		this.checkTemplate();
		this.checkTable();
	}

	/// NOTE data can be record or ID of record;
	async renderDetail(data){
		await this.renderDetailContent(data);
		this.setToMain(this.page);
		return this.page;
	}

	async renderDetailContent(data){
		if(typeof data != 'object'){
			data = await this.protocol.getByID(data);
		}
		this.checkTemplate();
		this.checkDetail();
		let title = this.getDetailTitle(data);
		let rendered = await this.detail.render(title, data);
		this.page.dom.container.html('');
		this.page.dom.container.appendChild(rendered.html);
	}

	async renderSummary(){
		this.checkTemplate();
		this.setToMain(this.page);
		return this.page;
	}

	async renderMainDialog(){
		return await this.renderSummaryDialog();
	}

	async renderInsertDialog(selectedData){
	}

	async renderUpdateDialog(ID){
	}

	async renderTableDialog(filter){
	}

	async renderDetailDialog(ID){
	}

	async renderSummaryDialog(){
	}

	async getMenu(isSubMenu, label, icon){
		if(isSubMenu) this.menu = new SubMenuView(this, label, icon);
		else this.menu = new MenuView(this, label, icon);
		let rendered = await this.menu.render();
		return rendered
	}

	checkTemplate(){
		if(!this.page){
			this.template = TEMPLATE.ModelPage;
			this.page = new DOMObject(this.template);
		}
	}

	checkForm(){
		if(!this.form){
			this.form = new this.formClass(this);
		}
	}

	checkDetail(){
		if(!this.detail){
			this.detail = new this.detailClass(this);
		}
	}

	checkTable(){
		if(!this.table){
			this.table = new this.tableClass(this);
		}
	}

	setToMain(result){
		this.main.home.dom.container.html('');
		this.main.home.dom.container.appendChild(result.html);
	}

	async handleInsert(data){
		if(this.protocol != null){
			let result = await this.protocol.insert(data);
			console.log(result);
			await this.renderDetail(result);
		}else{
			console.error('Protocol is not set.');
		}
	}

	async handleUpdate(data){
		if(this.protocol != null){
			await this.protocol.update(data);
		}else{
			console.error('Protocol is not set.');
		}
	}

	handleSubmitError(message){
		let text = Mustache.render(TEMPLATE.ErrorMessageList, {message});
		SHOW_ALERT_DIALOG(text);
	}

	/// NOTE Override this method to extend other page.
	/// In this state, all pages are created without any component
	/// including meta.
	/// EventHandler can be pushed in to related array e.g. this.onCreateForm,
	/// which will be called by occurring event.
	onCreate(){
	}

	onCreateForm(form){
		this.checkOnCreateForm(form);
	}

	onCreateDetail(detail){
		this.checkOnCreateDetail(detail);
	}

	onCreateTable(table){
		this.checkOnCreateTable(detail);
	}

	checkOnCreateForm(form){
		for(let callback of this.createFormHandler){
			callback(form);
		}
	}

	checkOnCreateMetaData(metaData){
		for(let callback of this.createMetaDataHandler){
			callback(metaData);
		}
	}

	checkOnCreateDetail(detail){
		for(let callback of this.createDetailHandler){
			callback(detail);
		}
	}

	checkOnCreateTable(detail){
		for(let callback of this.createTableHandler){
			callback(detail);
		}
	}

	getDetailTitle(record){
		return `Detail of ${this.title}`;
	}
}