class BlankView{
	constructor(page){
		this.page = page;
		this.template = null;
		this.blank = null;
	}

	async render(title){
		if(this.blank == null){
			this.template = TEMPLATE.BlankView;
			this.blank = new DOMObject(this.template, {title});
		}else{

		}
		return this.blank;
	}

	async close() {
		history.back();
	}
}