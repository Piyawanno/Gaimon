class TableOperation extends Button{
	constructor(template, order='1.0', callback=async (event)=>{}, url=async ()=>{}){
		super('', order, callback, [], url);
		this.template = template;
		this.operation = null;
	}

	render(){
		if(!this.operation){
			this.operation = new InputDOMObject(this.template, this);
			for(let i of this.classList){
				this.operation.dom.operation.classList.add(i);
			}
			if(!this.isEnabled) this.operation.html.hide();
			let operation = this.operation.dom.operation;
			if(operation) operation.onclick = this.callback;
			let object = this;
			this.url().then((url) => {
				if (url) {
					let urlPath = window.location.pathname + url;
					if (object.operation.dom.url) object.operation.dom.url.href = urlPath;
				}
			})
		}
		return this.operation;
	}
}