class InputMetaData{
	constructor(column, config){
		this.column = column;
		this.config = config;
		this.label = config.label;
		this.columnName = config.columnName;
		this.group = config.group;
		this.default = config.default;
		this.inputPerLine = config.inputPerLine;
		this.isReferenced = false;
		this.isTagReferenced = false;
		
		this.help = config.help;
		this.isAdvanceForm = config.isAdvanceForm;
		this.isEditable = config.isEditable;
		this.isFile = config.isFile;
		this.isFloatingPoint = config.isFloatingPoint;
		this.isGroup = config.isGroup;
		this.isLink = config.isLink;
		this.isMobile = config.isMobile;
		this.isNegative = config.isNegative;
		this.isNumber = config.isNumber;
		this.isRequired = config.isRequired;
		this.placeHolder = config.placeHolder;
		this.isEnabled = true;
		this.isGrouped = false;

		this.order = column.order;
		this.message = null;

		this.prerequisite = null;

		this.input = null;
		this.cell = null;
		this.formCell = null;
		this.detail = null;
		this.filterInput = null;
		this.rawSideIcon = config.sideIcon;
		this.formSideIconList = [];
		this.formSideIconMap = {};
		this.dialogSideIconList = [];
		this.dialogSideIconMap = {};
		this.formCellSideIconList = [];
		this.formCellSideIconMap = {};
	}

	enable(){
		this.isEnabled = true;
		if(this.input != null) this.input.html.show();
		if(this.cell != null) this.cell.html.show();
		if(this.formCell != null) this.formCell.html.show();
		if(this.filterInput != null) this.filterInput.html.show();
	}

	disable(){
		this.isEnabled = false;
		if(this.input != null) this.input.html.hide();
		if(this.cell != null) this.cell.html.hide();
		if(this.formCell != null) this.formCell.html.hide();
		if(this.filterInput != null) this.filterInput.html.hide();
	}

	enableEdit(inputForm){
		this.isEditable = true;
		if (inputForm == undefined) {
			if(this.input != null) this.input.dom[this.columnName].disabled = false;
			if(this.formCell != null) this.formCell.dom[this.columnName].disabled = false;
			if(this.filterInput != null) this.filterInput.dom[this.columnName].disabled = false;
		} else {
			inputForm.dom[this.columnName].disabled = false;
		}
	}

	disableEdit(inputForm){
		this.isEditable = false;
		if (inputForm == undefined) {
			if(this.input != null) this.input.dom[this.columnName].disabled = true;
			if(this.formCell != null) this.formCell.dom[this.columnName].disabled = true;
			if(this.filterInput != null) this.filterInput.dom[this.columnName].disabled = true;
		} else {
			inputForm.dom[this.columnName].disabled = true;
		}
	}

	async renderForm(record){
		if(this.input == null){
			this.input = new DOMObject('<div></div>', {});
		}
		return this.input;
	}

	async renderDialogForm(record){
		if(this.input == null){
			this.input = new DOMObject('<div></div>', {});
		}
		return this.input;
	}

	async renderCell(record, reference){
		let cell = new DOMObject('<td></td>', {});
		return cell;
	}

	async renderCardRow(record, reference) {
		let parameter = {...this};
		let cell = new DOMObject(TEMPLATE.CardRow, parameter);
		if(record) this.setTableValue(cell, record, reference);
		return cell;
	}

	async renderFormCell(record, reference, row){
		let cell = new DOMObject('', {});
		return cell;
	}

	async renderCard(record, reference){
		let card = new DOMObject('', {});
		return card;
	}

	async renderTableForm(record, reference){
		let input = new DOMObject('', {});
		return input;
	}

	async renderTableFilter(record, reference) {
		let input = new DOMObject('<div></div>', {});
		return input;
	}

	async renderDetail(record, reference){
		if(this.detail == null){
			this.detail = new DOMObject('', {});
		}
		return this.detail;
	}

	getFormValue(form, inputForm, data, file, message, isShowError){
		if (isShowError == undefined) isShowError = true;
		let input = inputForm.dom[this.columnName];
		let result = input != undefined? input.value: null;
		this.isPass = true;
		data[this.columnName] = this.column.inputToJSON(result);
		if(this.isRequired && (result == null || result.length == 0)){
			if (isShowError) {
				input?.classList.add('error');
				message.push(`Required field "${this.label}" is not set.`);
			}
			this.isPass = false;
			return false;
		}else{
			input?.classList.remove('error');
			return true;
		}
	}

