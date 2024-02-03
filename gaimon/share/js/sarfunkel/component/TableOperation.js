class TableOperation extends Button{
	constructor(template, order='1.0', callback=async (event)=>{}){
		super('', order, callback, []);
		this.template = template;
		this.operation = null;
	}

	async render(){
		if(!this.operation){
			this.operation = new DOMObject(this.template, this);
			for(let i of this.classList){
				this.operation.dom.operation.classList.add(i);
			}
			if(!this.isEnabled) this.operation.html.hide();
			let operation = this.operation.dom.operation;
			if(!operation) operation.onclick = this.callback;
		}
		return operation;
	}
}