let MUSTACHE_ICON = null;

async function checkMusTacheIcon(){
	if(MUSTACHE_ICON == null){
		let response = await GET('mustache/icon/get', undefined, 'json');
		if(response.isSuccess){
			MUSTACHE_ICON = response.results;
		}
	}
}

class SVGIcon{
	constructor(name){
		this.name = name;
		this.isSVG = true;
		this.icon = '';
		this.DOM = null;
		this.html = null;
	}

	async render(){
		await checkMusTacheIcon();
		let splitted = this.name.split('.');
		this.icon = MUSTACHE_ICON;
		for (let i of splitted) {
			if (this.icon[i] != undefined) this.icon = this.icon[i];
			else break
		}
		if (typeof this.icon == 'object') this.icon = '';
		this.DOM = new DOMObject(TEMPLATE.SideIcon, {SVG: this.icon});
		this.html = this.DOM.html;
		return this;
	}
}