	setFormValue(inputForm, record){
		if(record != undefined){
			let attribute = record[this.columnName];
			let input = inputForm == undefined ? undefined : inputForm.dom[this.columnName];
			if(attribute != undefined && input != undefined){
				input.value = this.column.toInput(attribute);
				if (this.prerequisite != null) this.callPrerequisite(this, inputForm);
			}
		}
	}

	clearFormValue(inputForm) {
		let input = inputForm.dom[this.columnName];
		if(input != undefined){
			input.value = '';
		}
	}

	async initLinkEvent(cell, column, record) {
		if (!column.isLink) return;
		let object = this;
		cell.html.onclick = async function() {
			if (column.column.foreignColumn == undefined && column.column.foreignModelName == undefined) {
				object.page.renderDetail(record.id);
			} else {
				let ID = record[column.columnName];
				await main.pageModelDict[column.column.foreignModelName]?.onPrepareState()
				if (main.pageModelDict[column.column.foreignModelName]) {
					if (main.pageModelDict[column.column.foreignModelName].renderDetail) {
						main.pageModelDict[column.column.foreignModelName]?.renderDetail(ID)
					} else {
						main.pageModelDict[column.column.foreignModelName]?.renderViewFromExternal(column.column.foreignModelName, {data: {id: ID}, isView: true}, 'Form')
					}
				}
				
			}
		}
	}

	async renderDetail(record, reference){
		if(this.detail == null){
			let parameter = {...this};
			this.detail = new DOMObject(TEMPLATE.DetailInputView, parameter);
			this.setInputPerLine(this.detail, 2);
			this.initLinkEvent(this.detail, parameter, record);
		}
		if(record) this.setDetailValue(this.detail, record, reference);
		return this.detail;
	}

	setDetailValue(detail, record, reference) {
		if(record != undefined){
			let attribute = record[this.columnName];
			let item = detail.dom[this.columnName];
			if(attribute != undefined && item != undefined){
				if (attribute.length == 0) attribute = '-';
				item.innerHTML = this.column.toDisplay(attribute);
			}
		}
	}

	setTableValue(cell, record, reference){
		if(record != undefined){
			let attribute = record[this.columnName];
			let item = cell.dom[this.columnName];
			if(attribute != undefined && item != undefined){
				item.innerHTML = this.column.toDisplay(attribute);
			}
		}
	}

	setCardValue(cell, record, reference){
		if(record != undefined){
			let attribute = record[this.columnName];
			let item = cell.dom[this.columnName];
			if(attribute != undefined && item != undefined){
				item.innerHTML = this.column.toDisplay(attribute);
			}
		}
	}

	setTableFormValue(cell, record){
		if(record != undefined){
			let attribute = record[this.columnName];
			let formCell = cell.dom[this.columnName];
			if(attribute != undefined && formCell != undefined){
				formCell.value = this.column.toInput(attribute);
			}
		}
	}

	checkEditable(inputForm){
		let input = inputForm.dom[this.columnName];
		if(input != undefined){
			input.disabled = !this.isEditable;
			if(this.isEnabled) input.show();
			else input.hide();
		}
	}

	checkTableFormEditable(cell){
		let formCell = cell.dom[this.columnName];
		if(formCell != undefined){
			formCell.disabled = !this.isEditable;
			if(this.isEnabled) formCell.show();
			else formCell.hide();
		}
	}

	setInputPerLine(input, inputPerLine){
		if (inputPerLine == undefined) inputPerLine = this.inputPerLine;
		if(input != null){
			input.html.classList.add(`input_per_line_${inputPerLine}`);
		}
	}

	setOption(select, option){
		// select.innerHTML = '';
		select.html(`<option value="-1" localized selected>Not Select</option>`);
		for(let data of option){
			select.append(`<option value="${data.value}">${data.label}</option>`);
		}
	}

	setFormEvent() {

	}

	setTableFormEvent() {

	}

	callPrerequisite(input, dom) {
		if (this.prerequisite == null) return;
		for (let item of this.prerequisite) {
			if (item.input.handlePrerequisite) {
				if (dom.row != undefined) {
					if (dom.row == item.dom.row) {
						item.input.handlePrerequisite.bind(item.input)(input, dom, item.dom);
					}
				} else {
					item.input.handlePrerequisite.bind(item.input)(input, dom, item.dom);
				}
				
			}
		}
	}

