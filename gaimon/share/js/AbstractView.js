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
		else if (viewType == 'ExportExcelDialog') viewTemplate = TEMPLATE.ExportExcelDialog;
		else return;
		let view = new InputDOMObject(viewTemplate, {title: config.title, isForm: true});
		object.setOperationButton(config, view);
		// await object.initViewEvent(view, config, viewType);
		return view;
	}

	this.setOperationButton = function(config, view){
		if(config.isView){
			let operations = view.dom.operation.getElementsByClassName('abstract_button');
			for(let button of operations){
				let rel = button.getAttribute('rel');
				if(rel == 'cancel') button.html('Close');
				else if(rel == 'edit') button.show();
				else button.hide();
			}
		}else if(view.dom.edit != undefined){
			view.dom.edit.hide();
		}
	}

	this.initInputView = async function(tag, item, config, columnLinkMap) {
		if (tag != undefined && config.isView && columnLinkMap[item.columnName]) {
			if (tag.dom[`${item.columnName}_view`] == undefined) return;
			tag.dom[`${item.columnName}_view`].classList.add('hotLink');
			tag.dom[`${item.columnName}_view`].onclick = async function() {
				AbstractInputUtil.prototype.triggerLinkEvent(object.page, columnLinkMap[item.columnName]);
			}
		}
	}

	this.getView = async function(modelName, config, viewType) {
		let state = new ViewCreatorState(object, modelName, config, viewType);
		let view = await state.create();
		view.getViewData = function() {
			return object.getViewData(view);
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
		let filter = new InputDOMObject(TEMPLATE.Filter);
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
						option = new InputDOMObject(TEMPLATE.input.SelectInput, item.input[i]);
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

	this.getExportExcelDialogView = async function(view, input){
		let filter = new InputDOMObject(TEMPLATE.Filter);
		if(!object.page.filter) object.page.filter = {};
		if(!object.page.compare) object.page.compare = {};
		if(!object.page.parameterLabel) object.page.parameterLabel = {};
		if(!filter.filter) filter.filter = object.page.filter;
		if(!filter.compare) filter.compare = object.page.compare;
		if(!filter.parameterLabel) filter.parameterLabel = object.page.parameterLabel;
		await object.getSearchParameter(filter, input);
		// filter.dom.add.onclick = async function(){
		// 	let value = filter.dom.filter.value;
		// 	if(value == '') return;
		// 	let parameter = filter.dom.parameter.value;
		// 	let parameterLabel = filter.dom.parameter.selectedOptions[0].text;
		// 	let compare = filter.dom.compare.value;			
		// 	filter.filter[parameter] = value;
		// 	filter.compare[parameter] = compare;
		// 	filter.parameterLabel[parameter] = parameterLabel;
		// 	await object.renderSearchTag(view, filter);
		// }
		return filter;
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

	this.renderBlankView = async function(config, viewType, checkEdit) {
		if (config == undefined) config = {};
		let destination = await object.getRenderDestination(viewType);
		let view = await object.getBlankView(config, viewType);
		await object.initViewEvent(view, config, viewType, checkEdit);
		destination.html('');
		destination.append(view);
		await object.getViewConfig(config);
		if (object.steps.length > 0) {
			await object.renderStepTab(view, config);
		}

		if (object.tabs.length > 0 && config.isView){
			await object.renderTab(view, config);
		}
		return view;
	}

	this.renderByView = async function(view, config, viewType, checkEdit) {
		if (config == undefined) config = {};
		let destination = await object.getRenderDestination(viewType);
		await object.initViewEvent(view, config, viewType, checkEdit);
		destination.html('');
		destination.append(view);
		return view;
	}

	this.renderView = async function(modelName, config, viewType = 'Form', checkEdit=undefined) {
		if (config == undefined) config = {};
		let destination = await object.getRenderDestination(viewType);
		let view = await object.getView(modelName, config, viewType);
		await object.initViewEvent(view, config, viewType, checkEdit);
		view.modelName = modelName;
		destination.html('');
		destination.append(view);

		if (object.steps.length > 0 && config.step) {
			await object.renderStepTab(view, config);
		}

		if (object.tabs.length > 0 && config.tab){
			await object.renderTab(view, config);
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
		if (config.tab != undefined) await object.appendTab(config.tab);
		return config;
	}

	this.appendTab = async function(tagName){
		object.tabs = [];
		object.tabMaps = {};
		if (main.viewTabMap[tagName]) {
			for (let tab of main.viewTabMap[tagName]) {
				object.tabMaps[tab.pageID] = tab;
				object.tabs.push(tab);
			}
		}
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

	this.appendPagesView = async function(stepName) {
		object.steps = [];
		object.stepMap = {};
		if (main.viewPageMap[stepName]) {
			for (let step of main.viewPageMap[stepName]) {
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

	this.callPageView = async function(){
	}

	this.nextStep = async function(group, currentStep, data){
		if(main.viewStepMap[group] == undefined) return;
		for(let i in main.viewStepMap[group]){
			let step = main.viewStepMap[group][i];
			if(step.pageID == currentStep){
				let nextStep = main.viewStepMap[group][parseInt(i)+1];
				if (nextStep == undefined) continue;
				let config = {
					isSetState: false,
					isView: false,
					selectedStep: nextStep.pageID,
					state: undefined,
					data : data
				};
				console.log(config);
				console.log(nextStep.page);
				await nextStep.page.prepare();
				await nextStep.callback(nextStep.page.model, config, 'Form');	
			}
		}
	}

	this.renderTab = async function(view, config = {}) {
		object.stepTabs = [];
		object.stepTabMap = {};
		if (view.dom.step == undefined) return;
		view.dom.step.html('');
		for(let step of object.tabs){
			let component = new InputDOMObject(TEMPLATE.AbstractTab, {name: step.title});
			if (step.pageID == config.selected) component.dom.tab.classList.add('highlightTab');
			if (step.render == config.selected) component.dom.tab.classList.add('highlightTab');
			view.dom.tabMenuList.append(component);
			component.dom.tab.onclick = async function() {
				if (step.source == undefined) return;
				if (config.data == undefined) return;
				let stepConfig = {}
				let result = await step.source.callback(config.data);
			}
		}
		view.dom.tab.show();
	}


	this.renderStepTab = async function(view, config = {}) {
		object.stepTabs = [];
		object.stepTabMap = {};
		if (view.dom.step == undefined) return;
		view.dom.step.html('');
		if (config.selectedStep != undefined) {
			main.selectedStep = config.selectedStep;
		}
		for(let step of object.steps){
			if (main.pageIDDict[step.pageID] == undefined) continue;
			step.page = main.pageIDDict[step.pageID];
			if (step.isSelected) selectedStep = step.state;
			let component = new InputDOMObject(TEMPLATE.AbstractStep, {name: step.title});
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
					stepConfig.nextStep = async function(data){
						object.nextStep(step.group, step.pageID, data)
					}
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
			let resultInput = await object.page.util.getMergedInputData(modelName);
			input = config.inputs;
			input.childInput = config.childInput != undefined ? config.childInput : resultInput.childInput;
			input.childInputParentMap = config.childInputParentMap != undefined ? config.childInputParentMap : resultInput.childInputParentMap;
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
			if (inputConfig.inputPerLine != undefined) {
				
			} else if (config.inputPerLine != undefined){
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
		} else if (viewType == 'ExportExcelDialog') {
			destination = object.page.home.dom.excel;
		} else {
			return;
		}
		return destination;
	}

	this.getViewData = function(view) {
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
					if (table.childDetail) recordResult.data[table.childDetail.parentColumn] = view.id;
					result.data[table.inputName].push(recordResult.data);
					for (let key of recordResult.file.keys()) {
						let value = recordResult.file.get(key);
						result.file.append(`${table.inputName}.${key}`, value);
					}
				}
			}
		}
		return result;
	}

	this.initViewEvent = async function(view, config, viewType, checkEdit) {
		if (config.isView == undefined) config.isView = false;
		if (view.isInitEvent != undefined) return;
		view.isInitEvent = true;
		let state = new ViewEventState(object, view, config, viewType);
		state.setViewEvent(checkEdit);
		if (config.isSetState == undefined){
			config.isSetState = true;
		}
		if (config.isSetState) {
			if (config.state == undefined) {
				object.page.changeFormState({state: viewType.toLowerCase(), title: config.title, data: config.data, isView: config.isView}, `${object.page.pageID}/${viewType.toLowerCase()}`);
			} else {
				object.page.changeFormState({state: config.state, title: config.title, data: config.data, isView: config.isView}, `${object.page.pageID}/${config.state}`);
			}
		}
	}
}