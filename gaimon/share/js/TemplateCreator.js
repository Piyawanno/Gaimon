const TemplateCreator = function(main, page) {
	AbstractPage.call(this, main);

	const object = this;
	this.main = main;
	this.page = page;

	this.creator = {};
	this.templateForm;
	this.templates = [];

	this.config = {
		hasFilter: false,
	}
	this.limit = 10;
	this.filter = {};
	
	this.init = async function(home, config){
		object.protocol = {};
		object.protocol.template = new TemplateCreatorProtocol(main);

		object.creator.label = new TemplateLabelCreator(main, this);
		object.creator.image = new TemplateImageCreator(main, this);
		object.creator.table = new TemplateTableCreator(main, this);
		if(home == undefined) return;
		object.home = home;
		let button = await object.appendAdditionalButton({cssClass: 'import_button', ID: 'template', label: 'Template', SVG: await CREATE_SVG_ICON('Template')});
		button.dom.template.onclick = async function(){
			await object.getData(object.limit);
			await object.changeState({state: 'template'}, `${object.page.pageID}/template`, object.page);
		}
	}

	this.renderState = async function(state) {
		if (state.state == 'form') await object.renderView(page.model, {isSetState: false, data: state.data, isView: state.isView});
	}

	this.getData = async function(limit = 10){
		await object.getTemplate(limit);
	}

	this.getTemplate = async function(limit){
		object.limit = limit;
		let data = {
			pageNumber: object.pageNumber,
			limit: limit,
			data : object.filter,
			model: page.model
		}
		let results = await object.protocol.template.get(data);
		let option = {
			data: results.data,
			count: results.count,
			operation: await object.getOperation()
		}
		await object.render();
		let table = await object.renderTable('Template', option);
		for(let i in table.records){
			let record = table.records[i];
			let content = `<input type="checkbox" rel="default">`;
			let domObject = new DOMObject(content);
			if(record.record.isDefault) domObject.dom.default.checked = true;
			domObject.dom.default.onclick = async function(){
				SHOW_CONFIRM_DIALOG('Do you want to change default?', async function(){
					await object.setDefaultTemplate(record.id, this.checked);
				}, async function(){
					domObject.dom.default.checked = !domObject.dom.default.checked;
				});
			}
			record.dom.default.append(domObject);
		}
	}

	this.getOperation = async function(){
		let operation = [{
			label: 'default', ID: 'default', icon: ''
		}]
		return operation;
	}

	this.render = async function(){
		object.templateForm = undefined;
		object.title = `${page.title} Template`;
		await AbstractPage.prototype.render.call(this);
		object.home.dom.add.onclick = async function(){
			await object.renderView('Template', {isSetState: true});
		}
	}

	this.renderView = async function(model, config, viewType = 'Form'){
		if(config == undefined) config = {};
		if(config.isSetState == undefined) config.isSetState = true;
		let formConfig = JSON.parse(JSON.stringify(config));
		formConfig.isSetState = false;
		object.templateForm = await AbstractPage.prototype.renderView.call(this, model, formConfig, viewType);
		object.templateForm.dom.title.html(`Add ${page.title} Template`);
		let template = new DOMObject(TEMPLATE.Template);
		object.templateForm.dom.additionalForm.append(template);
		await object.initOperationEvent(template);
		if(config.data != undefined){
			let detail = JSON.parse(config.data.detail);
			for(let i in detail){
				await object.appendTemplate(new DOMObject(detail[i].template), detail[i]);
			}
		}
		if(config.isSetState){
			await object.changeState({state: 'templateForm', data: config.data}, `${object.page.pageID}/templateForm`, object.page);
		}
	}

	this.initOperationEvent = async function(domObject){
		domObject.dom.alignLeft.onclick = async function(){

		}
		domObject.dom.alignCenter.onclick = async function(){
			
		}
		domObject.dom.alignRight.onclick = async function(){
			
		}
		domObject.dom.label.onclick = async function(){
			await object.creator.label.renderDialog();
		}
		domObject.dom.image.onclick = async function(){
			await object.creator.image.renderDialog();
		}
		domObject.dom.table.onclick = async function(){
			await object.creator.table.renderDialog();
		}
	}

	this.appendTemplate = async function(domObject, data){
		object.templates.push(data);
		object.templateForm.dom.additionalForm.page.append(domObject);
	}

	this.submit = async function(form){
		let result = await AbstractPage.prototype.submit.call(this, form);
		let data = {
			name: result.data.name,
			version: result.data.version,
			isDefault: form.rawData.isDefault,
			model: page.model,
			detail: JSON.stringify(object.templates),
			remark: '',
		}
		if(form.id != undefined) data.id = form.id;
		let content = '<div class="document_container" rel="document_container">';
		for(let i in object.templates){
			let template = object.templates[i].template;
			content += template;
		}
		content += '</div>';
		data.template = content;
		if(!result.isPass) return;
		if(form.id != undefined){
			data.id = form.id;
			await object.protocol.template.update({data: data});
		}else await object.protocol.template.insert({data: data});
		history.back();
	}

	this.setDefaultTemplate = async function(id, isDefault){
		await object.protocol.template.setDefaultTemplate({'id': id, 'model': page.model, 'isDefault': isDefault});
		RENDER_STATE();
	}

	this.getDefaultTemplate = async function(){
		let template = await object.protocol.template.getDefaultTemplate(page.model);
		if(template.message != undefined){
			SHOW_ALERT_DIALOG(template.message);
			return false;
		}
		return template.template;
	}

	this.delete = async function(form){
		await object.protocol.template.delete({'id': form.id, 'model': page.model});
		RENDER_STATE();
	}
}