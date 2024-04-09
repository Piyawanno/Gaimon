class SideIcon{
	 /**
     * 
     * @param {string} name 
     * @param {string} icon 
     * @param {string} order 
	 * @param {InputMetaData} input 
     * @param {DOMObject} dom 
     * @param {(event) => {}} callback 
     */
	constructor(name, icon, order, input, dom, callback){
		this.name = name;
		this.icon = icon;
		this.order = new VersionParser(order);
		this.input = input;
		this.dom = dom;
		this.callback = callback;
		this.svg = null;
	}

	async render(record){
		if (this.svg == undefined) {
			this.svg = new SVGIcon(this.icon);
			await this.svg.render()
			this.setEvent(record);
		}
		return this.svg;
	}

	setEvent(record) {
		this.svg.DOM.dom.icon.onclick = this.callback;
	}
}