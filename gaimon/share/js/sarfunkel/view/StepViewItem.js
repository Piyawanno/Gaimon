class StepViewItem{
	constructor(ID, label, order, view){
		this.ID = ID;
		this.label = label;
		this.order = new VersionParser(order);
		this.view = view;
		this.viewItem = undefined;
		this.isMain = false;
		this.role = [];
	}

	appendRole(role, permissionTypeList){
		if(Array.isArray(permissionTypeList)){

		}else{
			this.role.push(role);
		}
	}

	async render(stepView, data){
		let isPermitted = true;
		if(isPermitted){

		}else{
			
		}
	}

	async renderStep() {
		if (this.viewItem == undefined) {
			this.viewItem = new DOMObject(TEMPLATE.StepViewItem, this);
		}
		return this.viewItem;
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

	async moveNext(data){
	}

	async moveBack(data) {

	}
}