const AbstractPage = function(main, parent) {
	let object = this;

	object.main = main;
	object.pageID = object.__proto__.constructor.name;
	object.hasParent = false;
	object.home;
	object.extension;
	object.role = [];
	object.permission = [];
	object.permissions = [];

	object.table = new AbstractTable(this);
	object.form = new AbstractForm(this);
	object.searchForm = new AbstractSearchForm(this);
	object.dialog = new AbstractDialog(this);

	object.pageNumber = 1;
	object.limit = 10;

	if (parent != undefined) {
		object.hasParent = true;
		object.parent = parent;
		object.parentPageID = parent.pageID;
	}
	if (main != undefined) object.main.pageIDDict[object.pageID] = object;

	for (let i in AbstractPage.prototype) {
		object.__proto__[i] = AbstractPage.prototype[i];
	}

	this.loadPermissions = function(extension) {
		object.permissions = [];
		for (let i in object.role) {
			if (object.permission.length == 0) object.permission = [PermissionType.READ, PermissionType.WRITE, PermissionType.UPDATE, PermissionType.DROP]
			for (let j in object.permission) {
				if (extension != undefined) {
					object.permissions.push(`${extension}.${object.role[i]}.${PermissionTypeMap[object.permission[j]]}`)
				} else {
					object.permissions.push(`${object.role[i]}.${PermissionTypeMap[object.permission[j]]}`)
				}
				
			}
		}
	}

	this.setParent = function(parent) {
		object.hasParent = true;
		object.parent = parent;
		object.parentPageID = parent.pageID;
	}
	
	this.initMenuEvent = async function(menu) {
		menu.html.onclick = function() {
			console.log('Not Implement');
		}
	}

	this.register = async function() {
	}

	this.initJS = async function() {
	}

	this.prepare = async function() {
	}
	

	this.getMenu = async function(isSubMenu, label, icon) {
		let object = this;
		object.menu = await CREATE_MENU(object.pageID, label, icon, isSubMenu);
		return object.menu;
	}

	this.setPageState = async function() {
		object.changeState({'isInit': true}, object.pageID);
	}

	this.changeState = async function(data, url, page = undefined) {
		let object = this;
		if (page != undefined) object = page;
		await PUSH_STATE(object, data, url);
	}

	this.highlightMenu = async function(menu, isSubMenu, hasSubMenu) {
		if (!hasSubMenu) {
			for (let i in main.selectedSubMenu) {
				main.selectedSubMenu[i].classList.remove('highlightMenu');
			}
			main.selectedSubMenu = [];
		}
		if (!isSubMenu) {
			for (let i in main.selectedMenu) {
				main.selectedMenu[i].classList.remove('highlightMenu');
			}
			main.selectedMenu = [];
		}
		menu.classList.add('highlightMenu');
	}

	this.getMergedInput = async function(mergedInput) {
		let input = [];
		let referenceMap = {};
		let groupMap = {};
		for (let item of mergedInput) {
			if (item.isGroup) {
				let detail = JSON.parse(JSON.stringify(item));
				let {inputs, reference, group} = await object.parseInputData(item.input);
				for (let url in reference) {
					if (referenceMap[url] == undefined) referenceMap[url] = reference[url];
				}
				detail.input = inputs;
				input.push(detail);
				groupMap[item.id] = item;
			} else {
				let {inputs, reference, group} = await object.parseInputData([item]);
				for (let url in reference) {
					if (referenceMap[url] == undefined) referenceMap[url] = reference[url];
				}
				input.push(inputs[0]);
			}
		}
		return {inputs: input, reference: referenceMap, group: groupMap};
	}

	this.getMergedInputData = async function(modelName) {
		let result = {input: [], reference: [], groupDict: {}, groupInput: [], groupOrder: [], inputPerLine: 2};
		if (GLOBAL.INPUT == undefined) GLOBAL.INPUT = {};
		if (GLOBAL.MERGED_INPUT == undefined) GLOBAL.MERGED_INPUT = {};
		if (GLOBAL.INPUT_REFERENCE == undefined) GLOBAL.INPUT_REFERENCE = {};
		if (GLOBAL.INPUT_GROUP == undefined) GLOBAL.INPUT_GROUP = {};
		if (GLOBAL.INPUT_GROUP_DICT == undefined) GLOBAL.INPUT_GROUP_DICT = {};
		if (GLOBAL.INPUT_GROUP_ORDER == undefined) GLOBAL.INPUT_GROUP_ORDER = {};
		if (GLOBAL.INPUT_PER_LINE == undefined) GLOBAL.INPUT_PER_LINE = {};
		if (GLOBAL.MERGED_INPUT[modelName] == undefined) {
			let response = await GET(`input/${modelName}`, undefined, 'json', true);
			if (response != undefined && response.isSuccess) {
				console.log(response);
				GLOBAL.INPUT_GROUP_ORDER[modelName] = response.inputGroup ? response.inputGroup : [];
				let {inputs, reference, group} = await object.getMergedInput(response.mergedInput);
				let parsedInput = await object.parseInputData(response.input);
				GLOBAL.INPUT[modelName] = parsedInput.inputs;
				if (response.inputPerLine == null) GLOBAL.INPUT_PER_LINE[modelName] = 2
				else GLOBAL.INPUT_PER_LINE[modelName] = response.inputPerLine
				GLOBAL.MERGED_INPUT[modelName] = inputs;
				GLOBAL.INPUT_REFERENCE[modelName] = reference;
				GLOBAL.INPUT_GROUP_DICT[modelName] = group;
				let groupInputs = [];
				for (let i in GLOBAL.INPUT_GROUP_ORDER[modelName]) {
					let groupLabel = GLOBAL.INPUT_GROUP_ORDER[modelName][i];
					let groupInput = GLOBAL.INPUT_GROUP_DICT[modelName][groupLabel.id];
					groupInputs.push({'label': groupLabel.label, 'inputs': groupInput, 'isGroupInput': true})
				}
				GLOBAL.INPUT_GROUP[modelName] = groupInputs;
			} else { 
				console.error(`${modelName} is not exist.`);
				GLOBAL.INPUT_GROUP_ORDER[modelName] = [];
				GLOBAL.INPUT_PER_LINE[modelName] = 2;
				GLOBAL.INPUT[modelName] = [];
				GLOBAL.MERGED_INPUT[modelName] = [];
				GLOBAL.INPUT_REFERENCE[modelName] = [];
				GLOBAL.INPUT_GROUP_DICT[modelName] = {};
				let groupInputs = [];
				for (let i in GLOBAL.INPUT_GROUP_ORDER[modelName]) {
					let groupLabel = GLOBAL.INPUT_GROUP_ORDER[modelName][i];
					let groupInput = GLOBAL.INPUT_GROUP_DICT[modelName][groupLabel.id];
					groupInputs.push({'label': groupLabel.label, 'inputs': groupInput, 'isGroupInput': true})
				}
				GLOBAL.INPUT_GROUP[modelName] = groupInputs;
				return result;
			}
		}
		result.input = JSON.parse(JSON.stringify(GLOBAL.MERGED_INPUT[modelName]));
		result.reference = JSON.parse(JSON.stringify(GLOBAL.INPUT_REFERENCE[modelName]));
		result.groupDict = JSON.parse(JSON.stringify(GLOBAL.INPUT_GROUP_DICT[modelName]));
		result.groupInput = JSON.parse(JSON.stringify(GLOBAL.INPUT_GROUP[modelName]));
		result.groupOrder = JSON.parse(JSON.stringify(GLOBAL.INPUT_GROUP_ORDER[modelName]));
		result.inputPerLine = GLOBAL.INPUT_PER_LINE[modelName];
		return result;
	}

	this.getRawInputData = async function(modelName) {
		let result = {input: [], reference: [], groupDict: {}, groupInput: [], groupOrder: [], inputPerLine: 2};
		if (GLOBAL.INPUT == undefined) GLOBAL.INPUT = {};
		if (GLOBAL.INPUT_REFERENCE == undefined) GLOBAL.INPUT_REFERENCE = {};
		if (GLOBAL.INPUT_GROUP == undefined) GLOBAL.INPUT_GROUP = {};
		if (GLOBAL.INPUT_GROUP_DICT == undefined) GLOBAL.INPUT_GROUP_DICT = {};
		if (GLOBAL.INPUT_GROUP_ORDER == undefined) GLOBAL.INPUT_GROUP_ORDER = {};
		if (GLOBAL.INPUT_PER_LINE == undefined) GLOBAL.INPUT_PER_LINE = {};
		if (GLOBAL.INPUT[modelName] == undefined) {
			let response = await GET(`input/${modelName}`, undefined, 'json', true);
			if (response != undefined && response.isSuccess) {
				GLOBAL.INPUT_GROUP_ORDER[modelName] = response.inputGroup ? response.inputGroup : [];
				let {inputs, reference, group} = await object.parseInputData(response.input);
				if (response.inputPerLine == null) GLOBAL.INPUT_PER_LINE[modelName] = 2
				else GLOBAL.INPUT_PER_LINE[modelName] = response.inputPerLine
				GLOBAL.INPUT[modelName] = inputs;
				GLOBAL.INPUT_REFERENCE[modelName] = reference;
				GLOBAL.INPUT_GROUP_DICT[modelName] = group;
				let groupInputs = [];
				for (let i in GLOBAL.INPUT_GROUP_ORDER[modelName]) {
					let groupLabel = GLOBAL.INPUT_GROUP_ORDER[modelName][i];
					let groupInput = GLOBAL.INPUT_GROUP_DICT[modelName][groupLabel.id];
					groupInputs.push({'label': groupLabel.label, 'inputs': groupInput, 'isGroupInput': true})
				}
				GLOBAL.INPUT_GROUP[modelName] = groupInputs;
			} else { 
				console.error(`${modelName} is not exist.`);
				GLOBAL.INPUT_GROUP_ORDER[modelName] = [];
				GLOBAL.INPUT_PER_LINE[modelName] = 2;
				GLOBAL.INPUT[modelName] = [];
				GLOBAL.INPUT_REFERENCE[modelName] = [];
				GLOBAL.INPUT_GROUP_DICT[modelName] = {};
				let groupInputs = [];
				for (let i in GLOBAL.INPUT_GROUP_ORDER[modelName]) {
					let groupLabel = GLOBAL.INPUT_GROUP_ORDER[modelName][i];
					let groupInput = GLOBAL.INPUT_GROUP_DICT[modelName][groupLabel.id];
					groupInputs.push({'label': groupLabel.label, 'inputs': groupInput, 'isGroupInput': true})
				}
				GLOBAL.INPUT_GROUP[modelName] = groupInputs;
				return result;
			}
		}
		result.input = JSON.parse(JSON.stringify(GLOBAL.INPUT[modelName]));
		result.reference = JSON.parse(JSON.stringify(GLOBAL.INPUT_REFERENCE[modelName]));
		result.groupDict = JSON.parse(JSON.stringify(GLOBAL.INPUT_GROUP_DICT[modelName]));
		result.groupInput = JSON.parse(JSON.stringify(GLOBAL.INPUT_GROUP[modelName]));
		result.groupOrder = JSON.parse(JSON.stringify(GLOBAL.INPUT_GROUP_ORDER[modelName]));
		result.inputPerLine = GLOBAL.INPUT_PER_LINE[modelName];
		return result;
	}

	this.getInputData = async function(modelName) {
		let result = await object.getRawInputData(modelName);
		return result.input;
	}
	
	this.getReferenceInputData = async function(modelName) {
		let result = await object.getRawInputData(modelName);
		return result.reference;
	}

	this.createGroupInput = async function(groupList, inputList) {
		let {inputs, reference, group} = await object.getRawInputConfig(inputList);
		let groupInputs = [];
		for (let i in groupList) {
			let groupLabel = groupList[i];
			let groupInput = group[groupLabel.id];
			groupInputs.push({'label': groupLabel.label, 'inputs': groupInput, 'isGroupInput': true})
		}
		return groupInputs;
	}

	this.mergeInputFromModelName = async function(modelName, additionalInput, isForm) {
		if (isForm == undefined) isForm = true;
		if (isForm) {
			let result = await object.getMergedInputData(modelName);
			for (let input of additionalInput) {
				if (input.group != undefined) {
					for (let item of result.input) {
						if (!item.isGroup) continue;
						if (item.id != input.group) continue;
						if (item.input == undefined) item.input = [];
						item.input.push(input);
						item.input = object.sortInput(item.input);
						break;
					}
				} else result.input.push(input)
			}
			result.input = object.sortInput(result.input);
			return result.input;
		} else {
			let result = await object.getRawInputData(modelName);
			let {inputs, reference, group} = await object.parseInputData(additionalInput);
			if (result.groupOrder.length == 0) return await object.mergeInput(result.input, inputs);
			let groupInputs = [];
			for (let i in result.groupOrder) {
				let groupLabel = result.groupOrder[i];
				let groupInput = result.groupDict[groupLabel.id];
				if (result.groupDict[groupLabel.id] == undefined) {
					result.groupDict[groupLabel.id] = [];
					groupInput = result.groupDict[groupLabel.id];
				}
				if (group[groupLabel.id] != undefined) {
					groupInput.push(...group[groupLabel.id]);
					groupInput.sort(function(a, b){return a.order-b.order});
				}
				groupInputs.push({'label': groupLabel.label, 'inputs': groupInput, 'isGroupInput': true});
				
			}
			return groupInputs;
		}
	}

	this.sortInput = function(input) {
		for(let i in input){
			input[i].order = parseFloat(input[i].order);
		}
		input.sort(function(a, b){return a.order-b.order});
		return input;
	}
	
	this.mergeInput = async function(defaultInput, additionalInput){
		let input = defaultInput.concat(additionalInput);
		for(let i in input){
			input[i].order = parseFloat(input[i].order);
		}
		input.sort(function(a, b){return a.order-b.order});
		return input;
	}
	
	this.parseInputData = async function(inputs) {
		let reference = {};
		let group = {};
		for (let i in inputs) {
			let defaultData = await object.getDefaultInputData();
			inputs[i] = Object.assign(defaultData, inputs[i]);
			if (inputs[i].typeName == "Text") inputs[i].isText = true;
			else if (inputs[i].typeName == "Password") inputs[i].isPassword = true;
			else if (inputs[i].typeName == "Email") inputs[i].isEmail = true;
			else if (inputs[i].typeName == "EnumSelect") inputs[i].isEnumSelect = true;
			else if (inputs[i].typeName == "Select"){
				let currentOptions = JSON.parse(JSON.stringify(inputs[i].option));
				inputs[i].option = [];
				for(let j in currentOptions){
					if(currentOptions[j].label != undefined){
						inputs[i].option = currentOptions;
						break;
					}
					inputs[i].option.push({
						label: currentOptions[j][1],
						value: currentOptions[j][0]
					});
				}
				inputs[i].isSelect = true;
			}else if (inputs[i].typeName == "ReferenceSelect") {
				inputs[i].isReferenceSelect = true;
				if (reference[inputs[i].url] == undefined) reference[inputs[i].url] = [];
				reference[inputs[i].url].push(inputs[i].columnName)
			} else if (inputs[i].typeName == "PrerequisiteReferenceSelect") {
				inputs[i].isPrerequisiteReferenceSelect = true;
				if (reference[inputs[i].url] == undefined) reference[inputs[i].url] = [];
				reference[inputs[i].url].push(inputs[i].columnName)
			} 
			else if (inputs[i].typeName == "DateTime") inputs[i].isDateTime = true;
			else if (inputs[i].typeName == "Time") inputs[i].isTime = true;
			else if (inputs[i].typeName == "Date") inputs[i].isDate = true;
			else if (inputs[i].typeName == "Month") inputs[i].isMonth = true;
			else if (inputs[i].typeName == "TextArea") inputs[i].isTextArea = true;
			else if (inputs[i].typeName == "EnumCheckBox") inputs[i].isEnumCheckBox = true;
			else if (inputs[i].typeName == "CheckBox"){
				let currentOptions = JSON.parse(JSON.stringify(inputs[i].option));
				inputs[i].option = [];
				for(let j in currentOptions){
					if(currentOptions[j].label != undefined){
						inputs[i].option = currentOptions;
						break;
					}
					inputs[i].option.push({
						label: currentOptions[j][1],
						value: currentOptions[j][0]
					});
				}
				inputs[i].isCheckBox = true;
			}
			else if (inputs[i].typeName == "Enable") inputs[i].isEnable = true;
			else if (inputs[i].typeName == "Number") inputs[i].isNumber = true;
			else if (inputs[i].typeName == "Label") inputs[i].isLabel = true;
			else if (inputs[i].typeName == "File") inputs[i].isFile = true;
			else if (inputs[i].typeName == "FileMatrix") inputs[i].isFileMatrix = true;
			else if (inputs[i].typeName == "TimeSpan") inputs[i].isTimeSpan = true;
			else if (inputs[i].typeName == "AutoComplete") inputs[i].isAutoComplete = true;
			else if (inputs[i].typeName == "Color") inputs[i].isColor = true;
			else if (inputs[i].typeName == "Hidden") inputs[i].isHidden = true;
			else if (inputs[i].typeName == "RichText") inputs[i].isRichText = true;
			else if (inputs[i].typeName == "Image") inputs[i].isImage = true;
			else if (inputs[i].typeName == "Fraction") inputs[i].isFraction = true;
			if (inputs[i].group == undefined) continue;
			if (group[inputs[i].group] == undefined) group[inputs[i].group] = [];
			group[inputs[i].group].push(inputs[i]);
		}
		return {inputs: inputs, reference: reference, group: group};
	}
	
	this.getDefaultInputData = async function() {
		return {
			isText: false, 
			isPassword: false, 
			isEmail: false, 
			isEnumSelect: false, 
			isReferenceSelect: false, 
			isPrerequisiteReferenceSelect: false,
			isDateTime: false,
			isTime: false,
			isDate: false,
			isTextArea: false,
			isEnumCheckBox: false,
			isCheckBox: false,
			isEnable: false,
			isNumber: false,
			isLabel: false,
			isFile: false,
			isFileMatrix: false,
			isMonth: false,
			isTimeSpan: false,
			isRequired: false,
			isNegative: false,
			isZeroIncluded: false,
			isFloatingPoint: false,
			isAutoComplete: false,
			isHidden: false,
			isRichText: false,
			isImage: false,
			isFraction: false,
			isEditable: true,
			hasCrop: false,
			maxValue: NaN,
			SVG: false,
			size: 'normal',
			config: {},
		}
	}

	this.getUseInput = async function(modelName, includeList, excludeList) {
		let includeDict = {};
		let excludeDict = {};
		if (includeList == undefined || includeList.length == 0) includeDict = {};
		else includeDict = includeList.reduce((a, v) => ({ ...a, [v]: v}), {}) 
		if (excludeList == undefined  || excludeList.length == 0) excludeDict = {};
		else excludeDict = excludeList.reduce((a, v) => ({ ...a, [v]: v}), {}) 
		let results = []
		let inputs = JSON.parse(JSON.stringify(await object.getCompleteInputData.call(object, modelName)));
		if (Object.keys(includeDict).length == 0) {
			includeDict = inputs.reduce((a, v) => ({ ...a, [v.columnName]: v}), {}) 
		}
		for (let i in inputs) {
			if (excludeDict[inputs[i].columnName] == undefined && includeDict[inputs[i].columnName] != undefined) {
				results.push(inputs[i]);
			}
		}
		return results;
	}

	this.appendButton = async function(config){
		let button = await object.getButton(config);
		object.home.dom.button.append(button);
		return button;
	}
	
	this.appendTabButton = async function(modelName, config){
		if(config == undefined) config = {};
		let buttons = [];
		if(config.hasFilter) buttons.push({'cssClass': 'filter_button', 'ID': 'filter', 'icon': 'Filter'});
		let tabButton = await object.renderTabButton(buttons);
		if(config.hasFilter){
			tabButton.filter.onclick = async function(){
				await object.renderSearchForm(modelName, {data : object.filter});
			}
		}
		return tabButton;
	}
	
	this.getButton = async function(config){
		let button = new DOMObject(TEMPLATE.Button, config);
		return button;
	}

	this.getCompleteInputData = async function(modelName, config = {}) {
		let input =[]
		if (config.inputs != undefined) input = await object.getInputConfig(config.inputs);
		else input = await object.getInputData(modelName);
		let reference = await object.getReferenceInputData(modelName);
		let inputs = {};
		let exceptURL = {};
		for (let i in input) {
			inputs[input[i].columnName] = input[i];
			if (input[i].isPrerequisiteReferenceSelect) exceptURL[input[i].url] = input[i];
		}
		for (let url in reference) {
			if (url[url.length-1] == '/') continue;
			if (exceptURL[url] != undefined) continue;
			let response = await GET(url, undefined, 'json', true);
			for (let i in reference[url]) {
				if (inputs[reference[url][i]] == undefined) continue;
				inputs[reference[url][i]].option = [];
				inputs[reference[url][i]].optionMap = {};
				if (response != undefined && response.isSuccess) {
					if (response.results) inputs[reference[url][i]].option = response.results;
					else if (response.result) inputs[reference[url][i]].option = response.result;
					inputs[reference[url][i]].optionMap = {};
					for (let j in inputs[reference[url][i]].option) {
						let option = inputs[reference[url][i]].option[j];
						inputs[reference[url][i]].optionMap[option.value] = option.label;
					}
				}
			}
		}
		return input;
	}
	
	this.getRawInputConfig = async function(inputs){
		for(let i in inputs){
			if(inputs[i].columnName == undefined) inputs[i].columnName = 'None';
			if(inputs[i].columnType == undefined) inputs[i].columnType = 'None';
			if(inputs[i].label == undefined) inputs[i].label = 'None';
			if(inputs[i].order == undefined) inputs[i].order = '0.0';
			if(inputs[i].typeName == undefined) inputs[i].typeName = 'Text';
			if(inputs[i].isTable == undefined) inputs[i].isTable = false;
			if(inputs[i].isRequired == undefined) inputs[i].isRequired = false;
			if(inputs[i].isSearch == undefined) inputs[i].isSearch = false;
			if(inputs[i].size == undefined) inputs[i].size = 'normal';
			if(inputs[i].isNumber == undefined) inputs[i].isNumber = false;
			if(inputs[i].typeName == 'Currency' || inputs[i].typeName == 'Fraction' || inputs[i].typeName == 'Number') inputs[i].isNumber = true;
			if(inputs[i].url != undefined && inputs[i].typeName != 'AutoComplete' && inputs[i].typeName != 'PrerequisiteReferenceSelect' && inputs[i].typeName != 'Image'){
				let response = await GET(inputs[i].url, undefined, 'json', true);
				if (response != undefined && response.isSuccess) {
					inputs[[i]].option = response.results;
					if (response.result != undefined) inputs[[i]].option = response.result;
				} 
			}
		}
		return await object.parseInputData(inputs);
	}

	this.getInputConfig = async function(inputs){
		return (await object.getRawInputConfig(inputs)).inputs;
	}
	
	this.getDefaultInputConfig = async function(){
		let input = {};
		input.columnName = 'None';
		input.columnType = 'None';
		input.label = 'None';
		input.order = '0';
		input.typeName = 'Text';
		input.isTable = false;
		input.isRequired = false;
		input.isSearch = false;
		input.isNumber = false;
		input.size = 'normal';
		return input;
	}

	this.setPrerequisiteInput = async function(modelName, referenceURL, record, data) {
		let prerequisiteInputMap = {};
		for (let url in referenceURL) {
			for (let index in referenceURL[url]) {
				let input = referenceURL[url][index];
				if (input.prerequisite.length == 0) continue;
				let [prerequisiteModelName, column] = input.prerequisite.split('.');
				if (modelName != prerequisiteModelName) continue;
				if (record.dom[column] == undefined) continue;
				let value = undefined;
				if (data != undefined) value = data[input.columnName];
				if (prerequisiteInputMap[column] == undefined) {
					prerequisiteInputMap[column] = {prerequisite: record.dom[column], inputs: [], value: value}
				}
				prerequisiteInputMap[column].inputs.push({input: record.dom[input.columnName], detail: input})
			}
		}
		for (let column in prerequisiteInputMap) {
			let prerequisite = prerequisiteInputMap[column];
			object.setPrerequisiteEvent(prerequisite.prerequisite, prerequisite.inputs, prerequisite.detail, prerequisite.value);
		}
	}
	
	this.setPrerequisiteEvent = async function(prerequisite, inputs, detail, value) {
		prerequisite.prerequisite = true;
		prerequisite.fetched = {};
		prerequisite.childInput = {};
		for (let i in inputs) {
			prerequisite.childInput[inputs[i].detail.columnName] = inputs[i];
		}
		prerequisite.onchange = async function() {
			if (this.value == undefined) return;
			if (this.value == '') return;
			for (let index in inputs) {
				let item = inputs[index];
				let input = item.input;
				let detail = item.detail;
				let results;
				if (prerequisite.fetched[this.value] == undefined) {
					let response = await GET(detail.url+this.value, undefined, 'json', true);
					if (response == undefined || !response.isSuccess) continue;
					results = response.results;
					if (response.result != undefined) results = response.result;
					prerequisite.fetched[this.value] = results;
				} else {
					results = prerequisite.fetched[this.value];
				}
				input.html('');
				let option = document.createElement("OPTION");
				option.value = -1;
				option.text = "None";
				input.appendChild(option);
				for (let i in results) {
					let option = document.createElement("OPTION");
					option.value = results[i].value;
					option.text = results[i].label;
					input.appendChild(option);
				}
				if (value != undefined) {
					input.value = value;
					if (input.onchange != undefined) input.onchange();
				}
				if (this.value == -1) {
					input.selectedIndex = 0;
					if (input.onchange != undefined) input.onchange();
				}
			}
		}
	}

	this.getTabMenu = async function(menus){
		let menuDict = {};
		for(let i in menus){
			let menu = new DOMObject(TEMPLATE.TabMenu, menus[i]);
			menuDict[menus[i].value] = menu;
		}
		return menuDict;
	}
	
	this.renderTabMenu = async function(menus, tabMenu){
		if(tabMenu == undefined) tabMenu = await object.getTabMenu(menus);
		object.home.dom.menuList.html('');
		for(let i in tabMenu){
			object.home.dom.menuList.append(tabMenu[i]);
			object.home.dom.menuList[i] = tabMenu[i].dom[i];
		}
		object.home.dom.menu.classList.remove('hidden');
		return object.home.dom.menuList;
	}
	
	this.getTabButton = async function(buttons){
		let buttonDict = {};
		object.home.dom.buttonList.html('');
		for(let i in buttons){
			buttons[i].svg = (await CREATE_SVG_ICON(buttons[i].icon)).icon;
			let button = new DOMObject(TEMPLATE.TabButton, buttons[i]);
			buttonDict[buttons[i].ID] = button;
		}
		return buttonDict;
	}
	
	this.renderTabButton = async function(buttons, tabButton){
		if(tabButton == undefined) tabButton = await object.getTabButton(buttons);
		for(let i in tabButton){
			object.home.dom.buttonList.append(tabButton[i]);
			object.home.dom.buttonList[i] = tabButton[i].dom[i];
		}
		object.home.dom.menu.classList.remove('hidden');
		return object.home.dom.buttonList;
	}
	
	this.getTagCard = async function(data){
		data.label = `${data.name} (${data.supplierID.name})`;
		data.SVG = await CREATE_SVG_ICON('Close');
		let tagCard = new DOMObject(await TEMPLATE.TagCard, data);
		return tagCard;
	}

	this.setHighlightTab = async function(classList, tag){
		for(let i in classList){
			if(typeof(classList[i]) == 'object'){
				classList[i].classList.remove('highlightTab');
			}
		}
		tag.classList.add('highlightTab');
	}

	this.getPageNumber = async function() {
		return object.pageNumber;
	}

	this.setPageNumber = async function(pageNumber) {
		object.pageNumber = pageNumber;
	}
}