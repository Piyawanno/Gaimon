class FormGroupView{
	constructor(config){
		this.label = config.label;
		this.id = config.id;
		this.order = new VersionParser(config.order);
		this.inputList = [];
		this.group = null;
		this.template = null;
	}

	async render(){
		if(this.group == null){
			this.template = TEMPLATE.FormGroupView;
			this.group = new DOMObject(this.template, this);
			await this.setInput();
		}
		return this.group;
	}

	sort(){
		this.inputList.sort((a, b) => {VersionParser.compare(a.order, b.order)});
	}

	async setInput(){
		let group = this.group.dom.group;
		for(let i of this.inputList){
			let rendered = await i.renderForm();
			group.append(rendered.html);
		}
		return this.group;
	}
}