class TableRecordOperation extends Button{
	constructor(label, icon, order='1.0', callback=async (event, record)=>{}){
		super(label, order, callback, []);
		this.icon = new SVGIcon(icon);
		this.isLabel = false;
	}

	async render(record){
		await this.icon.render();
		this.svg = this.icon.icon;
		let operation = new DOMObject(TEMPLATE.TableRecordOperation, this);
		for(let i of this.classList){
			operation.dom.operation.classList.add(i);
		}
		if(!this.isEnabled)operation.html.hide();
		operation.dom.operation.onclick = async (event) => {
			await this.callback(event, record)
		};
		return operation;
	}
}