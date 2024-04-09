class TabView{
	constructor(){
		this.itemList = [];
		this.itemMap = {};
		this.mainItem = undefined;
		this.activeItem = undefined;
		this.view = undefined;
	}

	appendItem(item){
		this.itemList.push(item);
		this.itemMap[item.ID] = item;
		if(item.isMain){
			this.mainItem = item;
		}
	}

	async render(itemID, data){
		await this.renderTab(itemID, data);
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
		this.itemList.sort((a, b) => {VersionParser.compare(a.order, b.order)});
	}

	async renderTab(itemID, data) {
		this.sort();
		if (this.view == undefined) {
			this.view = new DOMObject(TEMPLATE.TabView, this);
			for (let item of this.itemList) {
				let tab = await item.renderTab();
				await this.setTabItemEvent(itemID, data, item, tab);
				this.view.dom.container.appendChild(tab.html);
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

	async setTabItemEvent(itemID, data, item, tab) {
		let object = this;
		tab.html.onclick = async function() {
			await object.deactivateAll();
			await item.activate();
			object.activeItem = item;
			await item.render(itemID, data);
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