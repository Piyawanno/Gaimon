class StepViewItem{
	constructor(ID, label, flowCode, order, renderFunction, page){
		this.ID = ID;
		this.label = label;
		this.order = new VersionParser(order);
		// this.view = undefined;
		this.flowCode = flowCode;
		this.viewItem = undefined;
		this.parameter = undefined;
		this.renderFunction = renderFunction;
		this.page = page;
		this.protocol = new StepFlowProtocol();
		this.isMain = false;
		this.role = [];
		this.isEnable = true;
		this.isVisible = true;
		this.data = undefined;
	}

	appendRole(role, permissionTypeList){
		if(Array.isArray(permissionTypeList)){

		}else{
			this.role.push(role);
		}
	}

	async render(stepView, data){
		if (!this.isEnable) return;
		let object = this;
		let isPermitted = true;
		if(isPermitted){
			if (this.renderFunction) {
				SHOW_LOADING_DIALOG(async function() {
					if (object.data.id != undefined) {
						object.parameter.id = object.data.id;
					}
					await object.page.onPrepareState();
					await object.renderFunction(object.parameter);
				});
				
			}
		}else{
			
		}
	}

	async renderStep() {
		if (this.viewItem == undefined) {
			this.viewItem = new DOMObject(TEMPLATE.StepViewItem, this);
		}
		return this.viewItem;
	}

	setLogFlow(ID) {
		if (this.parameter == undefined) this.parameter = {};
		this.parameter.logFlow = ID;
	}

	getLogFlow() {
		if (this.parameter != undefined && this.parameter.logFlow != undefined) {
			return this.parameter.logFlow;
		}
		return -1;
	}

	async getStepFlowData() {
		let result = await this.protocol.getStepFlowData(this.flowCode, this.ID, this.getLogFlow(), this.parameter);
		return result;
	}

	async getStepFlowDataForVisual() {
		let result = await this.protocol.getStepFlowDataForVisual(this.flowCode, this.ID, this.getLogFlow(), this.parameter);
		return result;
	}

	async checkStepFlowEnable() {
		let result = await this.protocol.checkStepFlowEnable(this.flowCode, this.ID, this.getLogFlow(), this.parameter);
		return result;
	}

	async checkStepFlowVisible() {
		let result = await this.protocol.checkStepFlowVisible(this.flowCode, this.ID, this.getLogFlow(), this.parameter);
		return result;
	}

	async hide(){

	}

	async show(){
		
	}

	async activate(data){
		if (this.viewItem) this.viewItem.dom.step.classList.add('current')
	}

	async deactivate(){
		if (this.viewItem) this.viewItem.dom.step.classList.remove('current')
	}

	async setData(result) {
		if (result == undefined) {
			this.viewItem.html.classList.add('hidden');
			this.viewItem.html.classList.add('hidden');
			this.isEnable = false;
			this.isVisible = false;
			return;
		}
		this.isEnable = result.isEnable;
		if (result.isEnable) {
			this.viewItem.dom.step.classList.remove('disable');
		} else {
			this.viewItem.dom.step.classList.add('disable');
		}
		if (result.isVisible) {
			this.viewItem.html.classList.remove('hidden');
		} else {
			this.isEnable = false;
			this.viewItem.html.classList.add('hidden');
		}
		this.data = result.data;
	}

	async checkEnable() {
		let result = await this.checkStepFlowEnable();
		
	}

	async checkVisible() {
		let result = await this.checkStepFlowVisible();
		// if (result) this.viewItem.html.classList.remove('hidden');
		// else this.viewItem.html.classList.add('hidden');
	}

	async moveNext(data){
	}

	async moveBack(data) {

	}
}