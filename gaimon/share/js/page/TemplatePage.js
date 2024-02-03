const TemplatePage = function(main, parent){
	AbstractPage.call(this, main, parent);

	let object = this;
	this.title = 'Template';

	this.model = [
		{value: 'Customer', label: 'Customer'},
		{value: 'SaleProduct', label: 'SaleProduct'},
		{value: 'Quotation', label: 'Quotation'}
	]

	this.getMenu = async function(isSubMenu){
		object.menu = await CREATE_MENU(object.pageID, 'Template', 'Template', isSubMenu);
		return object.menu;
	}

	this.render = async function(config){
		AbstractPage.prototype.render.call(this, config);
		object.domObject = new DOMObject(TEMPLATE.TemplatePage);
		object.home.dom.dataContainer.html('');
		object.home.dom.dataContainer.append(object.domObject);
		object.home.dom.dataContainer.style.height = '100%';
		await object.renderOperation();
	}

	this.renderOperation = async function(){
		await object.setModelInput();
		await object.setInputLabel('Customer');		
	}

	this.setModelInput = async function(){
		object.domObject.dom.model_container.html('');
		let content = '<select rel="model">';
		for(let i in object.model){
			let model = object.model[i];
			content += `<option value="${model.value}">${model.label}</option>`;
		}
		content += '</select>';
		let domObject = new DOMObject(content);
		object.domObject.dom.model_container.append(domObject);
		object.domObject.dom['model'] = domObject.dom.model;
		domObject.dom.model.onchange = async function(){
			await object.setInputLabel(this.value);
		}
	}

	this.setInputLabel = async function(model){
		object.domObject.dom.input_container.html('');
		let rawInput = await object.getRawInputData(model);
		for(let i in rawInput.input){
			let input = rawInput.input[i];
			let content = `<div class="template_operation_label" draggable="true" ondragstart="main.page.template.drag(event, '${input.columnType}')" rel="${input.columnName}">${input.label}</div>`;
			let domObject = new DOMObject(content);
			object.domObject.dom.input_container.append(domObject);
			object.domObject.dom.input_container[input.columnName] = domObject.dom[input.columnName];
		}
	}

	this.allowDrop = function(event){
		event.preventDefault();
	}

	this.drag = function(event, type){
		event.dataTransfer.setData('rel', event.target.getAttribute('rel'));
		event.dataTransfer.setData('name', event.target.getAttribute('name'));
		event.dataTransfer.setData('type', type);
	}

	this.drop = function(event){
		event.preventDefault();
		const rel = event.dataTransfer.getData('rel');
		const name = event.dataTransfer.getData('name');
		const type = event.dataTransfer.getData('type');
		const x = event.offsetX;
		const y = event.offsetY;
		console.log(rel, name, type);
		// if(type == 'Image') object.setImageElementStyle('', false, rel, type, x, y);
		// else object.setElementStyle('', false, rel, type, x, y);
	}

	this.setElementStyle = function(element, isEdit, rel, type, x, y){

	}
}