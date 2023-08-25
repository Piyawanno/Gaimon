const DynamicLayoutCreator = function() {
	const object = this;
	object.form;
	object.modelName;

	object.defaultColumnInput = {
		'Text': {name: '', type: ColumnType.STRING, default: '', input: {label: 'Text', type: InputType.TEXT}},
		'Number': {name: '', type: ColumnType.INTEGER, default: 0, input: {label: 'Number', type: InputType.NUMBER}},
		'DropDown': {name: '', type: ColumnType.INTEGER, default: -1, input: {label: 'DropDown', type: InputType.STATIC_SELECT, option: []}},
		'Radio': {name: '', type: ColumnType.INTEGER, default: -1, input: {label: 'Radio', type: InputType.RADIO, option: []}},
		'Checkbox': {name: '', type: ColumnType.INTEGER, default: -1, input: {label: 'Checkbox', type: InputType.CHECKBOX, option: []}},
		'Date': {name: '', type: ColumnType.DATE, input: {label: 'Date', type: InputType.DATE}},
		'Color': {name: '', type: ColumnType.STRING, default: '', input: {label: 'Color', type: InputType.COLOR}},
		'Email': {name: '', type: ColumnType.STRING, default: '', input: {label: 'Email', type: InputType.EMAIL}},
		'Switch': {name: '', type: ColumnType.INTEGER, default: 0, input: {label: 'Switch', type: InputType.ENABLE}},
		'File': {name: '', type: ColumnType.STRING, default: '', isMultiple: false, input: {label: 'File', type: InputType.FILE}},
		'Password': {name: '', type: ColumnType.STRING, default: '', input: {label: 'Password', type: InputType.PASSWORD}},
		'TextArea': {name: '', type: ColumnType.TEXT, default: '', input: {label: 'TextArea', type: InputType.TEXT_AREA}},
		'TimeSpan': {name: '', type: ColumnType.INTEGER, default: 0, input: {label: 'TimeSpan', type: InputType.TIME_SPAN}},
		'DateTime': {name: '', type: ColumnType.DATE_TIME, input: {label: 'DateTime', type: InputType.DATE_TIME}},
	}

	object.inputTypeMap = {}
	object.inputTypeMap[InputType.TEXT] = 'Text';
	object.inputTypeMap[InputType.NUMBER] = 'Number';
	object.inputTypeMap[InputType.STATIC_SELECT] = 'DropDown';
	object.inputTypeMap[InputType.RADIO] = 'Radio';
	object.inputTypeMap[InputType.CHECKBOX] = 'Checkbox';
	object.inputTypeMap[InputType.DATE] = 'Date';
	object.inputTypeMap[InputType.COLOR] = 'Color';
	object.inputTypeMap[InputType.EMAIL] = 'Email';
	object.inputTypeMap[InputType.ENABLE] = 'Switch';
	object.inputTypeMap[InputType.FILE] = 'File';
	object.inputTypeMap[InputType.PASSWORD] = 'Password';
	object.inputTypeMap[InputType.TEXT_AREA] = 'TextArea';
	object.inputTypeMap[InputType.TIME_SPAN] = 'TimeSpan';
	object.inputTypeMap[InputType.DATE_TIME] = 'DateTime';

	this.render = async function(modelName) {
		object.modelName = modelName;
		object.form = new DOMObject(await TEMPLATE.get('LayoutCreator', false));
		object.form.dom.preference.hide(); 
		await object.initEvent(object.form);
		await object.initForm()
		return object;
	}

	this.initForm = async function() {
		let response = await GET(`dynamic/form/get/${object.modelName}/0`);
		if (response == undefined) return;
		if (!response.isSuccess) return;
		if (response.form) {
			object.form.dom.canvas.html('');
			await object.renderFromDynamicForm(response.form);
		} else {
			object.form.dom.canvas.html('');
			for (let column of response.attributeList) {
				if (column.input == undefined) continue;
				column.input.typeName = object.inputTypeMap[column.input.type];
				let inputConfig = await object.formatInput(column);
				await object.appendInput(column.input.typeName, inputConfig);
			}
		}
	}

	this.initEvent = async function(form) {
		form.dom.inputHeader.onclick = async function() {
			form.dom.inputHeaderLess.toggle();
			form.dom.inputHeaderMore.toggle();
			form.dom.inputSection.toggle();
		}

		form.dom.layoutHeader.onclick = async function() {
			form.dom.layoutHeaderLess.toggle();
			form.dom.layoutHeaderMore.toggle();
			form.dom.layoutSection.toggle();
		}

		let buttons = form.html.getElementsByClassName('layoutCreatorInputBox');
		for (let button of buttons) {
			button.ondragstart = async function(event) {
				let inputType = event.target.getAttribute('rel');
				event.dataTransfer.setData("inputType", inputType);
				event.dataTransfer.setData("isCreate", true);
			}
		}

		form.dom.canvas.ondrop = object.onDrop;

		form.dom.canvas.ondragover = async function(event) {
			event.preventDefault();
		}

		form.dom.canvas.onclick = async function(event) {
			if (event.target == this) {
				await object.renderCanvasPreference(form.dom.canvas);
				object.clearSelectedItem();
			}
		}
		form.dom.canvas.inputPerLine = 1;
		form.getData = object.getData;
	}

	this.getData = async function() {
		let items = object.form.dom.canvas.getElementsByClassName('layoutInput');
		let inputOrder = 1;
		let groupOrderMap = {};
		let groupList = [];
		let groups = [];
		let attributeList = [];
		let inputList = [];
		let inputPerLine = object.form.dom.canvas.inputPerLine;
		for (let item of items) {
			if (item.__dom__.config.isGroup) {
				if (item.__dom__.config.label.length == 0) {
					item.classList.add('error');
					continue;
				}
				let config = item.__dom__.config;
				config.order = inputOrder;
				groupOrderMap[config.label] = 1;
				groups.push(item);
				inputOrder = inputOrder + 1;
			} else {
				if (item.__dom__.config.name.length == 0) {
					item.classList.add('error');
					continue;
				}
				if (groups.length > 0 && groups[groups.length - 1] == item.__dom__.__parent__.html) {
					let config = item.__dom__.config;
					config.input.group = JSON.parse(JSON.stringify(groups[groups.length - 1].__dom__.config));
					config.input.order = groupOrderMap[config.input.group.label];
					config.input.order = config.input.order + "";
					config.order = config.input.order;
					groupOrderMap[config.input.group.label] = groupOrderMap[config.input.group.label] + 1;
					let dumped = JSON.parse(JSON.stringify(config));
					dumped.isGroup = undefined;
					dumped.additional = undefined;
					dumped.order = undefined;
					dumped.input.group = undefined;
					dumped.input.typeName = undefined;
					dumped.inputPerLine = undefined;
					dumped.input.inputPerLine = undefined;
					let inputConfig = JSON.parse(JSON.stringify(config));
					inputConfig.input.inputPerLine = config.input.group.inputPerLine;
					attributeList.push(dumped);
					inputList.push(inputConfig);
				} else {
					let config = item.__dom__.config;
					config.input.order = inputOrder;
					config.input.order = config.input.order + "";
					config.order = config.input.order;
					inputOrder = inputOrder + 1;
					let dumped = JSON.parse(JSON.stringify(config));
					dumped.isGroup = undefined;
					dumped.additional = undefined;
					dumped.order = undefined;
					dumped.input.typeName = undefined;
					dumped.inputPerLine = undefined;
					dumped.input.inputPerLine = undefined;
					let inputConfig = JSON.parse(JSON.stringify(config));
					inputConfig.input.inputPerLine = inputPerLine;
					attributeList.push(dumped);
					inputList.push(inputConfig);
				}
			}
		}
		for (let group of groups) {
			group.__dom__.config.input = undefined;
			groupList.push(group.__dom__.config);
		}
		return {attributeList, inputList, groupList, inputPerLine, formName: object.modelName};
	}

	this.clearSelectedItem = function() {
		let items = object.form.dom.canvas.getElementsByClassName('layoutCreatorCanvasInput')
		for (let item of items) {
			item.classList.remove('selected');
		}
	}

	this.renderCanvasPreference = async function(target) {
		let preference = new DOMObject(await TEMPLATE.get('LayoutCreatorCanvasPreference'), {});
		object.form.dom.preference.html(preference);
		object.form.dom.preference.show();
		preference.dom.inputPerLine.value = target.inputPerLine;
		preference.dom.inputPerLine.onchange = async function() {
			if (target == object.form.dom.canvas) {
				target.inputPerLine = parseInt(this.value);
				let items = object.form.dom.canvas.getElementsByClassName('layoutCreatorCanvasInput');
				for (let item of items) {
					if (item.__dom__.config.input.group) continue;
					item.classList.remove('input_per_line_1');
					item.classList.remove('input_per_line_2');
					item.classList.remove('input_per_line_3');
					item.classList.remove('input_per_line_4');
					item.classList.add(`input_per_line_${target.inputPerLine}`);
				}
			}
		}
	}

	this.onDrop = async function(event) {
		event.preventDefault();
		if (event.target != object.form.dom.canvas) return;
		let inputType = event.dataTransfer.getData("inputType");
		let isCreate = JSON.parse(event.dataTransfer.getData("isCreate"));
		let config = event.dataTransfer.getData("config");
		let input = await object.getInputByType(inputType, object.form.dom.canvas);
		if (!isCreate) {
			input.config = JSON.parse(config);
			input.config.input.group = undefined;
			input.dom.label.html(input.config.input.label);
			let items = object.form.dom.canvas.getElementsByClassName('dragging');
			for (let item of items) {
				item.remove();
			}
		}
		object.form.dom.canvas.append(input, 'inputs');
	}

	this.initInputEvent = async function(input) {
		input.dom.delete.onclick = async function() {
			input.html.remove();
		}
		input.html.onclick = async function(event) {
			event.preventDefault();
			if (!this.hasChildNodes(event.target)) return;
			if (input.dom.delete == event.target) {
				object.form.dom.preference.hide();
				return;
			}
			object.clearSelectedItem();
			input.html.classList.add('selected');
			object.renderPreference(input);
		}
		input.html.ondragover = async function(event) {
			event.preventDefault();
			this.classList.add('drag_over');
		}
		input.html.ondragleave = async function(event) {
			this.classList.remove('drag_over');
		}
		input.html.ondrop = async function(event) {
		   object.onDropInput(input, event);
		}
		input.html.ondragstart = async function(event) {
			let inputType = input.dom.inputType.value;
			event.dataTransfer.setData("inputType", inputType);
			event.dataTransfer.setData("isCreate", false);
			event.dataTransfer.setData("config", JSON.stringify(input.config));
			input.html.classList.add('dragging');
		}
	}

	this.onDropInput = async function(tag, event) {
		event.preventDefault();
		let inputType = event.dataTransfer.getData("inputType");
		let isCreate = JSON.parse(event.dataTransfer.getData("isCreate"));
		let config = event.dataTransfer.getData("config");
		if (!isCreate) config = JSON.parse(config);
		else config = undefined;
		let input = await object.getInputByType(inputType, object.form.dom.canvas);
		let isInsideGroup = false;
		for (let item of event.target.children) {
			if (item.classList && item.classList.value.split(' ').includes('layoutCreatorCanvasGroupInputBox')) {
				isInsideGroup = true;
				item.insertBefore(input.html, tag.html);
				break;
			}
		}
		if (!isInsideGroup) object.form.dom.canvas.insertBefore(input.html, tag.html);
		if (!isCreate) {
			input.config = config;
			input.dom.label.html(input.config.input.label);
			let items = object.form.dom.canvas.getElementsByClassName('dragging');
			for (let item of items) {
				item.remove();
			}
		}
		tag.html.classList.remove('drag_over');
	}

	this.renderFromDynamicForm = async function(dynamicForm) {
		object.form.dom.canvas.inputPerLine = dynamicForm.inputPerLine;
		for (let input of dynamicForm.input) {
			if (input.isGroup) await object.appendGroup(input);
			else {
				input.input.typeName = object.inputTypeMap[input.input.type]
				await object.appendInput(input.input.typeName, input);
			}
		}

		// for (let group of dynamicForm.groupList) {
		// 	await object.appendGroup(group);
		// }
		// let groups = await object.form.dom.canvas.getElementsByClassName('layoutInput');
		// let groupMap = {};
		// for (let item of groups) {
		// 	if (item.__dom__.config.isGroup) groupMap[item.__dom__.config.label] = item.__dom__;
		// }
		// for (let column of dynamicForm.inputList) {
		// 	column.input.typeName = object.inputTypeMap[column.input.type]
		// 	let group;
		// 	if (column.input.group) group = groupMap[column.input.group.label]
		// 	await object.appendInput(column.input.typeName, column, group);
		// }
	}

	this.appendInput = async function(inputType, config, group) {
		let target = object.form.dom.canvas;
		if (group) target = group.config;
		let input = await object.getInputByType(inputType, target);
		if (config) {
			input.config = config;
			input.dom.label.html(input.config.input.label);
			let items = object.form.dom.canvas.getElementsByClassName('dragging');
			for (let item of items) {
				item.remove();
			}
		}
		if (group) {
			group.dom.form.append(input, 'inputs');
		} else object.form.dom.canvas.append(input, 'inputs');
		return input;
	}

	this.appendGroup = async function(config) {
		let input = await object.getInputByType('Group', object.form.dom.canvas);
		input.config = config;
		input.dom.label.html(config.label);
		if (input.config.isShowLabel) input.dom.label.show();
		else input.dom.label.hide();
		object.form.dom.canvas.append(input, 'inputs');
		if (config.input) {
			for (let item of config.input) {
				item.input.typeName = object.inputTypeMap[item.input.type]
				object.appendInput(item.input.typeName, item, input)
			}
		}
		return input;
	}

	this.initGroupEvent = async function(input) {
		input.dom.delete.onclick = async function() {
			input.html.remove();
		}
		input.html.onclick = async function(event) {
			event.preventDefault();
			if (event.target != input.dom.label && event.target != input.dom.form && event.target != this) return;
			if (input.dom.delete == event.target) {
				object.form.dom.preference.hide();
				return;
			}
			// if (event.target.hasChildNodes(input.dom.delete)) {
			// 	object.form.dom.preference.hide();
			// 	return;
			// }
			object.clearSelectedItem();
			input.html.classList.add('selected');
			object.renderGroupPreference(input);
		}
		input.html.ondragover = async function(event) {
			event.preventDefault();
		}
		input.html.ondrop = undefined;
		input.dom.form.ondrop = async function(event) {
			object.onDropOverGroup(input, event);
		}
	}

	this.onDropOverGroup = async function(group, event) {
		event.preventDefault();
		if (event.target != group.dom.form) return;
		let inputType = event.dataTransfer.getData("inputType");
		if (inputType == 'Group') return;
		let isCreate = JSON.parse(event.dataTransfer.getData("isCreate"));
		let config = event.dataTransfer.getData("config");
		let input = await object.getInputByType(inputType, group.config);
		await object.initInputEvent(input);
		group.dom.form.append(input, 'inputs');
		if (!isCreate) {
			input.config = JSON.parse(config);
			input.dom.label.html(input.config.input.label);
			let items = object.form.dom.canvas.getElementsByClassName('dragging');
			for (let item of items) {
				item.remove();
			}
		}
	}

	this.renderGroupPreference = async function(group) {
		let preference = new DOMObject(await TEMPLATE.get('LayoutCreatorGroupPreference'), {});
		object.form.dom.preference.html(preference);
		object.form.dom.preference.show();
		if (group.config == undefined) group.config = {label: 'Group'}
		preference.dom.label.value = group.config.label;
		preference.dom.inputPerLine.value = group.config.inputPerLine;
		preference.dom.isShowLabel.checked = group.config.isShowLabel;
		preference.dom.label.onkeyup = async function() {
			group.config.label = this.value;
			group.dom.label.html(this.value);
		}

		preference.dom.inputPerLine.onchange = async function() {
			group.config.inputPerLine = parseInt(this.value);
			let items = group.dom.form.getElementsByClassName('layoutCreatorCanvasInput')
			for (let item of items) {
				item.classList.remove('input_per_line_1');
				item.classList.remove('input_per_line_2');
				item.classList.remove('input_per_line_3');
				item.classList.remove('input_per_line_4');
				item.classList.add(`input_per_line_${group.config.inputPerLine}`);
			}
		}

		preference.dom.isShowLabel.onclick = async function() {
			if (this.checked) group.dom.label.show();
			else group.dom.label.hide();
			group.config.isShowLabel = this.checked;
		}
	}

	this.renderPreference = async function(input) {
		let config = JSON.parse(JSON.stringify(input.config));
		let preference = new DOMObject(await TEMPLATE.get('LayoutCreatorPreference'), config);
		object.form.dom.preference.html(preference);
		object.form.dom.preference.show();
		preference.dom.column.onkeyup = async function() {
			input.config.name = this.value;
		}
		preference.dom.label.onkeyup = async function() {
			input.config.input.label = this.value;
			input.dom.label.html(this.value);
		}
		if (config.additional == undefined) return;
		if (config.additional.hasOption) {
			if (config.input.option.length == 0) {
				await object.createPreferenceOption(preference, input);
			} else {
				for (let value of config.input.option) {
					await object.createPreferenceOption(preference, input, value);
				}
			}
			preference.dom.addOption.onclick = async function() {
				await object.createPreferenceOption(preference, input);
			}
		}

		if (config.additional.isFile) {
			preference.dom.isMultiple.onchange = async function() {
				input.config.isMultiple = this.checked;
			}
			preference.dom.isMultiple.checked = input.config.isMultiple;
			
		}
	}

	this.createPreferenceOption = async function(preference, input, value) {
		function refresh(preference, input) {
			let options = preference.dom.option.getElementsByClassName('preferenceOption');
			input.config.input.option = [];
			for (let item of options) {
				input.config.input.option.push(item.value);
			}
		}

		let option = new DOMObject(await TEMPLATE.get('LayoutCreatorPreferenceOption'), {});
		if (value) option.dom.option.value = value;
		option.dom.delete.onclick = async function() {
			option.html.remove();
			refresh(preference, input);
		}
		option.dom.onkeyup = async function() {
			refresh(preference, input);
		}
		preference.dom.option.append(option);
		refresh(preference, input);
	}

	this.formatInput = function(config) {
		let inputType = config.input.typeName;
		let formated = object.getDefaultColumnInput(inputType);
		formated.name = config.input.columnName;
		formated.type = ColumnTypeStringMap[config.input.columnType];
		formated.default = config.default;
		formated.input.label = config.input.label;
		if (config.input.option) {
			formated.input.option = config.input.option;
		}
		return formated;
	}

	this.getDefaultColumnInput = function(inputType) {
		if (object.defaultColumnInput[inputType] == undefined) inputType = 'Text';
		let config = JSON.parse(JSON.stringify(object.defaultColumnInput[inputType]));
		config.isGroup = false;
		config.additional = {}
		
		if (config.type == ColumnType.INTEGER) config.additional.isNumber = true;
		else config.additional.isNumber = false;

		if (inputType == 'Text' || inputType == 'Number') config.additional.isInput = true;
		else config.additional.isInput = false; 

		if (inputType == 'DropDown' || inputType == 'Radio' || inputType == 'Checkbox') config.additional.hasOption = true;
		else config.additional.hasOption = false; 

		if (inputType == 'File') config.additional.isFile = true;
		else config.additional.isFile = false;

		if (inputType == 'Password') config.additional.isPassword = true;
		else config.additional.isPassword = false;
		return config;
	}

	this.getInputByType = async function(inputType, target) {
		if (inputType == 'Group') {
			let input = new DOMObject(await TEMPLATE.get('LayoutCreatorGroup'), {label: 'Group', inputPerLine: target.inputPerLine});
			if (input.config == undefined) input.config = {label: 'Group', isGroup: true, inputPerLine: 1, isShowLabel: true}
			input.isGroup = true;
			await object.initGroupEvent(input);
			return input;
		}
		let icon = await TEMPLATE.get(`inputIcon.${inputType}`);
		let input = new DOMObject(await TEMPLATE.get('LayoutCreatorInput'), {icon: icon, label: inputType, inputPerLine: target.inputPerLine});
		if (input.config == undefined) input.config = object.getDefaultColumnInput(input.dom.inputType.value);
		input.isGroup = false;
		await object.initInputEvent(input);
		return input;
	}

}