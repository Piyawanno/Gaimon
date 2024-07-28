class DetailOperation extends Button{
	constructor(label, icon, order='1.0', callback=async (event, record)=>{}, url=async (id)=>{}){
		super(label, order, callback, [], url);
		this.icon = new SVGIcon(icon);
		this.isLabel = false;
		this.urlPath = undefined;
	}

	async render(record){
		await this.icon.render();
		this.svg = this.icon.icon;
		if (record) {
			let url = await this.url(record.id);
			if (url) this.urlPath = window.location.pathname + url;
		}
		let operation = new DOMObject(TEMPLATE.DetailOperation, this);
		for(let i of this.classList){
			operation.dom.operation.classList.add(i);
		}
		if(!this.isEnabled) operation.html.hide();
		operation.dom.operation.onclick = async (event) => {
			await this.callback(event, record);
		};
		return operation;
	}
}