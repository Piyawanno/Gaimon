class ModelPage extends ViewLoader{
	constructor(main, parent){
		super();
		this.main = main;
		this.parent = parent;
		this.pageID = '';
		this.title = '';
		this.parentPageID = '';
		this.extension = '';
		this.template = null;
		this.page = null;
		this.defaultRender = this.renderSummary;
		this.isCreated = false;
		

		this.createFormHandler = [];
		this.createMetaDataHandler = [];
		this.createDetailHandler = [];
		this.createTableHandler = [];
		this.prepareTableHandler = [];
		this.createTableFilterHandler = [];

		/// NOTE Map type can be later added to extend module
		/// and is not necessarily fixed to ViewType.
		this.renderMap = {};
		this.renderMap[ViewType.MAIN] = this.renderMain;
		this.renderMap[ViewType.INSERT] = this.renderInsert;
		this.renderMap[ViewType.UPDATE] = this.renderUpdate;
		this.renderMap[ViewType.TABLE] = this.renderTable;
		this.renderMap[ViewType.TABLE_FORM] = this.renderTableForm;
		this.renderMap[ViewType.DETAIL] = this.renderDetail;
		this.renderMap[ViewType.SUMMARY] = this.renderSummary;
		this.renderMap[ViewType.MAIN_DIALOG] = this.renderMainDialog;
		this.renderMap[ViewType.INSERT_DIALOG] = this.renderInsertDialog;
		this.renderMap[ViewType.UPDATE_DIALOG] = this.renderUpdateDialog;
		this.renderMap[ViewType.TABLE_DIALOG] = this.renderTableDialog;
		this.renderMap[ViewType.DETAIL_DIALOG] = this.renderDetailDialog;
		this.renderMap[ViewType.SUMMARY_DIALOG] = this.renderSummaryDialog;
	}

	createNavigationViewItem() {
		this.navigation.append(new NavigationViewItem('extension', this.extension, this.pageID));
		this.navigation.append(new NavigationViewItem('model', this.title, this.pageID));
		this.navigation.append(new NavigationViewItem('table', 'Table', this.pageID, ViewType.TABLE));
		this.navigation.append(new NavigationViewItem('tableForm', 'Table Form', this.pageID, ViewType.TABLE_FORM));
		this.navigation.append(new NavigationViewItem('insert', 'Insert', this.pageID, ViewType.INSERT));
		this.navigation.append(new NavigationViewItem('update', 'Update', this.pageID, ViewType.UPDATE));
		this.navigation.append(new NavigationViewItem('detail', 'Detail', this.pageID, ViewType.DETAIL));
	}

	async createMeta(config){
		let response = await GET(`input/${this.modelName}`);
		if(response.isSuccess){
			this.meta = new ModelMetaData(this, this.modelName, response);
			this.meta.extract();
			this.checkOnCreateMetaData(this.meta);
			for(let i in this.modelComponent){
				let component = this.modelComponent[i];
				await component.createMeta(config);
			}
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
		// this.main
	}

	getPageStateURL(){
		return '';
	}

	async onPrepareState(){
		await this.createMeta();
		let object = this;
		this.navigation.itemMap.model.callback = async function() {
			SHOW_LOADING_DIALOG(async function() {
				await object.defaultRender();
			})
		}
	}

	async setPageState(){
	}

	getURL(tab, viewType, parameter, pageID, isStep) {
		if (pageID == undefined) pageID = this.pageID;
		let params = ['sfk=1', `p=${pageID}`];
		if (viewType != undefined && viewType.length > 0) {
			if (tab != undefined && tab.length > 0) {
				params.push(`v=${viewType}.${tab}`);
				if (isStep == undefined) isStep = false;
				isStep = isStep ? 1:0;
				params.push(`isStep=${isStep}`)
			} else {
				params.push(`v=${viewType}`);
			}
		}
		if (viewType != undefined && viewType.length > 0) {
			for (let key in parameter) {
				params.push(`${key}=${parameter[key]}`);
			}
		}
		let url = `?${params.join('&')}`;
		return url;
	}
	
	setState(tab, viewType, parameter, pageID, isStep) {
		this.pushState(tab, viewType, parameter, pageID, isStep);
	}

	pushState(tab, viewType, parameter, pageID, isStep) {
		let url = this.getURL(tab, viewType, parameter, pageID, isStep)
		PUSH_SARFUNKEL_STATE(url);
		
	}

	replaceState(tab, viewType, parameter, pageID, isStep) {
		let url = this.getURL(tab, viewType, parameter, pageID, isStep)
		REPLACE_SARFUNKEL_STATE(url);
	}

	setStateByURL(url) {
		PUSH_SARFUNKEL_STATE(url);
	}

	/// NOTE For update and detail, only ID will be given.
	/// Data should not be the entire record to prevent concurrency.
	async render(viewType, data, isReplaceState){
		if (isReplaceState == undefined) isReplaceState = false;
		let mainType = undefined;
		let tab = "";
		if(viewType != undefined){
			let splitted = viewType.split(".");
			mainType = splitted[0];
			if(splitted.length > 1) tab = splitted[1];
		}
		
		let render = mainType == undefined? this.defaultRender: this.renderMap[mainType];
		if(render != undefined){
			return await render.call(this, data, tab, isReplaceState);
		}else{
			console.error(`View type ${mainType} is not defined.`);
		}
	}

	async renderByURL(request){
		await this.onPrepareState();
		let mainType = undefined;
		let viewType = request.get('v');
		let tab = "";
		if(viewType != undefined){
			let splitted = viewType.split(".");
			mainType = splitted[0];
			if(splitted.length > 1) tab = splitted[1];
		}
		if (mainType == 'TABLE') {
			return await this.renderTable(undefined, tab);
		}
		if (mainType == 'INSERT') {
			let selectedData = request.get('sd');
			return await this.renderInsert(selectedData, tab);
		}
		if (mainType == 'UPDATE') {
			let id = request.get('id');
			return await this.renderUpdate(id, tab);
		}
		if (mainType == 'DETAIL') {
			let id = request.get('id');
			return await this.renderDetail(id, tab);
		}
	}

	async renderMain(data, tab){
		return await this.renderSummary();
	}

	async renderInsert(selectedData, tab, isReplaceState){
		if (isReplaceState == undefined) isReplaceState = false;
		await this.renderTab(ViewType.INSERT, tab);
		await this.renderStep(ViewType.INSERT, tab);
		if (tab != undefined) {
			let tabMap = this.tabViewMap[ViewType.INSERT];
			if(tabMap != undefined){
				return await this.renderTabContent(tabMap, tab, selectedData);
			}else{
				await this.renderInsertContent(selectedData);
			}
		} else {
			await this.renderInsertContent(selectedData);
		}
		this.resetNavigation();
		await this.renderNavigation(this.navigation.itemMap.insert, this.defaultNavigationIndex);
		this.setToMain(this.page);
		if (isReplaceState) this.replaceState('', ViewType.INSERT);
		else this.pushState('', ViewType.INSERT);
		return this.page;
	}

	getInsertURL() {
		return this.getURL('', ViewType.INSERT);
	}

	async renderTabContent(tabView, tabItemID, data){
		let rendered = await tabView.renderPage(tabItemID, data);
	}

	async renderInsertContent(selectedData){
		this.checkTemplate();
		let rendered = await super.renderInsertContent(selectedData);
		this.setToPage(rendered);
		return rendered;
	}

	async renderUpdate(ID, tab, isReplaceState){
		if (isReplaceState == undefined) isReplaceState = false;
		await this.renderTab(ViewType.UPDATE, tab);
		await this.renderStep(ViewType.UPDATE, tab);
		await this.renderUpdateContent(ID);
		this.resetNavigation();
		await this.renderNavigation(this.navigation.itemMap.update, this.defaultNavigationIndex);
		this.setToMain(this.page);
		if (isReplaceState) this.replaceState('', ViewType.UPDATE, {id:ID});
		else this.pushState('', ViewType.UPDATE, {id:ID});
		return this.page;
	}

	getUpdateURL(ID) {
		return this.getURL('', ViewType.UPDATE, {id:ID});
	}

	async renderUpdateContent(ID){
		this.checkTemplate();
		let rendered = await super.renderUpdateContent(ID);
		this.setToPage(rendered);
		return rendered;
	}

	async renderTable(filter, tab, isReplaceState){
		if (isReplaceState == undefined) isReplaceState = false;
		await this.renderTab(ViewType.TABLE, tab);
		await this.renderStep(ViewType.TABLE, tab);
		if (tab != undefined && tab.length > 0) {
			let tabMap = this.tabViewMap[ViewType.TABLE];
			if(tabMap != undefined){
				return await this.renderTabContent(tabMap, tab, filter);
			}else{
				await this.getTable(filter);
			}
		} else {
			await this.getTable(filter);
		}
		this.resetNavigation();
		await this.renderNavigation(this.navigation.itemMap.table, this.defaultNavigationIndex);
		this.setToMain(this.page);
		if (isReplaceState) this.replaceState('', ViewType.TABLE);
		else this.pushState('', ViewType.TABLE);
		return this.page;
	}

	async getTable(filter, isView=false) {
		this.checkTemplate();
		let rendered = await super.getTable(filter, isView);
		this.setToPage(rendered);
		return rendered;
	}

	async renderTableForm(filter, tab, isReplaceState){
		if (isReplaceState == undefined) isReplaceState = false;
		await this.renderTab(ViewType.TABLE_FORM, tab);
		await this.renderStep(ViewType.TABLE_FORM, tab);
		let result = await this.getTableForm(filter);
		this.resetNavigation();
		await this.renderNavigation(this.navigation.itemMap.tableForm, this.defaultNavigationIndex);
		this.setToMain(result);
		return result;
	}

	async getTableForm(filter) {
		this.checkTemplate();
		this.checkTableForm();
		return await this.tableForm.render(this.title, filter);
	}

	/// NOTE data can be record or ID of record;
	async renderDetail(data, tab, isReplaceState){
		if (isReplaceState == undefined) isReplaceState = false;
		await this.renderTab(ViewType.DETAIL, tab);
		await this.renderStep(ViewType.DETAIL, tab);
		let ID;
		if(typeof data != 'object'){
			ID = data;
		} else {
			ID = data.id;
		}
		await this.renderDetailContent(data);
		this.resetNavigation();
		await this.renderNavigation(this.navigation.itemMap.detail, this.defaultNavigationIndex);
		this.setToMain(this.page);
		this.pushState('', ViewType.DETAIL, {id:ID});
		return this.page;
	}

	async renderDetailContent(data){
		this.checkTemplate();
		let rendered = await super.renderDetailContent(data);
		this.setToPage(rendered);
		return rendered;
	}

	async renderSummary(){
		this.checkTemplate();
		this.resetNavigation();
		await this.renderNavigation(this.navigation.itemMap.summary, this.defaultNavigationIndex);
		this.setToMain(this.page);
		return this.page;
	}

	async renderMainDialog(){
		return await this.renderSummaryDialog();
	}

	/**
	 * 
	 * @param {number} selectedData 
	 * @param {(id:number) => {}} callback 
	 * @returns 
	 */
	async renderInsertDialog(selectedData, callback){
		await this.renderInsertDialogContent(selectedData, callback);
		this.setToDialog(this.page);
		return this.page;
	}

	/**
	 * 
	 * @param {number} selectedData 
	 * @param {(id:number) => {}} callback 
	 * @returns 
	 */
	async renderInsertDialogContent(selectedData, callback){
		this.checkDialog();
		let rendered = await super.renderInsertDialogContent(selectedData, callback);
		this.setToPage(rendered);
		return rendered;
	}

	async renderUpdateDialog(ID){
		await this.renderUpdateDialogContent(ID);
		this.setToDialog(this.page);
		return this.page;
	}

	async renderUpdateDialogContent(ID){
		this.checkDialog();
		let rendered = await super.renderUpdateDialogContent(ID);
		this.setToPage(rendered);
		return rendered;
	}

	async renderTableDialog(filter){
	}

	async renderDetailDialog(ID){
	}

	async renderSummaryDialog(){
	}

	async renderTab(viewType, activeItem) {
		this.checkTemplate();
		let tab = await super.renderTab(viewType, activeItem);
		this.setToTab(tab);
	}

	async renderStep(viewType, activeItem) {
		this.checkTemplate();
		let step = await super.renderStep(viewType, activeItem);
		this.setToStep(step);
	}

	async resetNavigation() {
		this.navigation.set(this.navigation.itemMap.extension, 0);
		this.navigation.set(this.navigation.itemMap.model, 1);
	}

	async renderNavigation(item, index) {
		this.navigation.set(item, index);
		let navigation = await this.navigation.render();
		this.setToNavigator(navigation);
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

	setToPage(rendered) {
		this.page.dom.container.html('');
		this.page.dom.container.appendChild(rendered.html);
	}

	setToMain(result){
		this.main.home.dom.container.html('');
		this.main.home.dom.container.appendChild(result.html);
	}

	setToDialog(result) {
		this.main.appendDialog(result);
	}

	setToNavigator(rendered) {
		this.main.personalBar.home.dom.navigator.html('');
		this.main.personalBar.home.dom.navigator.appendChild(rendered.html);
	}

	hideTab() {
		this.main.home.dom.tabContainer.classList.add('hidden');
	}

	setToTab(result){
		if (result == undefined) return;
		this.main.home.dom.tabContainer.html('');
		this.main.home.dom.tabContainer.appendChild(result.html);
		this.main.home.dom.tabContainer.classList.remove('hidden');
	}

	hideStep() {
		this.main.home.dom.stepContainer.classList.add('hidden');
	}

	setToStep(result){
		if (result == undefined) return;
		this.main.home.dom.stepContainer.html('');
		this.main.home.dom.stepContainer.appendChild(result.html);
		this.main.home.dom.stepContainer.classList.remove('hidden');
	}

	async handleInsert(data, isRenderDetail=true){
		let id = undefined;
		if(this.protocol != null){
			let result = await this.protocol.insert(data);
			id = result.id;
			if (isRenderDetail) await this.renderDetail(result.id);
			else {
				this.form?.close();
				this.dialog?.close();
			}
			
		}else{
			console.error('Protocol is not set.');
		}
		return id;
	}

	async handleUpdate(data, isRenderDetail=true){
		let ID = undefined;
		if(this.protocol != null){
			let result = await this.protocol.update(data);
			let ID;
			if(typeof result != 'object'){
				ID = result;
			} else {
				ID = result.id;
			}
			if (isRenderDetail) await this.renderDetail(ID);
			else {
				this.form?.close();
				this.dialog?.close();
			}
		}else{
			console.error('Protocol is not set.');
		}
		return ID;
	}

	/// NOTE Override this method to extend other page.
	/// In this state, all pages are created without any component
	/// including meta.
	/// EventHandler can be pushed in to related array e.g. this.onCreateForm,
	/// which will be called by occurring event.
	async onCreate(){
		this.main.pageModelDict[this.modelName] = this;
		this.createNavigationViewItem();
	}

	onCreateForm(form){
		this.checkOnCreateForm(form);
	}

	onCreateDetail(detail){
		this.checkOnCreateDetail(detail);
	}

	onCreateTable(table){
		this.checkOnCreateTable(table);
	}

	onPrepareTable() {
		this.checkOnPrepareTable();
	}

	onCreateTableFilter(table){
		this.checkOnCreateTableFilter(table);
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

	checkOnPrepareTable(){
		for(let callback of this.prepareTableHandler){
			callback();
		}
	}

	checkOnCreateTable(detail){
		for(let callback of this.createTableHandler){
			callback(detail);
		}
	}

	checkOnCreateTableFilter(detail){
		for(let callback of this.createTableFilterHandler){
			callback(detail);
		}
	}
}