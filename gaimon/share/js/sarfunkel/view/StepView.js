class StepView{
	constructor(flowCode){
		this.itemList = [];
		this.itemMap = {};
		this.mainItem = undefined;
		this.activeItem = undefined;
		this.view = undefined;
		this.protocol = new StepFlowProtocol();
		this.flowCode = flowCode;
	}

	clear() {
		this.itemList = [];
		this.itemMap = {};
		this.mainItem = undefined;
		this.activeItem = undefined;
	}

	appendItem(item){
		if (this.itemMap[item.ID] != undefined) return;
		this.itemList.push(item);
		this.itemMap[item.ID] = item;
		if(item.isMain){
			this.mainItem = item;
		}
	}

	async render(itemID, data){
		let result = await this.getAllStepFlowData();
		console.log(result);
		await this.renderStep(itemID, data);
		for (let item of this.itemList) {
			item.data = undefined;
			item.setData(result[item.ID]);
		}
		// if (itemID == undefined || itemID.length == 0) itemID = this.itemList[0].ID;
		let selectedItem = this.itemMap[itemID];
		if(selectedItem == undefined) selectedItem = this.mainItem;
		if(selectedItem == undefined){
			console.error(`No selected item ${itemID} is defined.`);
		}else{
			await this.hideAll();
			await this.deactivateAll();
			if (this.activeItem != undefined) await this.activeItem.deactivate();
			this.activeItem = selectedItem;
			await this.activeItem.activate(data);
		}
		return this.view;
	}

	sort() {
		this.itemList.sort((a, b) => VersionParser.compare(a.order, b.order));
	}

	async renderStep(itemID, data) {
		this.sort();
		if (this.view == undefined) {
			this.view = new DOMObject(TEMPLATE.StepView, this);
			for (let item of this.itemList) {
				let step = await item.renderStep(this);
				await this.setStepItemEvent(itemID, data, item, step);
				this.view.dom.container.appendChild(step.html);
			}
		}
	}

	async renderPage(itemID, data) {
		let item = this.itemMap[itemID];
		if (item == undefined) item = this.mainItem;
		if(item == undefined){
			console.error(`No selected item ${itemID} is defined.`);
			return;
		}
		await this.deactivateAll();
		await item.activate();
		this.activeItem = item;
		await item.render(itemID, data);
	}

	async setStepItemEvent(itemID, data, item, step) {
		let object = this;
		step.html.onclick = async function() {
			if (!item.isEnable) return;
			await object.deactivateAll();
			await item.activate();
			object.activeItem = item;
			await item.render(itemID, data);
		}
	}

	async getAllStepFlowData() {
		let result = await this.protocol.getAllStepFlowData(this.flowCode, this.getLogFlow());
		console.log(result);
		return result;
	}

	getLogFlow() {
		if (this.logFlow != undefined) {
			return this.logFlow;
		}
		return -1;
	}

	setLogFlow(ID) {
		this.logFlow = ID;
		for (let itemID in this.itemMap) {
			this.itemMap[itemID].setLogFlow(ID);
		}
	}

	async deactivateAll() {
		for (let item of this.itemList) {
			await item.deactivate();
		}
	}

	async hideAll(){

	}
}