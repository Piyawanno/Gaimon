const AbstractView = function(page) {
	let object = this;

	object.page = page;
	object.isInitEvent = false;

	object.steps = [];
	object.tabs = [];

	this.getBlankView = async function(config, viewType) {
		if (config == undefined) config = {};
		let viewTemplate;
		if (viewType == 'Form') viewTemplate = TEMPLATE.Form;
		else if (viewType == 'Dialog') viewTemplate = TEMPLATE.Dialog;
		else if (viewType == 'SearchForm') viewTemplate = TEMPLATE.SearchForm;
		else if (viewType == 'SearchDialog') viewTemplate = TEMPLATE.SearchDialog;
		else if (viewType == 'ConfirmDialog') viewTemplate = TEMPLATE.ConfirmDialog;
		else return;
		let view = new DOMObject(viewTemplate, {title: config.title, isForm: true});
		if(config.isView){
			let operations = view.dom.operation.getElementsByClassName('abstract_button');
			for(let button of operations){
				let rel = button.getAttribute('rel');
				if(rel != 'cancel') button.hide();
				else button.html('Close');
			}
		}
		// await object.initViewEvent(view, config, viewType);
		return view;
	}

	this.getView = async function(modelName, config, viewType) {
		if (config == undefined) config = {};
		if (config.title == undefined) {
			if (config.data == undefined) {
				config.title = `Add ${object.page.title}`;
			} else {
				config.title = `Edit ${object.page.title}`;
			}
			if(config.isView) config.title = `View ${object.page.title}`;
			if (viewType == 'SearchForm' || viewType == 'SearchDialog') config.title = `Filter ${object.page.title}`;
		}

		let viewGroupTemplate;
		let isSearchForm = false;
		if (viewType == 'Form') viewGroupTemplate = TEMPLATE.Group;
		else if (viewType == 'Dialog') viewGroupTemplate = TEMPLATE.GroupDialog;
		else if (viewType == 'SearchForm' || viewType == 'SearchDialog') {
			viewGroupTemplate = TEMPLATE.Group;
			isSearchForm = true;
		}
		else if (viewType == 'ConfirmDialog') viewGroupTemplate = TEMPLATE.GroupDialog;
		else return;

		let view = await object.getBlankView(config, viewType)
		let input = await object.prepareConfig(modelName, config);
		config = await object.getViewConfig(config);
		let {exceptURL, autoCompleteMap, fileMatrixMap, imageMap, advanceInputMap, inputs} = await object.page.util.prepareInput(modelName, input);
		view.dom.form.html('');
		let columnLinkMap = {};
		if(viewType == 'SearchDialog'){
			let filter = await object.getSearchDialogView(view, input);
			view.dom.form.append(filter);
			view.dom.form.filter = filter;
		}else{
			if (config.data) {
				columnLinkMap = AbstractInputUtil.prototype.getLinkColumn(input, config.data)
			}
			
			for (let item of input) {
				if (item.isGroup) {
					let group = new DOMObject(viewGroupTemplate, item);
					if (item.input == undefined) continue;
					let count = 0;
					for (let subItem of item.input) {
						if (!isSearchForm || (isSearchForm && subItem.isSearch)) {
							let tag = await object.appendInput(view, subItem, config, group.dom.group, isSearchForm);
							if (tag != undefined && config.isView && columnLinkMap[subItem.columnName]) {
								if (tag.dom[`${subItem.columnName}_view`] != undefined) {
									tag.dom[`${subItem.columnName}_view`].classList.add('hotLink');
									tag.dom[`${subItem.columnName}_view`].onclick = async function() {
										AbstractInputUtil.prototype.triggerLinkEvent(object.page, columnLinkMap[subItem.columnName]);
									}
								}
							}
							count += 1;
						}
					}
					if (count > 0) view.dom.form.append(group, undefined, undefined, view.dom);
				} else {
					if (!isSearchForm || (isSearchForm && item.isSearch)) {
						let tag = await object.appendInput(view, item, config, view.dom.form, isSearchForm);
						if (config.isView && columnLinkMap[item.columnName]) {
							tag.dom[`${item.columnName}_view`].classList.add('hotLink');
							tag.dom[`${item.columnName}_view`].onclick = async function() {
								AbstractInputUtil.prototype.triggerLinkEvent(object.page, columnLinkMap[subItem.columnName]);
							}
						}
					}
				}
			}
		}
		await object.page.util.setAutoCompleteMap(view, autoCompleteMap);
		await object.page.util.setFileMatrixMap(view, fileMatrixMap);
		await object.page.util.setImageMap(view, imageMap);
		await object.page.util.setPrerequisiteInput(modelName, exceptURL, view, config.data);
		if (config.hasEdit) {
			view.setData(config.data, ['form']);
			view.id = config.data.id;
		}
		if(config.isView){
			let operations = view.dom.operation.getElementsByClassName('abstract_button');
			for(let button of operations){
				let rel = button.getAttribute('rel');
				if(rel != 'cancel') button.hide();
				else button.html('Close');
			}
			view.readonly();
		}
		// await object.initViewEvent(view, config, viewType);
		if(Object.keys(advanceInputMap).length) await object.initAdvanceFormEvent(view, advanceInputMap);

		view.dom.childTable = {};
		view.dom.form.tables = [];
		if(!input.childInput) input.childInput = [];
		for (let child of input.childInput) {
			let table = await object.page.tableView.getView(child.modelName, undefined, 'TableForm');
			table.modelName = child.modelName;
			table.inputName = input.childInputParentMap[child.modelName];
			view.dom.childTable[child.modelName] = table;
			view.dom.form.tables.push(table);
			view.dom.additionalForm.append(table);
			if (config.data) {
				if (config.data[input.childInputParentMap[child.modelName]]) {
					await table.createMultipleRecord(config.data[input.childInputParentMap[child.modelName]]);
				}
			}
			
		}
		return view;
	}

	this.initAdvanceFormEvent = async function(view, advanceInputMap){
		view.dom.switch.show();
		view.dom.isAdvance.onchange = async function(){
			for(let i in advanceInputMap){
				if(this.checked) view.dom[`${i}_box`].show();
				else view.dom[`${i}_box`].hide();
			}
		}
	}

	this.getSearchDialogView = async function(view, input){
		let filter = new DOMObject(TEMPLATE.Filter);
		if(!object.page.filter) object.page.filter = {};
		if(!object.page.compare) object.page.compare = {};
		if(!object.page.parameterLabel) object.page.parameterLabel = {};
		if(!filter.filter) filter.filter = object.page.filter;
		if(!filter.compare) filter.compare = object.page.compare;
		if(!filter.parameterLabel) filter.parameterLabel = object.page.parameterLabel;
		await object.getSearchParameter(filter, input);
		filter.dom.add.onclick = async function(){
			let value = filter.dom.filter.value;
			if(value == '') return;
			let parameter = filter.dom.parameter.value;
			let parameterLabel = filter.dom.parameter.selectedOptions[0].text;
			let compare = filter.dom.compare.value;			
			filter.filter[parameter] = value;
			filter.compare[parameter] = compare;
			filter.parameterLabel[parameter] = parameterLabel;
			await object.renderSearchTag(view, filter);
		}
		await object.renderSearchTag(view, filter);
		return filter;
	}

	this.renderSearchTag = async function(view, filter){
		view.dom.additionalForm.html('');
		for(let i in filter.filter){
			let name = `${filter.parameterLabel[i]} ${filter.compare[i]} ${filter.filter[i]}`;
			let tag = new DOMObject(TEMPLATE.FormTag, {name});
			tag.dom.delete.onclick = async function(){
				delete filter.filter[i];
				delete filter.compare[i];
				delete filter.parameterLabel[i];
				tag.html.remove();
			}
			view.dom.additionalForm.append(tag);
		}
	}

	this.getSearchParameter = async function(filter, input){
		filter.dom.parameter.html('');
		filter.dom.additional.html('');
		for (let item of input) {
			if(item.isGroup){
				for(let i in item.input){
					
					let option = `<option value="${item.input[i].columnName}" typeName="${item.input[i].typeName}">${item.input[i].label}</option>`;
					if(!item.input[i].isSearch) continue;
					if(item.input[i].option){
						item.input[i].inputPerLine = 1;
						item.input[i].isRequired = false;
						option = new DOMObject(TEMPLATE.input.SelectInput, item.input[i]);
						filter.dom.additional.append(option);
						filter.dom[item.input[i].columnName] = option.dom[item.input[i].columnName];
					}else filter.dom.parameter.append(option);
				}
			}else{
				if(!item.isSearch) continue;
				let option = `<option value="${item.columnName}" typeName="${item.typeName}">${item.label}</option>`;
				filter.dom.parameter.append(option);
			}
		}
		filter.dom.parameter.onchange = async function(){
			if(!this.selectedOptions[0]) return;
			let typeName = this.selectedOptions[0].getAttribute('typeName');
			let type = await object.getType(typeName);
			await object.getSearchCompareSymbol(filter, type);
		}
		filter.dom.parameter.onchange();
	}

	this.getType = async function(typeName){
		let type = '';
		if(typeName == 'Number') type = 'Number';
		else if(typeName == 'Text') type = 'Text';
		return type;
	}

	this.getSearchCompareSymbol = async function(filter, type){
		filter.dom.compare.html('');
		let compareSymbol = [];
		if(type == 'Number') compareSymbol = ['=', '!=', '>', '<', '>=', '<='];
		else if(type == 'Text') compareSymbol = ['=', '!=', 'Like'];
		else compareSymbol = ['='];
		for(let i in compareSymbol){
			let option = `<option value="${compareSymbol[i]}">${compareSymbol[i]}</option>`;
			filter.dom.compare.append(option);
		}
		filter.dom.compare.onchange = async function(){
			filter.dom.filter.setAttribute('type', type);
		}
		filter.dom.compare.onchange();
	}

	this.getInnerView = async function(modelName, config, viewType) {
		let view = await object.getView(modelName, config, viewType);
		return new DOMObject(view.dom.form.innerHTML);
	}

	this.renderBlankView = async function(config, viewType) {
		if (config == undefined) config = {};
		let destination = await object.getRenderDestination(viewType);
		let view = await object.getBlankView(config, viewType);
		await object.initViewEvent(view, config, viewType);
		destination.html('');
		destination.append(view);
		await object.getViewConfig(config);
		if (object.steps.length > 0) {
			await object.renderStepTab(view, config);
		}
		return view;
	}

	this.renderByView = async function(view, config, viewType) {
		if (config == undefined) config = {};
		let destination = await object.getRenderDestination(viewType);
		await object.initViewEvent(view, config, viewType);
		destination.html('');
		destination.append(view);
		return view;
	}

	this.renderView = async function(modelName, config, viewType = 'Form') {
		if (config == undefined) config = {};
		let destination = await object.getRenderDestination(viewType);
		let view = await object.getView(modelName, config, viewType);
		await object.initViewEvent(view, config, viewType);
		view.modelName = modelName;
		destination.html('');
		destination.append(view);
		// if (viewType == 'SearchForm') destination.toggle();
		if (object.steps.length > 0) {
			await object.renderStepTab(view, config);
		}
		return view;
	}

	this.getViewConfig = async function(config) {
		if (Object.keys(config).length == 0) {
			config.isSetState = true;
			config.hasEdit = false;
		} else {
			if (config.data != undefined && Object.keys(config.data).length != 0) config.hasEdit = true;
			else config.hasEdit = false;
		}
		if (config.isSetState == undefined) config.isSetState = true;
		if (config.step != undefined) await object.appendSteps(config.step);
		return config;
	}

	this.appendSteps = async function(stepName) {
		object.steps = [];
		object.stepMap = {};
		if (main.viewStepMap[stepName]) {
			for (let step of main.viewStepMap[stepName]) {
				if (step.isVisible == undefined) { 
					step.isVisible = async function() {
						return true
					};
				}
				if (step.isEnable == undefined) { 
					step.isEnable = async function() {
						return true
					};
				}
				object.stepMap[step.pageID] = step;
				object.steps.push(step);
			}
		}
	}

	// this.appendSteps = async function(stepName) {
	// 	object.steps = [];
	// 	object.stepMap = {};
	// 	if (object.page.viewStepMap[stepName]) {
	// 		for (let step of object.page.viewStepMap[stepName]) {
	// 			object.stepMap[step.pageID] = step;
	// 			object.steps.push(step);
	// 		}
	// 	}
	// }

	this.renderStepTab = async function(view, config = {}) {
		object.stepTabs = [];
		object.stepTabMap = {};
		if (view.dom.step == undefined) return;
		view.dom.step.html('');
		for(let step of object.steps){
			if (main.pageIDDict[step.pageID] == undefined) continue;
			step.page = main.pageIDDict[step.pageID];
			if (step.isSelected) selectedStep = step.state;
			let component = new DOMObject(TEMPLATE.AbstractStep, {name: step.title});
			if (await step.isEnable(config.data)) {
				component.dom.step.onclick = async function() {
					if (step.source == undefined) return;
					if (config.data == undefined) return;
					let stepConfig = {}
					let result = await step.source.callback(config.data);
					if (result == undefined) return;
					stepConfig.data = result;
					stepConfig.isSetState = false;
					stepConfig.state = step.state;
					stepConfig.selectedStep = step.pageID;
					SHOW_LOADING_DIALOG(async function(){
						await step.page.onPrepareState();
						await step.callback('', stepConfig, 'Form');
					});
				}
				component.dom.step.classList.remove('disable');
			} else {
				component.dom.step.classList.add('disable');
			}
			object.stepTabMap[step.pageID] = component;
			object.stepTabs.push(component);
			// console.log(config);
			if (await step.isVisible(config.data)) {
				view.dom.step.append(component);
			}
		}
		if (config.selectedStep != undefined) {
			await object.highlightStepTab(config.selectedStep);
		}
		view.dom.step.show();
	}

	this.highlightStepTab = async function(pageID){
		for (let component of object.stepTabs) {
			component.dom.step.classList.remove('current');
		}
		object.stepTabMap[pageID].dom.step.classList.add('current');
	}


	this.prepareConfig = async function(modelName, config) {
		let input;
		let inputPerLine = 2;
		if (config == undefined) config = {};
		if (config.inputs != undefined) {
			input = config.inputs;
			input.childInput = config.childInput != undefined ? config.childInput : [];
			input.childInputParentMap = config.childInputParentMap;
			let resultInput = await object.page.util.getMergedInputData(modelName);
			inputPerLine = resultInput.inputPerLine;
		} else {
			let resultInput = await object.page.util.getMergedInputData(modelName);
			input = resultInput.input
			input.childInput = resultInput.childInput;
			input.childInputParentMap = resultInput.childInputParentMap;
			inputPerLine = resultInput.inputPerLine;
		}
		if (config.inputPerLine != undefined) inputPerLine = config.inputPerLine;
		config.inputPerLine = inputPerLine;
		return input;
	}

	this.appendInput = async function(view, item, config, target, isSearch=false) {
		if (target == undefined) target = view.dom.form;
		if (config.excludeInput && config.excludeInput.includes(item.columnName)) return;
		let input;
		try {
			// NOTE Deep copy
			let inputConfig = JSON.parse(JSON.stringify(item));
			if(!inputConfig.isForm && !isSearch) return;
			inputConfig.hasEdit = config.hasEdit;
			// if (inputConfig.inputPerLine == undefined) {
			// 	inputConfig.inputPerLine = config.inputPerLine;
			// }
			if (config.inputPerLine != undefined){
				inputConfig.inputPerLine = config.inputPerLine
			}
			if (isSearch) {
				inputConfig.isRequired = false;
				inputConfig.isFilter = true;
				inputConfig.isEditable = true;
			}
			if(!inputConfig.config) inputConfig.config = {};
			inputConfig.config.isView = config.isView;
			input = renderInput(inputConfig);
			if (inputConfig.typeName == "RichText") {
				input.dom[inputConfig.columnName].quill = new Quill(input.dom[inputConfig.columnName], await object.page.util.getQuillConfig(inputConfig));
			}
			target.append(input, undefined, undefined, view.dom);
		} catch(error){
			console.error(error);
			console.error(`No input type ${item.typeName}`);
		}
		return input;
	}

	this.getRenderDestination = async function(viewType) {
		let destination;
		if (viewType == 'Form') {
			destination = object.page.main.home.dom.container;
		} else if (viewType == 'Dialog' || viewType == 'SearchDialog') {
			destination = object.page.main.home.dom.dialog;
		} else if (viewType == 'SearchForm') {
			destination = object.page.home.dom.filter;
		} else if (viewType == 'ConfirmDialog') {
			destination = main.home.dom.alertDialog;
		} else {
			return;
		}
		return destination;
	}

	this.initViewEvent = async function(view, config, viewType) {
		if (config.isView == undefined) config.isView = false;
		if (view.isInitEvent != undefined) return;
		view.isInitEvent = true;
		let closeFunction;
		let isSearchForm = false;
		let isSearchDialog = false;
		if (viewType == 'Form') {
			closeFunction = object.page.cancel;
		} else if (viewType == 'Dialog') {
			config.isSetState = false;
			closeFunction = function() {
				object.page.main.home.dom.dialog.html('');
			}
		} else if (viewType == 'SearchForm') {
			isSearchForm = true;
			config.isSetState = false;
			closeFunction = view.clearData;
		} else if (viewType == 'SearchDialog') {
			isSearchDialog = true;
			config.isSetState = false;
			closeFunction = function(){
				view.dom.form.filter.clearData();
				view.dom.form.filter.filter = {};
				view.dom.form.filter.parameterLabel = {};
				view.dom.form.filter.compare = {};
				object.page.filter = {};
				SHOW_LOADING_DIALOG(async function(){
					await object.renderSearchTag(view, view.dom.form.filter);
					await object.page.getData(object.page.limit);
					object.page.main.home.dom.dialog.html('');
				});
			}			
		} else if (viewType == 'ConfirmDialog') {
			config.isSetState = false;
			closeFunction = function() {
				main.home.dom.alertDialog.html('');
			}
		} else {
			return;
		}
		async function submit() {
			let result = view.getData();
			if (view.dom.form && view.dom.form.tables) {
				for (let table of view.dom.form.tables) {
					if (table.records == undefined) break;
					if (!Array.isArray(table.records)) break;
					result.data[table.inputName] = []
					for (let record of table.records) {
						let recordResult = record.getData();
						result.isPass = result.isPass & recordResult.isPass
						if (record.id) recordResult.data.id = record.id;
						result.data[table.inputName].push(recordResult.data);
					}
				}
			}
			if (!isSearchForm && !isSearchDialog) {
				if (view.onSubmit != undefined) view.onSubmit(view);
				else if (object.page.restProtocol != undefined) {
					
					if (view.id != undefined) result.data.id = view.id;
					let data = result.data;
					if (!result.file.isEmpty()) {
						data = result.file;
						data.append('data', JSON.stringify(result.data));
					}
					if (view.id != undefined) {
						await object.page.restProtocol.update(data);
					} else {
						await object.page.restProtocol.insert(data);
					}
					view.close();
				} else {
					object.page.submit(view);
				}
			} else if (isSearchDialog) {
				let filter = view.dom.form.filter;
				if (view.onSubmit != undefined) view.onSubmit(view);
				else {
					let result = filter.getData();
					object.page.filter = filter.filter;
					object.page.compare = filter.compare;
					object.page.parameterLabel = filter.parameterLabel;
					for(let i in result.data){
						if(i == 'parameter' || i == 'compare' || i == 'filter') continue;
						object.page.filter[i] = result.data[i];
					}						
					SHOW_LOADING_DIALOG(async function(){
						await object.page.getData(object.page.limit);
						object.page.main.home.dom.dialog.html('');
					});						
				}
			} else {
				if (view.onSubmit != undefined) view.onSubmit(view);
				else {
					object.page.filter = result.data;
					SHOW_LOADING_DIALOG(async function(){
						await object.page.getData(object.page.limit);
					});
				}
			}
		}
		if (view.dom.submit != undefined) {
			view.dom.submit.onclick = async function(){
				await submit()
			}
		}
		if (view.dom.confirm != undefined) {
			view.dom.confirm.onclick = async function(){
				await submit()
			}
		}

		if (view.dom.cancel != undefined) {
			view.dom.cancel.onclick = async function(){
				closeFunction();
			}
		}
		view.close = closeFunction;

		if (view.dom.close != undefined) {
			view.dom.close.onclick = async function(){
				object.page.main.home.dom.dialog.html('');
			}
		}

		view.show = async function() {
			await object.renderByView(view, config, viewType);
		}

		if (config.operation) {
			view.dom.operation.html('');
			for (let i in config.operation) {
				let operation = new DOMObject(TEMPLATE.Button, config.operation[i]);
				view.dom.operation.append(operation, config.operation.ID);
			}
		}
		if (config.isSetState == undefined) config.isSetState = true;
		if (config.isSetState) {
			if (config.state == undefined) {
				object.page.changeFormState({state: viewType.toLowerCase(), title: config.title, data: config.data, isView: config.isView}, `${object.page.pageID}/${viewType.toLowerCase()}`);
			} else {
				object.page.changeFormState({state: config.state, title: config.title, data: config.data, isView: config.isView}, `${object.page.pageID}/${config.state}`);
			}
		}
	}
}