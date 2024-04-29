const MonitorPage = function(main, parent) {
	AbstractPage.call(this, main, parent);
	let object = this;
	this.title = "Monitor";
	this.model = "MonitorCategory";
	this.pageNumber = 1;
	this.limit = 10;

	object.role = ['Monitor'];

	this.prepare = async function() {
	}

	this.render = async function() {
		console.log("Monitor");
		let template = await TEMPLATE.get('erpbase.AddressRecord', true);
		console.log(template);
		let dom = new DOMObject(template, {});
		this.main.home.dom.container.append(dom);
	}

	this.renderState = async function(state) {
		
	}

	this.renderView =  async function(modelName, config, viewType='Form') {
		if (config == undefined) config = {};
		
	}
}