const VisualBlockCreator = function() {
	const object = this;

	this.canvas = new VisualBlockCanvas();

	this.form;
	this.toolDict = {};
	this.isInit = false;
	object.isDragAble = true;
	object.isInputValid = true;

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

	this.enableDrag = async function() {
		object.isDragAble = true;
	}

	this.disableDrag = async function() {
		object.isDragAble = false;
	}

	this.handleTool = async function() {
		async function handleStart(event) {
			const toolType = event.target.getAttribute('rel');
			event.dataTransfer.setData("toolType", toolType.split('_')[2]);
		}
		for(const tool of object.form.html.querySelectorAll('.visualblock_tool_item')) {
			tool.setAttribute('draggable', true);
			tool.ondragstart = handleStart;
		}
		const content = object.form.dom.visualblock_content;
		content.ondragover = object.handleDragTool;
		content.ondrop = object.handleDropTool;
	};

	this.handleData = async function(record) {
		const layout = record.stepLayout;
		for(let i in record.step) {
			const item = record.step[i];
			const step = item.detailTable;
			const id = item.id;
			const tool = object.toolDict[step];
			const event = {
				offsetX : 50,
				offsetY : 50
			};
			const offset = layout[i];
			if(offset != undefined) {
				event.offsetX = offset.x;
				event.offsetY = offset.y;
			}
			if(parseInt(item.nextStep) > 0) {
				item.nextStep = `${record.step[item.nextStep].detailTable}_${item.nextStep}`;
			}
			await object.handleClearOperation();
			await object.createInput(id, tool, item);
			await object.createTool(event, id, tool, item);
		}
		await object.checkNextStep();
		for(let i in record.step) {
			const item = record.step[i];
			const step = item.detailTable;
			const id = item.id;
			const select = object.form.dom.visualblock_operation[`nextStep_${step}_${id}`];
			for(const option of select.children) {
				if(option.value == item.nextStep) {
					option.setAttribute('selected', true);
				}
			}
			const event = {
				target : select
			};
			await object.handleChangeNextStep(event);
		}
	};

	this.createTestInput = async function() {
		const input = new DOMObject(await TEMPLATE.get('VisualBlockInput'), {});
		object.form.dom.visualblock_operation.html(input);
	};

	this.handleClearFocus = async function() {
		for(const item of object.form.dom.visualblock_content.querySelectorAll('.visualblock_tool_item')) {
			item.classList.remove('focus');
			const blockOperation = item.querySelector('div[rel="visualblock_block_operation"]');
			blockOperation.classList.add('hidden');
		}
	};

	this.handleClearOperation = async function() {
		for(const item of object.form.dom.visualblock_operation.querySelectorAll('.visualblock_form')) {
			item.classList.add('hidden');
		}
	};

	this.handleDragTool = async function(event) {
		event.preventDefault();
	};

	this.handleDropTool = async function(event) {
		event.preventDefault();
		if(event.target != object.form.dom.visualblock_content) return;
		const toolType = event.dataTransfer.getData("toolType");
		const tool = object.toolDict[toolType];
		let id = -1;
		if(tool.oncreate != undefined) id = await tool.oncreate();
		if(id != -1) {
			await object.handleClearOperation();
			await object.createInput(id, tool);
			await object.createTool(event, id, tool);
		}
		await object.checkNextStep();
	};

	this.handleDragContent = async function(element) {
		if (!object.isDragAble) return
		let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
		element.onmousedown = dragMouseDown;
		async function dragMouseDown(event) {
			event = event || window.event;
			event.preventDefault();
			pos3 = event.clientX;
			pos4 = event.clientY;
			document.onmousemove = elementDrag;
			document.onmouseup = closeDragElement;
		}
		async function elementDrag(event) {
			event = event || window.event;
			event.preventDefault();
			pos1 = pos3 - event.clientX;
			pos2 = pos4 - event.clientY;
			pos3 = event.clientX;
			pos4 = event.clientY;
			element.style.top = (element.offsetTop - pos2) + "px";
			element.style.left = (element.offsetLeft - pos1) + "px";
			object.canvas.update();
		}
		async function closeDragElement() {
			document.onmouseup = null;
			document.onmousemove = null;
		}
	};

	this.handleClickContent = async function(element, tool) {
		element.onclick = async function(event) {
			await object.handleClearFocus();
			await object.handleClearOperation();
			element.classList.add('focus');
			const blockOperation = element.querySelector('div[rel="visualblock_block_operation"]');
			blockOperation.classList.remove('hidden');
			const splited = element.getAttribute('rel').split('_');
			const form = object.form.dom.visualblock_operation[`visualblock_form_${splited[2]}_${splited[3]}`];
			
			if(form) {
				form.tool = tool;
				form.classList.remove('hidden');
				if(tool.onClick != undefined) await tool.onClick(element, object, `${splited[2]}_${splited[3]}`);
			}
		}
	};

	this.handleBlockOperationClick = async function(element) {
		const blockOperation = element.querySelector('div[rel="visualblock_block_operation"]');
		blockOperation.onclick = async function() {
			const event = {
				target : element
			};
			object.handleRemoveTool(event);
		};
	};

	this.handleChangeNextStep = async function(event) {
		const select = event.target;
		const value = select.value;
		const src = select.getAttribute('rel').split('_');
		const source = object.form.dom.visualblock_content[`visualblock_tool_${src[1]}_${src[2]}`];
		if(value != '-1') {
			const des = value.split('_');
			const destination = object.form.dom.visualblock_content[`visualblock_tool_${des[0]}_${des[1]}`];
			object.canvas.draw(source, destination);
		} else {
			object.canvas.remove(source);
		}
	};

	this.handleRemoveNextStep = async function(id) {
		const source = object.form.dom.visualblock_content[`visualblock_tool_${id}`];
		object.canvas.remove(source);
	};

	this.handleRemoveTool = async function(event) {
		const remove = event.target;
		const splited = remove.getAttribute('rel').split('_');
		SHOW_CONFIRM_DIALOG('Do you want to delete this data?', async function(){
			const tool = object.toolDict[splited[2]];
			if(tool.onremove != undefined && (await tool.onremove(splited[2], splited[3], object))) {
				await object.handleRemoveNextStep(`${splited[2]}_${splited[3]}`);
				object.form.dom.visualblock_content[`visualblock_tool_${splited[2]}_${splited[3]}`].remove();
				delete object.form.dom.visualblock_content[`visualblock_tool_${splited[2]}_${splited[3]}`];
				const operation = object.form.dom.visualblock_operation;
				operation[`visualblock_form_${splited[2]}_${splited[3]}`].remove();
				delete operation[`visualblock_form_${splited[2]}_${splited[3]}`];
				for(let i in operation) {
					const comp = i.split('_');
					if(comp[comp.length - 1] == splited[3]) {
						delete operation[i];
					}
				}
				await object.checkNextStep();
				for(const child of operation.children) {
					const rel = child.getAttribute('rel');
					const splited = rel.split('_');
					const select = child.querySelector(`select[rel='nextStep_${splited[2]}_${splited[3]}']`);
					const event = {
						target : select
					};
					await object.handleChangeNextStep(event);
				}
			}
		});
	};

	this.createTool = async function(event, id, tool) {
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
	};

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
					group.dom[body].append(table);
					form.dom.visualblock_form_container.append(group);
					group.setData(data[item.id]);
				}else{
					const table = await config.getTableForm(config);
					group.dom[body].append(table);
					form.dom.visualblock_form_container.append(group);
					// group.setData(data[item.id]);
				}
			} else {
				let inputList = ''
				if(data != undefined) {
					inputList = await object.sanitizeInput(item.input, item.modelName, data[item.id]);
					group.setData(data[item.id]);
				}else{
					inputList = await object.sanitizeInput(item.input, item.modelName, {});
				}
				tempBody = group.dom[body];
				tempInput = inputList;
				group.dom[body].set(inputList, item.id);
				// group.dom[body].append(inputList);
				form.dom.visualblock_form_container.append(group);
			}
		}
		form.dom.visualblock_form_container.tool = tool;
		object.form.dom.visualblock_operation.append(form);
	}

	this.morphRemoveTool = async function(event, icon, tool) {
		const remove = event.target;
		const splited = remove.getAttribute('rel').split('_');
		SHOW_CONFIRM_DIALOG('', async function(){
			const tool = object.toolDict[splited[2]];
			if(tool.onremove != undefined && (await tool.onremove(splited[2], splited[3], object))) {
				await object.handleRemoveNextStep(`${splited[2]}_${splited[3]}`);
				object.form.dom.visualblock_content[`visualblock_tool_${splited[2]}_${splited[3]}`].remove();
				delete object.form.dom.visualblock_content[`visualblock_tool_${splited[2]}_${splited[3]}`];
				const operation = object.form.dom.visualblock_operation;
				operation[`visualblock_form_${splited[2]}_${splited[3]}`].remove();
				delete operation[`visualblock_form_${splited[2]}_${splited[3]}`];
				for(let i in operation) {
					const comp = i.split('_');
					if(comp[comp.length - 1] == splited[3]) {
						delete operation[i];
					}
				}
				await object.checkNextStep();
				for(const child of operation.children) {
					const rel = child.getAttribute('rel');
					const splited = rel.split('_');
					const select = child.querySelector(`select[rel='nextStep_${splited[2]}_${splited[3]}']`);
					const event = {
						target : select
					};
					await object.handleChangeNextStep(event);
				}
			}
		});
	};

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

	this.checkNextStep = async function() {
		const operation = object.form.dom.visualblock_operation;
		for(const child of operation.children) {
			const rel = child.getAttribute('rel');
			const splited = rel.split('_');
			const select = child.querySelector(`select[rel='nextStep_${splited[2]}_${splited[3]}']`);
			const current = select.value;
			const removeList = [];
			for(const option of select.children) {
				if(option.value != '-1') removeList.push(option);
			}
			for(const option of removeList) {
				option.remove();
			}
			for(const form of operation.children) {
				const attr = form.getAttribute('rel');
				const comp = attr.split('_');
				let checked = attr != `visualblock_form_${splited[2]}_${splited[3]}`;
				checked = checked && select.querySelector(`option[value='${comp[2]}_${comp[3]}']`) == null;
				if(checked) {
					const label = form.getAttribute('data-label');
					const html = `<option value="${comp[2]}_${comp[3]}" localize>${label}</option>`;
					select.insertAdjacentHTML('beforeend', html);
					select.onchange = object.handleChangeNextStep;
					const option = select.querySelector(`option[value="${comp[2]}_${comp[3]}"]`);
					if(option.value == current) option.setAttribute('selected', true);
				}
			}
		}
	};

	this.getVisualBlockData = async function() {
		const result = [];
		const content = object.form.dom.visualblock_content;
		const relate = content.getBoundingClientRect();
		for(let i in content) {
			if(i.includes('visualblock_tool_')) {
				const rect = content[i].getBoundingClientRect();
				const splited = i.split('_');
				const data = {
					id : splited[3],
					step : splited[2],
					x : rect.x - relate.x + rect.width/2,
					y : rect.y - relate.y + rect.height/2,
				};
				const option = await object.getVisualBlockOption(`${splited[2]}_${splited[3]}`);
				for(let i in option) {
					data[i] = option[i];
				}
				result.push(data);
			}
		}
		return result;
	};

	this.inputValidation = async function(id, validateFunction) {
		const container = object.form.dom.visualblock_operation.visualblock_form_container;
		if(container != undefined) {
			const nextValue = object.form.dom.visualblock_operation[`nextStep_${id}`].value;
			const nextStep = parseInt(nextValue) != -1 ? nextValue.split('_')[1] : -1
			if(typeof container[Symbol.iterator] === 'function') {
				let result = {nextStep};
				for(const item of container) {
					let tool = item.tool;
					for(let i in tool.input){
						let input = tool.input[i];
						let header = input.id;
						let inputItem = item[`visualblock_form_${header}_${id}`];
						if(inputItem != undefined) {
							if (input['getInput']){
								let getInput = input.getInput;
								result[header] = await getInput(object, inputItem)
							}else{
								result[header] = await object.getAllInputData(inputItem)
							}
						}
					}
				}
				return result;
			} else {
				let result = {nextStep};
				let tool = container.tool;
				for(let i in tool.input){
					let input = tool.input[i];
					let header = input.id;
					let inputItem = container[`visualblock_form_${header}_${id}`];
					
					if(inputItem != undefined) {
						if (input['getInput']){
							let getInput = input.getInput;
							result[header] = await getInput(object, inputItem)
						}else{
							result[header] = await object.getAllInputData(inputItem)
						}
					}
				}
				return result;
			}
		}
	}

	this.getVisualBlockOption = async function(id) {
		const container = object.form.dom.visualblock_operation.visualblock_form_container;
		if(container != undefined) {
			const nextValue = object.form.dom.visualblock_operation[`nextStep_${id}`].value;
			const nextStep = parseInt(nextValue) != -1 ? nextValue.split('_')[1] : -1
			if(typeof container[Symbol.iterator] === 'function') {
				let result = {nextStep};
				for(const item of container) {
					let tool = item.tool;
					for(let i in tool.input){
						let input = tool.input[i];
						let header = input.id;
						let inputItem = item[`visualblock_form_${header}_${id}`];
						if(inputItem != undefined) {
							if (input['getInput']){
								let getInput = input.getInput;
								result[header] = await getInput(object, inputItem)
							}else{
								result[header] = await object.getAllInputData(inputItem)
							}
						}
					}
				}
				return result;
			} else {
				let result = {nextStep};
				let tool = container.tool;
				for(let i in tool.input){
					let input = tool.input[i];
					let header = input.id;
					let inputItem = container[`visualblock_form_${header}_${id}`];
					
					if(inputItem != undefined) {
						if (input['getInput']){
							let getInput = input.getInput;
							result[header] = await getInput(object, inputItem)
						}else{
							result[header] = await object.getAllInputData(inputItem)
						}
					}
				}
				return result;
			}
		}
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
	};

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
	};

	this.getTableData = async function(form) {
		const result = [];
		for(const tr of form.tbody.children) {
			result.push(await object.getAllInputData(tr));
		}
		return result;
	};

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
	};
};