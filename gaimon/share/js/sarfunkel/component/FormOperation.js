class FormOperation extends Button{
	constructor(label, icon=null, isEnableInput=false, order='1.0', callback=async (event, record)=>{}, url=async (id)=>{}){
		super(label, order, callback, [], url);
		if(icon != null) this.icon = new SVGIcon(icon);
		this.isLabel = false;
		this.urlPath = undefined;
		this.isEnableInput = isEnableInput;
	}

	async render(record){
		if(this.icon) await this.icon.render();
		if (record) {
			let url = await this.url(record.id);
			if (url) this.urlPath = window.location.pathname + url;
		}
		let operation = new DOMObject(TEMPLATE.FormOperation, this);
		for(let i of this.classList){
			operation.dom.operation.classList.add(i);
		}
		if(!this.isEnabled) operation.html.hide();
		operation.dom.url.onclick = async (event) => {
			if(event.target.getAttribute('rel') == null) operation.dom.isEnable.checked = !operation.dom.isEnable.checked;
			await this.callback(event, record);
		};
		this.operation = operation;
		return operation;
	}
}