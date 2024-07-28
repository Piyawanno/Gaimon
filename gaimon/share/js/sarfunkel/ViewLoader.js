class ViewLoader{
	constructor(){
		this.modelName = '';
		this.meta = null;
		this.protocol = null;

		this.isCreated = false;
		this.role = [];
		this.accessList = [
			PermissionType.READ, PermissionType.WRITE,
			PermissionType.UPDATE, PermissionType.DROP,
		];
		this.permissionList = [];
		this.isRegistered = false;

		this.form = null;
		this.detail = null;
		this.table = null;
		this.tableForm = null;

		this.formClass = FormView;
		this.dialogClass = DialogView;
		this.detailClass = DetailView;
		this.tableClass = TableView;
		this.tableFormClass = TableFormView;
		this.recordClass = null;

		this.modelComponent = {};
		this.modelComponentViewMap = {};

		this.currentModelComponentViewMap = {};

		this.excludeInputViewMap = {};

		this.renderTabViewMap = {};
		this.tabViewMap = {};

		this.renderStepViewMap = {};
		this.stepViewMap = {};

		this.tabView = new TabView();
		this.stepView = new StepView();
		this.navigation = new NavigationView();
		this.defaultNavigationIndex = 2;

		this.stepProtocol = null;

		this.currentRecord = null;
		this.currentViewType = null;
	}

	async onCreate(){
		this.register();
	}

	async createMeta(config){
		if (!this.isCreated) {
			this.isCreated = true;
			if (this.onCreate) await this.onCreate();
		}
		let response = await GET(`input/${this.modelName}`);
		if(response.isSuccess){
			this.meta = new ModelMetaData(this, this.modelName, response);
			this.meta.extract();
			if (this.checkOnCreateMetaData) this.checkOnCreateMetaData(this.meta);
			await this.createComponentMeta(config);
		}else{
			console.error(response.message);
		}
	}

	async createComponentMeta(config) {
		for(let i in this.modelComponent){
			let component = this.modelComponent[i];
			await component.createMeta(config);
		}
	}

	appendModelComponent(component){
		component.parent = this;
		this.modelComponent[component.ID] = component;
		if (component.isTableForm) {
			let viewTypes = [ViewType.INSERT, ViewType.INSERT_DIALOG, ViewType.UPDATE, ViewType.UPDATE_DIALOG];
			for (let viewType of viewTypes) {
				if (this.modelComponentViewMap[viewType] == undefined) this.modelComponentViewMap[viewType] = []
				this.modelComponentViewMap[viewType].push(new ModelComponent(component, ViewType.TABLE_FORM));
			}
		}
		if (component.isTable) {
			let viewTypes = [ViewType.INSERT, ViewType.INSERT_DIALOG, ViewType.UPDATE, ViewType.UPDATE_DIALOG];
			for (let viewType of viewTypes) {
				if (this.modelComponentViewMap[viewType] == undefined) this.modelComponentViewMap[viewType] = []
				this.modelComponentViewMap[viewType].push(new ModelComponent(component, ViewType.TABLE));
			}
		}
		if (component.isDetailTable) {
			let viewTypes = [ViewType.DETAIL, ViewType.DETAIL_DIALOG];
			for (let viewType of viewTypes) {
				if (this.modelComponentViewMap[viewType] == undefined) this.modelComponentViewMap[viewType] = []
				this.modelComponentViewMap[viewType].push(new ModelComponent(component, ViewType.TABLE));
			}
		}
		if (component.isDetail) {
			let viewTypes = [ViewType.DETAIL, ViewType.DETAIL_DIALOG];
			for (let viewType of viewTypes) {
				if (this.modelComponentViewMap[viewType] == undefined) this.modelComponentViewMap[viewType] = []
				this.modelComponentViewMap[viewType].push(new ModelComponent(component, ViewType.DETAIL));
			}
		}
		if (component.isForm) {
			if (this.modelComponentViewMap[ViewType.INSERT] == undefined) this.modelComponentViewMap[ViewType.INSERT] = []
			this.modelComponentViewMap[ViewType.INSERT].push(new ModelComponent(component, ViewType.INSERT));
			
			if (this.modelComponentViewMap[ViewType.INSERT_DIALOG] == undefined) this.modelComponentViewMap[ViewType.INSERT_DIALOG] = []
			this.modelComponentViewMap[ViewType.INSERT_DIALOG].push(new ModelComponent(component, ViewType.INSERT_DIALOG));

			if (this.modelComponentViewMap[ViewType.UPDATE] == undefined) this.modelComponentViewMap[ViewType.UPDATE] = []
			this.modelComponentViewMap[ViewType.UPDATE].push(new ModelComponent(component, ViewType.UPDATE));
			
			if (this.modelComponentViewMap[ViewType.UPDATE_DIALOG] == undefined) this.modelComponentViewMap[ViewType.UPDATE_DIALOG] = []
			this.modelComponentViewMap[ViewType.UPDATE_DIALOG].push(new ModelComponent(component, ViewType.UPDATE_DIALOG));
		}
	}

	filterExcludeInput(excludeList) {
		for (let item of excludeList) {
			for (let i in this.meta.inputList) {
				let input = this.meta.inputList[i];
				if (input.columnName == item) {
					this.meta.inputList.splice(i, 1);
					break;
				}
			}
			for(let group of this.meta.groupList){
				for (let i in group.inputList) {
					let input = group.inputList[i];
					if (input.columnName == item) {
						group.inputList.splice(i, 1);
						break;
					}
				}
			}
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
		if (!this.isRegistered) {
			this.isRegistered = true;
			this.registerStep();
		}
	}

	registerStep() {
		if (this.renderStepViewMap == null) return;
		if (Object.keys(this.renderStepViewMap).length == 0) return;
		
	}

	async renderInsertContent(selectedData){
		this.currentRecord = null;
		this.checkForm();
		let rendered = await this.form.renderInsert(
			`Add ${this.title}`,
			selectedData,
			this.handleInsert.bind(this)
		);
		this.currentViewType = ViewType.INSERT;
		await this.renderComponent(ViewType.INSERT, selectedData, rendered.dom.additional_form);
		return rendered;
	}

	async renderUpdateContent(ID){
		let record = await this.protocol.getByID(ID);
		this.currentRecord = record;
		this.checkForm();
		let rendered = await this.form.renderUpdate(
			`Update ${this.title}`,
			record,
			this.handleUpdate.bind(this)
		);
		this.currentViewType = ViewType.UPDATE;
		await this.renderComponent(ViewType.UPDATE, ID, rendered.dom.additional_form);
		return rendered;
	}

	async renderDetailContent(ID){
		let data = ID;
		if(typeof data != 'object') data = await this.protocol.getByID(ID);
		this.currentRecord = data;
		this.checkDetail();
		let title = this.getDetailTitle(data);
		let rendered = await this.detail.render(title, data);
		this.currentViewType = ViewType.DETAIL;
		await this.renderComponent(ViewType.DETAIL, ID, rendered.dom.additional_form);
		return rendered;
	}

	getDetailTitle(record){
		return `Detail of ${this.title}`;
	}

	async getTable(filter, isView=false) {
		await this.checkTable();
		if (isView) {
			this.table?.addOperation?.operation?.html.hide();
			this.table.editOperation.isEnabled = false;
			this.table.deleteOperation.isEnabled = false;
		} else {
			this.table?.addOperation?.operation?.html.show();
			this.table.editOperation.isEnabled = true;
			this.table.deleteOperation.isEnabled = true;
		}
		let rendered = await this.table.render(this.title, filter);
		this.currentViewType = ViewType.TABLE;
		return rendered;
	}

	async getTableForm(filter) {
		this.checkTableForm();
		let rendered = await this.tableForm.render(this.title, filter);
		this.currentViewType = ViewType.TABLE_FORM;
		return rendered;
	}

	/**
	 * 
	 * @param {number} selectedData 
	 * @param {(id:number) => {}} callback 
	 * @returns 
	 */
	async renderInsertDialogContent(selectedData, callback){
		this.currentRecord = null;
		this.checkDialog();
		let isRenderDetail = true;
		let handleInsert = this.handleInsert.bind(this);
		if (callback != undefined) {
			isRenderDetail = false;
			let handle = this.handleInsert.bind(this)
			handleInsert = async function(data) {
				return await handle(data, isRenderDetail);
			}
		}
		let rendered = await this.dialog.renderInsert(
			`Add ${this.title}`,
			selectedData,
			handleInsert,
			callback
		)
		await this.renderComponent(ViewType.INSERT_DIALOG, selectedData, rendered.dom.form);
		return rendered;
	}

	/**
	 * 
	 * @param {number} ID 
	 * @param {(id:number) => {}} callback 
	 * @returns 
	 */
	async renderUpdateDialogContent(ID, callback){
		let record = undefined;
		if (typeof ID == 'object') record = ID;
		else record = await this.protocol.getByID(ID);
		this.currentRecord = record;
		this.checkDialog();
		let isRenderDetail = true;
		let handleUpdate = this.handleUpdate.bind(this);
		if (callback != undefined) {
			isRenderDetail = false;
			let handle = this.handleUpdate.bind(this)
			handleUpdate = async function(data) {
				return await handle(data, isRenderDetail);
			}
		}
		let rendered = await this.dialog.renderUpdate(
			`Update ${this.title}`,
			record,
			handleUpdate,
			callback
		)
		await this.renderComponent(ViewType.UPDATE_DIALOG, ID, rendered.dom.form);
		return rendered;
	}

	async renderComponent(viewType, data, tag) {
		let items = this.modelComponentViewMap[viewType];
		if (items == undefined) return;
		items.sort((a, b) => VersionParser.compare(a.order, b.order));
		this.currentModelComponentViewMap[viewType] = [];
		for (let item of items) {
			item.parent = this;
			let component = await item.render.bind(item)(data, tag, viewType);
			let input = {'ID': item.component.ID, 'component': component};
			this.currentModelComponentViewMap[viewType].push(input);
		}
		
	}

	appendTab(item) {
		let object = this;
		if (this.tabViewMap[item.view] == undefined) {
			this.tabViewMap[item.view] = new TabView();
			let mainTab = new TabViewItem(this.pageID, this.title, '0.1', item.view);
			mainTab.isMain = true;
			mainTab.renderFunction = async function(tabView, data) {
				SHOW_LOADING_DIALOG(async function() {
					await object.onPrepareState();
					let renderFuntion = object.renderMap[item.view].bind(object);
					await renderFuntion(data);	
				});
			}
			this.tabViewMap[item.view].appendItem(mainTab);
		}
		this.tabViewMap[item.view].appendItem(item);
	}

	async renderTab(viewType, activeItem) {
		let tabView = this.tabViewMap[viewType];
		if (tabView == undefined) {
			this.hideTab();
			return;
		}
		if (activeItem == undefined || activeItem.length > 0) {
			tabView.activeItem = tabView.mainItem;
		} else {
			tabView.activeItem = tabView.itemMap[activeItem];
		}
		let tab = await tabView.render(activeItem);
		return tab;
	}

	setStep(steps) {
		if (steps  == undefined) return;
		if (this.renderStepViewMap == null) return;
		if (Object.keys(this.renderStepViewMap).length == 0) return;
		this.stepViewMap = {};
		for (let flowCode in this.renderStepViewMap) {
			if (steps[flowCode] == undefined) continue;
			if (steps[flowCode].stepViewMap == undefined) steps[flowCode].stepViewMap = {};
			if (steps[flowCode].stepViewMap[flowCode] == undefined) {
				steps[flowCode].stepViewMap[flowCode] = new StepView(flowCode);
				Object.id(steps[flowCode].stepViewMap[flowCode]);
			}
			this.stepViewMap = steps[flowCode].stepViewMap;
			for (let item of steps[flowCode].item) {
				if (this.renderStepViewMap[flowCode][item.code] == undefined) continue;
				let renderFunction = this.renderStepViewMap[flowCode][item.code];
				item.stepItem = new StepViewItem(item.code, item.title, flowCode, item.stepOrder.origin, renderFunction, this);
				this.stepViewMap[flowCode].appendItem(item.stepItem);
			}
		}
	}

	async renderStep(flowCode, activeItem, parameter) {
		if (this.stepViewMap == undefined || this.stepViewMap == null) {
			this.hideStep();
			return;
		}
		this.currentFlowCode = flowCode;
		this.currentStep = activeItem;
		let stepView = this.stepViewMap[flowCode];
		stepView.activeItem = stepView.itemMap[activeItem];
		stepView.activeItem.parameter = parameter;
		if (parameter != undefined && parameter.logFlow != undefined) {
			stepView.setLogFlow(parameter.logFlow);
		} else {
			stepView.setLogFlow(undefined);
		}
		let step = await stepView.render(activeItem);
		this.renderComponent("LOG_FLOW", parameter?.logFlow)
		return step;
	}

	getStepData(flowCode, step) {
		if (this.stepViewMap == undefined || this.stepViewMap == null) return;
		let stepView = this.stepViewMap[flowCode];
		if (stepView == undefined) return;
		let item = stepView.itemMap[step];
		if (item == undefined) return;
		return item.data;
	}

	hideTab() {
		main.home.dom.tabContainer.classList.add('hidden');
	}

	hideStep() {
		main.home.dom.stepContainer.classList.add('hidden');
	}

	checkForm(){
		if(!this.form){
			this.form = new this.formClass(this);
		}
	}

	checkDetail() {
		if(!this.detail){
			this.detail = new this.detailClass(this);
		}
	}

	checkTable(){
		if(!this.table){
			this.table = new this.tableClass(this);
		}
	}

	checkTableForm(){
		if(!this.tableForm){
			this.tableForm = new this.tableFormClass(this);
		}
	}

	checkDialog(){
		if(!this.dialog){
			this.dialog = new this.dialogClass(this);
		}
	}

	onCreateForm(form){
	}

	onCreateDetail(detail){
	}

	onCreateTable(table){
	}

	onPrepareTable() {
	}

	onCreateTableFilter(table){
	}

	setToDialog(result) {
		console.log(result);
		main.appendDialog(result);
	}


	async handleInsert(data){
		let id = undefined;
		if(this.protocol != null){
			let result = await this.protocol.insert(data);
			id = result.id;
			this.form?.close();
			this.dialog?.close();
		}else{
			console.error('Protocol is not set.');
		}
		return id;
	}

	async handleUpdate(data){
		let id = undefined;
		if(this.protocol != null){
			let result = await this.protocol.update(data);
			id = result.id;
			this.form?.close();
			this.dialog?.close();
		}else{
			console.error('Protocol is not set.');
		}
		return id;
	}

	handleSubmitError(message){
		let text = Mustache.render(TEMPLATE.ErrorMessageList, {message});
		SHOW_ALERT_DIALOG(text);
	}
}