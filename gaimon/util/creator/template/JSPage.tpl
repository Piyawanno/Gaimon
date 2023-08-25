const {modelName}Page = function(main, parent) {{
	AbstractPage.call(this, main, parent);

	let object = this;

	this.title = "{modelName}";
	this.model = "{modelName}";
	this.pageNumber = 1;
	this.limit = 10;
	this.filter = {{}};

	this.prepare = async function() {{
		object.protocol = {{}};
		await LOAD_JS_EXTENSION('{moduleName}', 'protocol/{modelName}Protocol.js');
		object.protocol = new {modelName}Protocol(object.main);
	}}

	this.render = async function() {{
		AbstractPage.prototype.render.call(this);
		await object.get{modelName}();
	}}

	this.renderState = async function(state) {{
		if (state.state == 'search') await object.renderSearchForm(object.model, {{isSetState: false}});
		if (state.state == 'form') await object.renderForm(object.model, {{isSetState: false, data: state.data}});
	}}

	this.renderSearchForm = async function(){{
		let form = await AbstractPage.prototype.renderSearchForm.call(this, object.model, {{data : object.filter}});
		form.dom.cancel.onclick = async function(){{
			object.filter = form.getData().data;
			object.filter['name'] = '';
			await object.render(object.limit);
			object.home.dom.filter.hide();
		}}
	}}

	this.search = async function(form){{
		object.filter = form.getData().data;
		await object.render(object.limit);
		object.home.dom.filter.hide();
	}}

	this.getData = async function(limit){{
		await object.get{modelName}(limit);
	}}

	this.get{modelName} = async function(limit=10){{
		object.limit = limit;
		let data = {{
			pageNumber: object.pageNumber,
			limit: limit,
			data : object.filter
		}}
		let result = await object.protocol.get{modelName}(data);
		await object.renderTable(object.model, result);
	}}

	this.submit = async function(form){{
		let result = await AbstractPage.prototype.submit.call(this, form);
		if (!result.isPass) return;
		if (form.id != undefined){{
			result.data.id = form.id;
			let isSuccess = await object.protocol.update{modelName}(result.data);
		}}else{{
			let isSuccess = await object.protocol.insert{modelName}(result.data);
		}}
		await object.render();
		history.back();
	}}

	this.delete = async function(form){{
		let isSuccess = await object.protocol.drop{modelName}({{
			"id": form.id
		}});
		location.reload();
	}}
}}