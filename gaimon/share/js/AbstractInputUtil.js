const AbstractInputUtil = function() {}
AbstractInputUtil.prototype.getMergedInput = async function(mergedInput) {
	let object = this;
	let input = [];
	let referenceMap = {};
	let groupMap = {};
	for (let item of mergedInput) {
		if (item.isGroup) {
			let detail = JSON.parse(JSON.stringify(item));
			if (item.input == undefined) item.input = [];
			item.group = item.id;
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

AbstractInputUtil.prototype.getBaseInputData = async function(modelName, isRaw = true) {
	let object = this;
	let result = {input: [], reference: [], groupDict: {}, groupInput: [], groupOrder: [], inputPerLine: 2};
	if (GLOBAL.INPUT_RESPONSE == undefined) GLOBAL.INPUT_RESPONSE = {};
	if (GLOBAL.INPUT == undefined) GLOBAL.INPUT = {};
	if (GLOBAL.MERGED_INPUT == undefined) GLOBAL.MERGED_INPUT = {};
	if (GLOBAL.AVATAR == undefined) GLOBAL.AVATAR = {};
	if (GLOBAL.INPUT_REFERENCE == undefined) GLOBAL.INPUT_REFERENCE = {};
	if (GLOBAL.INPUT_CHILDREN == undefined) GLOBAL.INPUT_CHILDREN = {};
	if (GLOBAL.INPUT_CHILDREN_MAP == undefined) GLOBAL.INPUT_CHILDREN_MAP = {};
	if (GLOBAL.INPUT_GROUP == undefined) GLOBAL.INPUT_GROUP = {};
	if (GLOBAL.INPUT_GROUP_DICT == undefined) GLOBAL.INPUT_GROUP_DICT = {};
	if (GLOBAL.INPUT_GROUP_ORDER == undefined) GLOBAL.INPUT_GROUP_ORDER = {};
	if (GLOBAL.INPUT_PER_LINE == undefined) GLOBAL.INPUT_PER_LINE = {};
	if (GLOBAL.INPUT[modelName] == undefined) {
		let response;
		if (modelName.length != 0) response = await GET(`input/${modelName}`, undefined, 'json', true);
		if (response != undefined && response.isSuccess) {
			for (let input of response.input) {
				for (let groupInput of response.inputGroup) {
					groupInput.isGroup = true;
					groupInput.group = groupInput.id;
					if (groupInput.input == undefined) groupInput.input = [];
					if (groupInput.id != input.group) continue;
					groupInput.input.push(input);
				}
			}
			for (let groupInput of response.inputGroup) {
				response.input.push(groupInput);
			}
			for (let mergedInput of response.mergedInput) {
				mergedInput.group = mergedInput.id;
			}
			if (GLOBAL.INPUT_CHILDREN[modelName] == undefined) GLOBAL.INPUT_CHILDREN[modelName] = [];
			if (GLOBAL.INPUT_CHILDREN_MAP[modelName] == undefined) GLOBAL.INPUT_CHILDREN_MAP[modelName] = {};
			let childInputs = [];
			for (let child of response.children) {
				if (!child.isTableForm) continue;
				GLOBAL.INPUT_CHILDREN_MAP[modelName][child.modelName] = child.name;
				childInputs.push(await object.getBaseInputData(child.modelName));
			}
			GLOBAL.INPUT_CHILDREN[modelName] = childInputs;
			GLOBAL.INPUT_GROUP_ORDER[modelName] = response.inputGroup ? response.inputGroup : [];
			GLOBAL.INPUT_RESPONSE[modelName] = response;
			let reference, group;
			let parsedInput = await object.parseInputData(response.input);
			GLOBAL.INPUT[modelName] = parsedInput.inputs;
			let parsedMergedInput = await object.getMergedInput(response.mergedInput);
			GLOBAL.MERGED_INPUT[modelName] = parsedMergedInput.inputs;

			reference = parsedInput.reference;
			group = parsedInput.group
			
			if (response.inputPerLine == null) GLOBAL.INPUT_PER_LINE[modelName] = 2
			else GLOBAL.INPUT_PER_LINE[modelName] = response.inputPerLine
			GLOBAL.INPUT_REFERENCE[modelName] = reference;
			GLOBAL.INPUT_GROUP_DICT[modelName] = group;
			GLOBAL.AVATAR[modelName] = response.avatar;
			let groupInputs = [];
			for (let i in GLOBAL.INPUT_GROUP_ORDER[modelName]) {
				let groupLabel = GLOBAL.INPUT_GROUP_ORDER[modelName][i];
				let groupInput = GLOBAL.INPUT_GROUP_DICT[modelName][groupLabel.id];
				groupInputs.push({'label': groupLabel.label, 'inputs': groupInput, 'isGroupInput': true})
			}
			GLOBAL.INPUT_GROUP[modelName] = groupInputs;
		} else { 
			if (modelName.length != 0) console.error(`${modelName} is not exist.`);
			GLOBAL.INPUT_GROUP_ORDER[modelName] = [];
			GLOBAL.INPUT_PER_LINE[modelName] = 2;
			GLOBAL.INPUT[modelName] = [];
			GLOBAL.INPUT_REFERENCE[modelName] = [];
			GLOBAL.INPUT_CHILDREN[modelName] = []
			GLOBAL.INPUT_CHILDREN_MAP[modelName] = {};
			GLOBAL.INPUT_GROUP_DICT[modelName] = {};
			GLOBAL.AVATAR[modelName] = '/share/icon/image.jpg';
			let groupInputs = [];
			for (let i in GLOBAL.INPUT_GROUP_ORDER[modelName]) {
				let groupLabel = GLOBAL.INPUT_GROUP_ORDER[modelName][i];
				let groupInput = GLOBAL.INPUT_GROUP_DICT[modelName][groupLabel.id];
				groupInputs.push({'label': groupLabel.label, 'inputs': groupInput, 'isGroupInput': true})
			}
			GLOBAL.INPUT_GROUP[modelName] = groupInputs;
			return result;
		}
	} else {
		let response = GLOBAL.INPUT_RESPONSE[modelName];
		if (response == undefined) return result;
		let {inputs, reference, group} = await object.parseInputData(response.input);
		let parsedMergedInput = await object.getMergedInput(response.mergedInput);
		GLOBAL.MERGED_INPUT[modelName] = parsedMergedInput.inputs;
		GLOBAL.INPUT[modelName] = inputs;
		GLOBAL.INPUT_REFERENCE[modelName] = reference;
		GLOBAL.INPUT_GROUP_DICT[modelName] = group;
		GLOBAL.AVATAR[modelName] = response.avatar;
		let childInputs = [];
		for (let child of response.children) {
			if (!child.isTableForm) continue;
			GLOBAL.INPUT_CHILDREN_MAP[modelName][child.modelName] = child.name;
			childInputs.push(await object.getBaseInputData(child.modelName));
		}
		GLOBAL.INPUT_CHILDREN[modelName] = childInputs;
	}
	result.input = isRaw ? JSON.parse(JSON.stringify(GLOBAL.INPUT[modelName])) : JSON.parse(JSON.stringify(GLOBAL.MERGED_INPUT[modelName]));
	result.reference = JSON.parse(JSON.stringify(GLOBAL.INPUT_REFERENCE[modelName]));
	result.groupDict = JSON.parse(JSON.stringify(GLOBAL.INPUT_GROUP_DICT[modelName]));
	result.groupInput = JSON.parse(JSON.stringify(GLOBAL.INPUT_GROUP[modelName]));
	result.groupOrder = JSON.parse(JSON.stringify(GLOBAL.INPUT_GROUP_ORDER[modelName]));
	result.inputPerLine = GLOBAL.INPUT_PER_LINE[modelName];
	result.childInput = GLOBAL.INPUT_CHILDREN[modelName];
	result.childInputParentMap = GLOBAL.INPUT_CHILDREN_MAP[modelName];
	result.modelName = modelName;
	result.avatar = GLOBAL.AVATAR[modelName];
	return result;
}

AbstractInputUtil.prototype.getMergedInputData = async function(modelName) {
	let object = this;
	return await object.getBaseInputData(modelName, false);
}

AbstractInputUtil.prototype.getRawInputData = async function(modelName) {
	let object = this;
	return await object.getBaseInputData(modelName, true);
}

AbstractInputUtil.prototype.getInputData = async function(modelName) {
	let object = this;
	let result = await object.getRawInputData(modelName);
	return result.input;
}
	
AbstractInputUtil.prototype.getReferenceInputData = async function(modelName) {
	let object = this;
	let result = await object.getRawInputData(modelName);
	return result.reference;
}

AbstractInputUtil.prototype.getAvatar = async function(modelName) {
	let object = this;
	let result = await object.getRawInputData(modelName);
	return result.avatar;
}

AbstractInputUtil.prototype.createGroupInput = async function(groupList, inputList) {
	let object = this;
	let {inputs, reference, group} = await object.getRawInputConfig(inputList);
	let groupInputs = [];
	for (let i in groupList) {
		let groupLabel = groupList[i];
		let groupInput = group[groupLabel.id];
		groupInputs.push({'label': groupLabel.label, 'inputs': groupInput, 'isGroupInput': true})
	}
	return groupInputs;
}

AbstractInputUtil.prototype.mergeInputFromModelName = async function(modelName, additionalInput, isForm) {
	let object = this;
	if (isForm == undefined) isForm = true;
	if (isForm) {
		let result = await object.getMergedInputData(modelName);
		for (let input of additionalInput) {
			if (input.typeName == "Select"){
				let currentOptions = JSON.parse(JSON.stringify(input.option));
				input.option = [];
				for(let j in currentOptions){
					if(currentOptions[j].label != undefined){
						input.option = currentOptions;
						break;
					}
					input.option.push({
						label: currentOptions[j][1],
						value: currentOptions[j][0]
					});
				}
			}
			if (input.group != undefined) {
				for (let item of result.input) {
					if (!item.isGroup) continue;
					if (item.group != input.group) continue;
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

AbstractInputUtil.prototype.sortInput = function(input) {
	let object = this;
	for(let i in input){
		input[i].order = parseFloat(input[i].order);
	}
	input.sort(function(a, b){return a.order-b.order});
	return input;
}
	
AbstractInputUtil.prototype.mergeInput = async function(defaultInput, additionalInput){
	let object = this;
	let input = defaultInput.concat(additionalInput);
	for(let i in input){
		input[i].order = parseFloat(input[i].order);
	}
	input.sort(function(a, b){return a.order-b.order});
	return input;
}
	
AbstractInputUtil.prototype.parseInputData = async function(inputs, reference = {}, group = {}) {
	let object = this;
	for (let input of inputs) {
		if (input.isGroup) {
			await object.parseInputData(input.input, reference, group);
			continue;
		}
		let defaultData = await object.getDefaultInputData();
		input = Object.assign(defaultData, input);
		if (input.typeName == "Select"){
			let currentOptions = JSON.parse(JSON.stringify(input.option));
			input.option = [];
			for(let j in currentOptions){
				if(currentOptions[j].label != undefined){
					input.option = currentOptions;
					break;
				}
				input.option.push({
					label: currentOptions[j][1],
					value: currentOptions[j][0]
				});
			}
		} else if (input.typeName == "ReferenceSelect") {
			if (reference[input.url] == undefined) reference[input.url] = [];
			reference[input.url].push(input.columnName);
		} else if (input.typeName == "PrerequisiteReferenceSelect") {
			input.isPrerequisiteReferenceSelect = true;
			if (reference[input.url] == undefined) reference[input.url] = [];
			reference[input.url].push(input.columnName)
		} else if (input.typeName == "CheckBox"){
			let currentOptions = JSON.parse(JSON.stringify(input.option));
			input.option = [];
			for(let j in currentOptions){
				if(currentOptions[j].label != undefined){
					input.option = currentOptions;
					break;
				}
				input.option.push({
					label: currentOptions[j][1],
					value: currentOptions[j][0]
				});
			}
		} else if (input.typeName == "AutoComplete"){
			input.isAutoComplete = true;
		} else if (input.typeName == "Image"){
			input.isImage = true;
		} else if (input.typeName == "FileMatrix"){
			input.isFileMatrix = true;
		} else if (input.isAdvanceForm) {
			input.isHidden = true;
		}
		if (input.group == undefined) continue;
		if (group[input.group] == undefined) group[input.group] = [];
		group[input.group].push(input);
	}
	return {inputs: inputs, reference: reference, group: group};
}
	
AbstractInputUtil.prototype.getDefaultInputData = async function() {
	return {
		isPrerequisiteReferenceSelect: false,
		isAutoComplete: false,
		isFileMatrix: false,
		isImage: false,
		isEditable: true,
		hasCrop: false,
		maxValue: NaN,
		SVG: false,
		size: 'normal',
		config: {},
	}
}

AbstractInputUtil.prototype.getUseInput = async function(modelName, includeList, excludeList) {
	let object = this;
	let includeDict = {};
	let excludeDict = {};
	if (includeList == undefined || includeList.length == 0) includeDict = {};
	else includeDict = includeList.reduce((a, v) => ({ ...a, [v]: v}), {}) 
	if (excludeList == undefined  || excludeList.length == 0) excludeDict = {};
	else excludeDict = excludeList.reduce((a, v) => ({ ...a, [v]: v}), {}) 
	let results = []
	let inputs = JSON.parse(JSON.stringify(await object.getCompleteInputData(modelName)));
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

AbstractInputUtil.prototype.getCompleteInputData = async function(modelName, config = {}) {
	let object = this;
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

AbstractInputUtil.prototype.getTableInputData = async function(modelName, config = {}) {
	let object = this;
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
	let result = {}
	for (let url in reference) {
		if (url[url.length-1] == '/') continue;
		if (exceptURL[url] != undefined) continue;
		// if (inputs[reference[url]].tableURL) continue;
		// let response = await GET(url, undefined, 'json', true);
		for (let i in reference[url]) {
			if (inputs[reference[url][i]].tableURL) continue;
			if (result[url] == undefined) result[url] = await GET(url, undefined, 'json', true);
			let response = result[url];
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
	
AbstractInputUtil.prototype.getRawInputConfig = async function(inputs){
	let object = this;
	for(let i in inputs){
		if(inputs[i].columnName == undefined) inputs[i].columnName = 'None';
		if(inputs[i].columnType == undefined) inputs[i].columnType = 'None';
		if(inputs[i].label == undefined) inputs[i].label = 'None';
		if(inputs[i].order == undefined) inputs[i].order = '0.0';
		if(inputs[i].typeName == undefined) inputs[i].typeName = 'Text';
		if(inputs[i].isTable == undefined) inputs[i].isTable = false;
		if(inputs[i].isRequired == undefined) inputs[i].isRequired = false;
		if(inputs[i].isSearch == undefined) inputs[i].isSearch = false;
		if(inputs[i].isForm == undefined) inputs[i].isForm = true;
		if(inputs[i].isEditable == undefined) inputs[i].isEditable = true;
		if(inputs[i].size == undefined) inputs[i].size = 'normal';
		if(inputs[i].isNumber == undefined) inputs[i].isNumber = false;
			if(inputs[i].typeName == 'Currency' || inputs[i].typeName == 'Fraction' || inputs[i].typeName == 'Number') inputs[i].isNumber = true;
		if(inputs[i].url != undefined && inputs[i].typeName != 'AutoComplete' && inputs[i].typeName != 'PrerequisiteReferenceSelect'){
			let response = await GET(inputs[i].url, undefined, 'json', true);
			if (response != undefined && response.isSuccess) {
				if (response.result != undefined) inputs[[i]].option = response.result;
				else inputs[[i]].option = response.results;
			} 
		}
	}
	inputs.sort((a, b) => parseFloat(a.order) - parseFloat(b.order));
	return await object.parseInputData(inputs);
}

AbstractInputUtil.prototype.getInputConfig = async function(inputs){
	let object = this;
	return (await object.getRawInputConfig(inputs)).inputs;
}
	
AbstractInputUtil.prototype.getDefaultInputConfig = async function(){
	let input = {};
	input.columnName = 'None';
	input.columnType = 'None';
	input.label = 'None';
	input.order = '0';
	input.typeName = 'Text';
	input.isTable = false;
	input.isRequired = false;
	input.isSearch = false;
	input.isForm = true;
	input.isEditable = true;
	input.isNumber = false;
	input.size = 'normal';
	return input;
}

AbstractInputUtil.prototype.setPrerequisiteInput = async function(modelName, referenceURL, record, data) {
	let object = this;
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
	
AbstractInputUtil.prototype.setPrerequisiteEvent = async function(prerequisite, inputs, detail, value) {
	let object = this;
	prerequisite.prerequisite = true;
	prerequisite.fetched = {};
	prerequisite.childInput = {};
	for (let i in inputs) {
		prerequisite.childInput[inputs[i].detail.columnName] = inputs[i];
	}
	prerequisite.onchange = async function() {
		if (this.value == undefined) return;
		if (this.value == '') return;
		for (let index in prerequisite.childInput) {
			let item = prerequisite.childInput[index];
			let input = item.input;
			if (input == undefined) continue;
			let detail = item.detail;
			let result;
			if (prerequisite.fetched[detail.columnName] == undefined) prerequisite.fetched[detail.columnName] = {};
			if (prerequisite.fetched[detail.columnName][this.value] == undefined) {
				let response;
				if (this.currentValue == undefined) response = await GET(detail.url+this.value, undefined, 'json', true);
				else{
					if(typeof(this.currentValue) == 'string'){
						response  = await GET(detail.url+JSON.parse(this.currentValue).id, undefined, 'json', true);
					}else {
						response = await GET(detail.url+this.currentValue.id, undefined, 'json', true);
					}
				}
				
				if (response == undefined || !response.isSuccess) result = [];
				else {
					result = response.results;
					if (response.result != undefined) result = response.result;
				}
				if(result.length != 0) prerequisite.fetched[detail.columnName][this.value] = result;
			} else {
				result = prerequisite.fetched[detail.columnName][this.value];
			}
			input.html('');
			let option = document.createElement("OPTION");
			option.value = -1;
			option.text = "None";
			input.appendChild(option);
			for (let i in result) {
				let option = document.createElement("OPTION");
				option.value = result[i].value;
				option.text = result[i].label;
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

AbstractInputUtil.prototype.prepareInput = async function(modelName, input) {
	let object = this;
	let result = await object.parseInputData(input);
	let reference = result.reference;
	let inputs = {};
	let exceptURL = {};
	let autoCompleteMap = {};
	let fileMatrixMap = {};
	let imageMap = {};
	let advanceInputMap = {};
	for (let item of input) {
		if (item.isGroup) {
			if (item.input == undefined) continue;
			for (let detail of item.input) {
				await object.setInputMapper(detail, inputs,  exceptURL, autoCompleteMap, fileMatrixMap, imageMap, advanceInputMap);
			}
		} else {
			let detail = item;
			await object.setInputMapper(detail, inputs,  exceptURL, autoCompleteMap, fileMatrixMap, imageMap, advanceInputMap);
		}
	}
	if (Object.keys(inputs).length > 0) {
		for (let url in reference) {
			if (exceptURL[url] != undefined) continue;
			let response = await GET(url, undefined, 'json', true);
			for (let i in reference[url]) {
				if (inputs[reference[url][i]] == undefined) continue;
				if (response != undefined && response.isSuccess) {
					if (response.results) inputs[reference[url][i]].option = response.results;
					else if (response.result) inputs[reference[url][i]].option = response.result;
				}
			}
		}
	}
	return {exceptURL, autoCompleteMap, fileMatrixMap, imageMap, advanceInputMap, inputs}
}

AbstractInputUtil.prototype.setInputMapper = async function(detail, inputs,  exceptURL, autoCompleteMap, fileMatrixMap, imageMap, advanceInputMap) {
	inputs[detail.columnName] = detail;
	if (detail.typeName == "PrerequisiteReferenceSelect") {
		if (exceptURL[detail.url] == undefined) exceptURL[detail.url] = [];
		exceptURL[detail.url].push(detail);
	}
	if (detail.typeName == "AutoComplete") autoCompleteMap[detail.columnName] = detail;
	if (detail.typeName == "FileMatrix") fileMatrixMap[detail.columnName] = detail;
	if (detail.typeName == "Image") imageMap[detail.columnName] = detail;
	if (detail.isAdvanceForm) advanceInputMap[detail.columnName] = detail;
}

AbstractInputUtil.prototype.initCropperEvent = async function(key, dom){
	let image = dom[`${key}_image`];
	let cropper = new Cropper(image, {
		dragMode: 'move',
		aspectRatio: 1,
		autoCropArea: .75,
		restore: false,
		guides: true,
		center: true,
		highlight: true,
		cropBoxMovable: false,
		cropBoxResizable: false,
		toggleDragModeOnDblclick: false,
	});
	dom[key].cropper = cropper;
}

AbstractInputUtil.prototype.crop = function(key, dom){
	let dataURL = dom[key].cropper.getCroppedCanvas().toDataURL('image/png');
	dom[key].dataURL = dataURL;
	fetch(dataURL)
	.then(res => res.blob())
	.then(blob => {
		let file = new File([blob], new Date().getTime()+'.png', blob);
		dom[key].cropped = file;
	});
}

AbstractInputUtil.prototype.setAutoCompleteMap = async function(view, autoCompleteMap) {
	for(let i in autoCompleteMap){
		if (view.dom[i] == undefined) continue;
		let input = autoCompleteMap[i];
		let config = {isFetch: true, limit: 10, template: input.template, parameter: input.parameter};
		view.dom[i].complete(input.url, config, function(items){
			view.items = items;
			// if(view.dom[i].onchange != undefined) view.dom[i].onchange();
		}, view);
	}
}

AbstractInputUtil.prototype.setFileMatrixMap = async function(view, fileMatrixMap) {
	for(let i in fileMatrixMap){
		if (view.dom[`${i}_icon`] == undefined) continue;
		view.dom[`${i}_icon`].onclick = async function(){
			let now = Date.now();
			let domObject = new DOMObject(TEMPLATE.FileMatrixRecord, {columnName: i});
			domObject.id = now;
			if(domObject.dom.delete != undefined){
				domObject.dom.delete.onclick = async function(){
					domObject.dom.record.remove();
					delete view.dom[`${i}_records`][domObject.id];
				}
			}
			if(view.dom[`${i}_records`] == undefined) view.dom[`${i}_records`] = {};
			view.dom[`${i}_records`][now] = domObject;
			view.dom[`${i}_tbody`].append(domObject);
		}
	}
}

AbstractInputUtil.prototype.setImageMap = async function(view, imageMap) {
	let object = this;
	for(let i in imageMap){
		if (view.dom[i] == undefined) continue;
		view.dom[i].removed = false;
		view.dom[i].hasImage = false;
		view.dom[i].fileUpload = [];
		view.dom[`${i}_file`].onclick = async function(){
			view.dom[i].click();
		}
		view.dom[i].onchange = async function(){
			if(this.cropper) this.cropper.destroy();
			if(!this.files.length) return;
			let file = this.files[0];
			let reader = new FileReader();
			reader.onload = function(e){
				view.dom[`${i}_image`].src = e.target.result;
				view.dom[`${i}_confirm`].show();
				view.dom[`${i}_cropper`].show();
				if(imageMap[i].hasCrop) object.initCropperEvent(i, view.dom);
			}
			reader.readAsDataURL(file);
		}
		view.dom[`${i}_preview`].onclick = async function(){
			if(!view.dom[i].hasImage) return;
			view.dom[`${i}_previewer`].show();
			let file = view.dom[i].files[0];
			let reader = new FileReader();
			reader.onload = function(e){
				view.dom[`${i}_originalImage`].src = e.target.result;
			}
			if(file != undefined) reader.readAsDataURL(file);
			if(view.dom[i].dataURL != undefined) view.dom[`${i}_croppedImage`].src = view.dom[i].dataURL;
			view.dom[`${i}_originalButton`].onclick();
		}
		if(view.dom[`${i}_delete`]){
			view.dom[`${i}_delete`].onclick = async function(){
				view.dom[i].type = 'text';
				view.dom[i].type = 'file';
				view.dom[`${i}_fileName`].html('No File Chosen');
				view.dom[`${i}_preview`].classList.add('disabled');
				view.dom[i].removed = true;
				view.dom[i].hasImage = false;
				if(view.dom[i].cropper) view.dom[i].cropper.destroy();
				delete view.dom[i].cropped;
				delete view.dom[i].cropper;
				delete view.dom[i].dataURL;
			}
		}
		view.dom[`${i}_confirm`].onclick = async function(){
			if(imageMap[i].hasCrop) await object.crop(i, view.dom);
			view.dom[`${i}_cropper`].hide();
			view.dom[`${i}_preview`].classList.add('disabled');
			if(!view.dom[i].files.length) return;
			view.dom[`${i}_preview`].classList.remove('disabled');
			view.dom[`${i}_fileName`].html(view.dom[i].files[0].name);
			view.dom[i].removed = false;
			view.dom[i].hasImage = true;
			view.dom[i].fileUpload = view.dom[i].files;
		}
		view.dom[`${i}_cancel`].onclick = async function(){
			if(view.dom[i].fileUpload.length) view.dom[i].files = view.dom[i].fileUpload;
			else{
				view.dom[i].type = 'text';
				view.dom[i].type = 'file';
			}
			view.dom[`${i}_cropper`].hide();				
		}
		view.dom[`${i}_originalButton`].onclick = async function(){
			view.dom[`${i}_original`].show();
			view.dom[`${i}_cropped`].hide();
			this.classList.remove('disabled');
			view.dom[`${i}_croppedButton`].classList.add('disabled');
		}
		if(imageMap[i].hasCrop){
			view.dom[`${i}_croppedButton`].onclick = async function(){
				view.dom[`${i}_original`].hide();
				view.dom[`${i}_cropped`].show();
				this.classList.remove('disabled');
				view.dom[`${i}_originalButton`].classList.add('disabled');
			}
		}else view.dom[`${i}_croppedButton`].remove();
		view.dom[`${i}_previwerCancel`].onclick = async function(){
			view.dom[`${i}_previewer`].hide();
		}
	}
}

AbstractInputUtil.prototype.getQuillConfig = async function(inputConfig){
	let object = this;
	let config = {
		theme: 'snow'
	};
	let additional = [];
	let handlers = {};
	if (inputConfig.config != undefined) {
		if (inputConfig.config.hasImage == true) additional.push('image');
		if (inputConfig.config.hasVideo == true) additional.push('video');
		for(let i in inputConfig.config.handlers){
			let name = inputConfig.config.handlers[i].name;
			let url = inputConfig.config.handlers[i].url;
			if(name == 'image'){
				handlers[name] = imageHandler;
				handlers[name].url = url;
			}
		}
	}
	config.modules = {
		toolbar: {
			container: [
				['bold', 'italic', 'underline'],
				[{ 'list': 'bullet' }, { 'list': 'ordered' }],
				['clean'],
				[{ 'align': [] }]
			]
		},
	}
	if (additional.length > 0) config.modules.toolbar.container.push(additional);
	if (Object.keys(handlers).length > 0) config.modules.toolbar.handlers = handlers;

	async function imageHandler(){
		let quillItem = this;
		let url = this.handlers.image.url;
		let input = document.createElement('input');
		input.type = 'file';
		input.accept = 'image/*';
		input.click();
		input.onchange = async function(){
			let formData = new FormData();
			formData.append('image', this.files[0]);
			let response = await POST(url, formData);
			let range = quillItem.quill.getSelection();
			quillItem.quill.insertEmbed(range.index, 'image', `share/${response.result}`, Quill.sources.USER);
		}
	}

	return config;
}

AbstractInputUtil.prototype.getLinkColumn = function(input, data) {
	let columnLinkMap = {};
	function checkLinkColumn(item) {
		if (item.isLink) {
			let referenceValue = data[item.columnName];
			if (item.linkColumn) {
				referenceValue = data[item.linkColumn];
			}
			columnLinkMap[item.columnName] = {column: item, value: referenceValue};
		} else {
			item.isLink = false;
		}
	}

	for (let item of input) {
		if (item.isGroup) {
			for (let subItem of item.input) {
				checkLinkColumn(subItem);
			}
		} else {
			checkLinkColumn(item);
		}
	}
	return columnLinkMap;
}

AbstractInputUtil.prototype.triggerLinkEvent = async function(page, columnLinkMap) {
	let value = columnLinkMap.value;
	if (value == "") return;
	if (columnLinkMap.column.foreignModelName) {
		if (page.main.pageModelDict[columnLinkMap.column.foreignModelName] == undefined) return;
		let modelName = columnLinkMap.column.foreignModelName;
		let config = {};
		config.data = {};
		config.isView = true;
		config.data[columnLinkMap.column.foreignColumn] = value;
		page.main.pageModelDict[modelName].renderViewFromExternal(modelName, config, 'Form');
	} else {
		let config = {};
		config.data = {};
		config.isView = true;
		if (columnLinkMap.column.linkColumn.length > 0) {
			config.data[columnLinkMap.column.linkColumn] = value;
		} else {
			config.data[columnLinkMap.column.columnName] = value;
		}
		page.renderViewFromExternal(page.model, config, 'Form')
	}
}