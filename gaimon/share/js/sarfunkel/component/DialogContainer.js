class DialogContainer{
	constructor(main, parent){
		this.main = main;
		this.parent = parent;
		this.dialog = null;
		this.child = null;
		this.view = null;
		this.dialog = null;
	}

	setView(view){
		this.view = view;
		if (this.view.__instance__) this.dialog = this.view.__instance__;
	}

	async render(){
		// if(!this.dialog){
		// 	this.dialog = new DOMObject(TEMPLATE.DialogContainer);
		// }
		// return this.dialog;
		return this.view;
	}

	appendChild(dialog){
		if(!this.child){
			this.child = new DialogContainer(this, dialog);
			this.main.currentDialog = this.child;
		}
		return this.child;
	}

	close(){
		if(this.parent){
			this.main.currentDialog = this.parent;
		}else{

		}
		if(!this.view){
			this.view.close();
		}
	}
}