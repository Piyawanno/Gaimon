class TabViewItem{
	constructor(ID, label, order, view){
		this.ID = ID;
		this.label = label;
		this.order = new VersionParser(order);
		this.view = view;
		this.viewItem = undefined;
		this.renderFunction = undefined;
		this.isMain = false;
		this.role = [];
	}

	appendRole(role, permissionTypeList){
		if(Array.isArray(permissionTypeList)){

		}else{
			this.role.push(role);
		}
	}

	async render(tabView, data){
		let isPermitted = true;
		console.log('render');
		if(isPermitted){
			if (this.renderFunction) this.renderFunction(data)
		}else{
			
		}
	}

	async renderTab() {
		if (this.viewItem == undefined) {
			this.viewItem = new DOMObject(TEMPLATE.TabViewItem, this);
		}
		return this.viewItem;
	}

	async hide(){

	}

	async show(){
		
	}

	async activate(data){
		if (this.viewItem) this.viewItem.dom.tab.classList.add('highlightTab')
	}

	async deactivate(){
		if (this.viewItem) this.viewItem.dom.tab.classList.remove('highlightTab')
	}
}