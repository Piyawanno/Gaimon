class PageMenuView{
	constructor(){
		this.template = null;
		this.menu = null;
	}
	async render(){
		if(this.menu == null){
			this.template = TEMPLATE.PageMenuView;
			this.menu = new DOMObject(this.template);
		}
	}
}