	setPrerequisite(input, dom, row) {
		let prerequisite = input.config.prerequisite;
		if (prerequisite == null) return;
		let splitted = prerequisite.split('.');
		input.prerequisiteColumn = splitted[1];
		let parent = this.meta.inputMap[splitted[1]];
		if (row == undefined)
		if (parent == undefined) return;
		if (parent.prerequisite == null) parent.prerequisite = [];
		parent.prerequisite.push({input: input, dom: dom});
	}

	onRender(inputForm){
		if (inputForm == undefined) return;
		let input = inputForm.dom[this.columnName];
		if(input){
			input.value = '';
			this.message = '';
		}
		let error = inputForm.dom[`${this.columnName}_error`];
		if(error){
			error.hide();
		}
	}

	createFormSideIcon(input){
		this.sideIconList = [];
		this.sideIconMap = {};
		for(let icon of this.rawSideIcon){
			let renderClass = (Function(`return ${icon.renderClass}`))();
			if(!renderClass || icon.isAdd == true) continue;
			let sideIcon = new renderClass(icon.name, icon.icon, icon.order, this, input);
			this.appendFormSideIcon(sideIcon);
		}
	}

	appendFormSideIcon(sideIcon){
		if (this.formSideIconMap[sideIcon.name] == undefined) {
			this.formSideIconList.push(sideIcon);
			this.formSideIconMap[sideIcon.name] = sideIcon;
		}
	}

	appendDialogSideIcon(sideIcon){
		if (this.dialogSideIconMap[sideIcon.name] == undefined) {
			this.dialogSideIconList.push(sideIcon);
			this.dialogSideIconMap[sideIcon.name] = sideIcon;
		}
	}

	appendFormCellSideIcon(sideIcon){
		if (this.formCellSideIconMap[sideIcon.name] == undefined) {
			this.formCellSideIconList.push(sideIcon);
			this.formCellSideIconMap[sideIcon.name] = sideIcon;
		}
	}

	async renderFormSideIcon(record){
		this.formSideIconList.sort((a, b) => VersionParser.compare(a.order, b.order));
		let rendered = [];
		for(let icon of this.formSideIconList){
			rendered.push(await icon.render(record));
		}
		return rendered;
	}

	async renderDialogSideIcon(record){
		this.dialogSideIconList.sort((a, b) => VersionParser.compare(a.order, b.order));
		let rendered = [];
		for(let icon of this.dialogSideIconList){
			rendered.push(await icon.render(record));
		}
		return rendered;
	}

	async renderFormCellSideIcon(record){
		this.formCellSideIconList.sort((a, b) => VersionParser.compare(a.order, b.order));
		let rendered = [];
		for(let icon of this.formCellSideIconList){
			rendered.push(await icon.render(record));
		}
		return rendered;
	}

	// async setFormSideIcon(inputForm, record) {
	// 	let sideIconList = await this.renderFormSideIcon(record);
	// 	console.log(inputForm, sideIconList);
	// 	for (let sideIcon of sideIconList) {
	// 		inputForm.dom.sideIconContainer.appendChild(sideIcon.html);
	// 	}
	// }

	async setDialogSideIcon(inputForm, record) {
		if (this.column.foreignModelName != null && this.column.foreignColumn != null) {
			this.addIcon = new AddSideIcon('add', 'Add', '1.0', this, inputForm);
			this.appendDialogSideIcon(this.addIcon);
		}
		let sideIconList = await this.renderDialogSideIcon(record);
		for (let sideIcon of sideIconList) {
			inputForm.dom.sideIconContainer.appendChild(sideIcon.html);
		}
	}

	setFormEvent(input) {
	}

	async setFormSideIcon(input, record) {
		this.createFormSideIcon(input);
		if (this.formSideIconMap['add'] == undefined) {
			if (this.column.foreignModelName != null && this.column.foreignColumn != null) {
				this.addIcon = new AddSideIcon('add', 'Add', '1.0', this, input);
				this.appendFormSideIcon(this.addIcon);
			}
		}
		let sideIconList = await this.renderFormSideIcon(record);
		for (let sideIcon of sideIconList) {
			input.dom.sideIconContainer.appendChild(sideIcon.html);
		}
	}

	async fetch(input, id) {

	}
}