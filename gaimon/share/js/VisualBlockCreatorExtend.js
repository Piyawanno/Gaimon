const VisualBlockCreatorExtend = function() {
	VisualBlockCreator.call(this);
	const object = this;
	object.inputDOM = {};

	this.render = async function(page, stepForm, header, toolData, record) {
		object.page = page;
		object.stepForm = stepForm;
		this.isInit = false;
		const toolList = [];
		for(const tool of toolData) {
			const template = await TEMPLATE.get('VisualBlockTool', false);
			const rendered = Mustache.render(template, tool);
			toolList.push(rendered);
			object.toolDict[tool.step] = tool;
		}
		object.form = new DOMObject(await TEMPLATE.get('VisualBlockCreator', false), {toolList});
		object.form.dom.visualblock_header.html(header);
		stepForm.dom.form.html(object.form);
		await object.canvas.create(object.form);
		await object.handleTool();
		await object.handleData(record);
		this.isInit = true;
	}

	this.reRender = async function() {
		if (object['stepForm']) object.stepForm.dom.form.html(object.form);
	}


	this.createInput = async function(id, tool, data) {
		const option = {
			id,
			step : tool.step,
			label : tool.label
		};
		const form = new DOMObject(await TEMPLATE.get('VisualBlockForm'), option);
		for(const item of tool.input) {
			const input = {
				group : item.id,
				header : item.header,
				step : tool.step,
				id : id
			};
			const group = new DOMObject(await TEMPLATE.get('VisualBlockInput'), input);
			const body = `visualblock_form_${input.group}_${input.step}_${input.id}`;
			if(item.isForm) {
				const config = item.input;
				if(data != undefined) {
					config.data = data[item.id];
				}
				if(data != undefined) {
					const table = await config.getTableForm(config, data[item.id]);
					// group.dom[body].append(table);
					group.dom[body].set(table, item.id);
					form.dom.visualblock_form_container.append(group);
					group.setData(data[item.id]);
				}else{
					const table = await config.getTableForm(config);
					// group.dom[body].append(table);
					group.dom[body].set(table, item.id);
					form.dom.visualblock_form_container.append(group);
					// group.setData(data[item.id]);
				}
			} else {
				let inputList = ''

				if(data !== undefined) {
					inputList = await object.sanitizeInput(item.input, item.modelName, data[item.id]);
					group.setData(data[item.id]);
				}else{
					inputList = await object.sanitizeInput(item.input, item.modelName, {});
				}
				group.dom[body].set(inputList, item.id);
				// group.dom[body].append(inputList);
				form.dom.visualblock_form_container.append(group);
			}
			if (object.inputDOM[id]){
				
			} else{
				object.inputDOM[id] = {};
			}
			object.inputDOM[id][item.id] = group.dom[body];
		}
		form.dom.visualblock_form_container.tool = tool;
		object.form.dom.visualblock_operation.append(form);
	}

	this.sanitizeInput = async function(inputList, modelName, data) {

		let form = await object.page.getForm(modelName, {
			isSetState: false,
			data: data,
			title: '',
			inputs: inputList,
			inputPerLine: 1});
		// return new DOMObject(form.dom.form.html);
		// return form.dom.form;
		form.html = form.dom.form;
		return form;
	}

	this.getInputData = async function(form) {
		const result = {};
		const dom = new DOMObject(form.outerHTML);
		const data = dom.getData();
		for(let i in data.data) {
			let input;
			input = form.querySelector(`input[rel="${i}"]`);
			if(input != undefined) {
				result[i] = input.value;
				continue;
			}
			input = form.querySelector(`select[rel="${i}"]`);
			if(input != undefined) {
				result[i] = input.value;
				continue;
			}
			input = form.querySelector(`textarea[rel="${i}"]`);
			if(input != undefined) {
				result[i] = input.value;
				continue;
			}
		}
		return result;
	}

	this.getAllInputData = async function(form) {
		const result = {};
		const dom = new DOMObject(form.outerHTML);
		const data = dom.getAllData();
		for(let i in data.data) {
			input = form.querySelector(`input[rel="${i}"]`);
			if(input != undefined) {
				result[i] = input.value;
				if (input['currentValue']  != undefined){
					result[i] = input.currentValue.value;
				}

				continue;
			}
			input = form.querySelector(`select[rel="${i}"]`);
			if(input != undefined) {
				result[i] = input.value;
				if (input['currentValue']  != undefined){
					result[i] = input.currentValue.value;
				}
				continue;
			}
			input = form.querySelector(`textarea[rel="${i}"]`);
			if(input != undefined) {
				result[i] = input.value;
				if (input['currentValue']  != undefined){
					result[i] = input.currentValue.value;
				}
				continue;
			}
		}
		return result;
	}

	this.getTableData = async function(form, groupName) {
		const result = [];
		formTemp = form;
		for(const tr of form[groupName].tbody.children) {
			result.push(await object.getAllInputData(tr));
		}
		return result;
	}

	this.createTab = async function(event, id, tool) {
		const sim = {...tool};
		sim.id = id;
		sim.operation = true;
		sim.operationIcon = '&#10005;';
		const dom = new DOMObject(await TEMPLATE.get('VisualBlockTool', false), sim);
		dom.html.classList.add('content');
		dom.html.style.position = 'absolute';
		dom.html.style.margin = '0';
		object.form.dom.visualblock_content.append(dom);
		dom.html.style.left = `${event.offsetX - dom.html.clientWidth/2}px`;
		dom.html.style.top = `${event.offsetY - dom.html.clientHeight/2}px`;
		await object.handleDragContent(dom.html);
		await object.handleClickContent(dom.html, tool);
		await object.handleBlockOperationClick(dom.html);
		dom.html.click();
	}
}