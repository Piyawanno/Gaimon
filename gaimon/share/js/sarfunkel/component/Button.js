class Button{
	constructor(label, order='1.0', callback=async (event)=>{}, classList=[], url=async (id)=>{}){
		this.label = label;
		this.classList = classList;
		this.callback = callback;
		this.isEnabled = true;
		this.template = null;
		this.button = null;
		this.order = new VersionParser(order);
		this.url = url;
		this.urlPath = null;
	}

	enable(){
		this.isEnabled = true;
		if(this.button != null) this.button.html.show();
	}

	disable(){
		this.isEnabled = false;
		if(this.button != null) this.button.html.hide();
	}

	async render(){
		if(this.button == null){
			this.template = TEMPLATE.FormButtonView;
			this.button = new DOMObject(this.template, this);
		}
		for(let i of this.classList){
			this.button.html.classList.add(i);
		}
		if(!this.isEnabled) this.button.html.hide();
		this.button.html.onclick = this.callback;
		return this.button;
	}
}