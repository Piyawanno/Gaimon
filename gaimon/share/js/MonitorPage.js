const MonitorPage = function(main, parent) {
	AbstractPage.call(this, main, parent);
	let object = this;
	this.title = "Monitor";
	this.pageNumber = 1;
	this.limit = 10;

	object.role = ['Monitor'];

	this.prepare = async function() {
		
	}

	this.render = async function() {
		///https://github.com/janl/mustache.js
		console.log("Monitor");
		let template = await TEMPLATE.get('MonitorPage', false);
		let container = new DOMObject(template, {'label': 'Hello'});
		let data = await GET('country/get/all'); //how to get data from monitor
		console.log(data);
		container.dom.button.onclick = function(){
			container.dom.header.style.color = 'white';
			container.dom.header.style.backgroundColor = '#162936';
		}
		this.main.home.dom.container.append(container);
	}

	this.renderState = async function(state) {
		
	}

	this.renderView =  async function(modelName, config, viewType='Form') {
		if (config == undefined) config = {};
	}
}