class ReferenceSelectInput extends SelectInput{
	constructor(column, config){
		super(column, config);
		this.url = config.url;
		this.tableURL = config.tableURL;
		this.isReferenced = true;
		this.option = [];
	}
	
	/**
	 * @typedef {object} ReferenceSelectInputAdditionalConfig
	 * @property {string} url
	 * @property {string} tableURL
	 * 
	 * @typedef {InputConfig & ReferenceSelectInputAdditionalConfig} ReferenceSelectInputConfig
	 * @param {ReferenceSelectInputConfig} config 
	 */
	static create(config) {
		let data = super.create(config);
		data.typeName = "ReferenceSelect";
		data.url = config.url != undefined ? config.url: "";
		data.tableURL = config.tableURL != undefined ? config.tableURL: "";
		return data;
	}

	async renderForm(record){
		if(this.input == null){
			let parameter = {...this};
			this.input = new InputDOMObject(TEMPLATE.input.SelectInput, parameter);
			this.setFormSideIcon(this.input, record);
			this.setFormEvent(this.input);
		}
		this.checkEditable(this.input);
		await this.getOption();
		this.setOption(this.input.dom[this.columnName], this.option);
		if(record) this.setFormValue(this.input, record);
		return this.input;
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

	async renderTableFilter(record){
		if(this.filterInput == null){
			let parameter = {...this};
			parameter.isRequired = false;
			this.filterInput = new InputDOMObject(TEMPLATE.input.SelectInput, parameter);
			this.setFormEvent(this.filterInput);
		}
		this.checkEditable(this.filterInput);
		await this.getOption();
		this.setOption(this.filterInput.dom[this.columnName], this.option);
		if(record) this.setFormValue(this.filterInput, record);
		return this.filterInput;
	}

	async renderDialogForm(record){
		if(this.input == null){
			let parameter = {...this};
			this.input = new InputDOMObject(TEMPLATE.input.SelectInput, parameter);
			this.setFormSideIcon(this.input, record);
			this.setFormEvent(this.input);
			if (this.config.prerequisite) this.setPrerequisite(this, this.input);
		}
		this.checkEditable(this.input);
		await this.getOption();
		this.setOption(this.input.dom[this.columnName], this.option);
		if(record) this.setFormValue(this.input, record);
		return this.input;
	}

	async renderCell(record, reference) {
		let parameter = {...this};
		let cell = new DOMObject(TEMPLATE.TableReferenceCellView, parameter);
		if(record) this.setTableValue(cell, record, reference);
		return cell;
	}

	async renderCardRow(record, reference) {
		let parameter = {...this};
		let cell = new DOMObject(TEMPLATE.CardRow, parameter);
		if(record) this.setCardValue(cell, record, reference);
		return cell;
	}

	async renderFormCell(record, reference, row) {
		let parameter = {...this};
		let cell = new InputDOMObject(TEMPLATE.input.TableFormSelectInput, parameter);
		cell.row = row;
		this.checkTableFormEditable(cell);
		await this.getOption();
		this.setOption(cell.dom[this.columnName], this.option);
		this.setFormEvent(cell);
		if(record) this.setTableFormValue(cell, record);
		return cell;
	}

	async fetch(input, id) {
		await this.getOption();
		this.setOption(input.dom[this.columnName], this.option);
		let record = {};
		record[this.columnName] = id;
		if(id) this.setFormValue(input, record);
	}

	async getOption(){
		if (this.url == undefined || this.url.length == 0) {
			this.option = [];
			this.optionMap = {};
			return;
		}
		let response = await GET(this.url);
		if(!response.isSuccess){
			console.error(`Error by getting option ${this.columnName} ${this.url}.`);
		}
		this.option = response.result == undefined ? response.results: response.result;
		this.option = this.option == undefined ? [] : this.option;
		this.optionMap = {};
		for(let option of this.option){
			this.optionMap[option.value] = option;
		}
	}

	getFormValue(form, inputForm, data, file, message, isShowError){
		let input = inputForm.dom[this.columnName];
		let result = input != undefined? input.value: null;
		data[this.columnName] = result;
		if(this.isRequired && (result == null || result == -1 || result == '')){
			if (isShowError) {
				input.classList.add('error');
				message.push(`Required field "${this.label}" is not selected.`);
			}
			console.log(message);
			if(result == null) result = inputForm.data.default;
			return false;
		}else{
			input.classList.remove('error');
			return true;
		}
	}

	getTableFormValue(form, cell, data, message){
		let formCell = cell.dom[this.columnName];
		let result = formCell != undefined? formCell.value: null;
		data[this.columnName] = result;
		if(this.isRequired && (result == null || result == -1)){
			formCell.classList.add('error');
			message.push(`Required field "${this.label}" is not selected.`);
			return false;
		}else{
			return true;
		}
	}

	setDetailValue(cell, record, reference){
		if(record != undefined){
			let attribute = record[this.columnName];
			let item = cell.dom[this.columnName];
			let data = reference[this.columnName];
			if (data != undefined && item != undefined) {
				item.innerHTML = data[attribute] != undefined ? data[attribute].label: '-';
			}
		}
	}

	setTableValue(cell, record, reference){
		if(record != undefined){
			let attribute = record[this.columnName];
			let item = cell.dom[this.columnName];
			let data = reference[this.columnName];
			if (data != undefined && item != undefined) {
				item.innerHTML = data[attribute] != undefined ? data[attribute].label: '-';
				if (data[attribute]?.avatar?.url) {
					cell.dom.avatar.onerror = function() {
						this.src = data[attribute]?.avatar?.default;
					}
					cell.dom.avatar.src = data[attribute]?.avatar?.url;
				} else {
					if (data[attribute]?.avatar?.default) {
						cell.dom.avatar.src = data[attribute]?.avatar?.default;
					} else {
						cell.dom.avatar.src = `${rootURL}share/icon/logo_padding.png`;
						cell.dom.avatarContainer.hide();
					}
					
				}
			}
		}
	}

	setCardValue(cell, record, reference){
		if(record != undefined){
			let attribute = record[this.columnName];
			let item = cell.dom[this.columnName];
			let data = reference[this.columnName];
			if (data != undefined && item != undefined) {
				item.innerHTML = data[attribute] != undefined ? data[attribute].label: '-';
			}
		}
	}

	setFormEvent(input) {
		let object = this;
		if (input.dom[`${this.columnName}_icon`]) {
				input.dom[`${this.columnName}_icon`].onclick = async function() {
				// main.pageModelDict[object.column.foreignModelName].renderView(object.column.foreignModelName, {}, 'Dialog');
				console.log(object.column);
			}
		}
		input.dom[this.columnName].onchange = async function() {
			object.callPrerequisite(object, input);
		}
	}

	async setFormSideIcon(inputForm, record) {
		this.createFormSideIcon();
		if (this.formSideIconMap['add'] == undefined) {
			if (this.column.foreignModelName != null && this.column.foreignColumn != null) {
				this.addIcon = new AddSideIcon('add', 'Add', '1.0', this, inputForm);
				this.appendFormSideIcon(this.addIcon);
			}
		}
		let sideIconList = await this.renderFormSideIcon(record);
		for (let sideIcon of sideIconList) {
			inputForm.dom.sideIconContainer?.appendChild(sideIcon.html);
		}
	}

	async setFormCellSideIcon(inputForm, record) {
		this.createFormSideIcon();
		let sideIcons = [];
		if (this.formSideIconMap['add'] == undefined) {
			if (this.column.foreignModelName != null && this.column.foreignColumn != null) {
				let addIcon = new AddSideIcon('add', 'Add', '1.0', this, inputForm);
				sideIcons.push(addIcon);
			}
		}
		sideIcons.sort((a, b) => VersionParser.compare(a.order, b.order));
		let sideIconList = [];
		for(let icon of sideIcons){
			sideIconList.push(await icon.render(record));
		}
		for (let sideIcon of sideIconList) {
			inputForm.dom.sideIconContainer.appendChild(sideIcon.html);
		}
	}

	enableEdit(inputForm){
		this.isEditable = true;
		if (inputForm == undefined) {
			if(this.input != null) this.input.dom[this.columnName].disabled = false;
			if(this.formCell != null) this.formCell.dom[this.columnName].disabled = false;
			if(this.filterInput != null) this.filterInput.dom[this.columnName].disabled = false;
		} else {
			inputForm.dom[this.columnName].disabled = false;
			for (let sideIcon of this.formSideIconList) {
				if (sideIcon.svg) {
					if (sideIcon.svg.html) sideIcon.svg.html.show();
				}
			}
			for (let sideIcon of this.dialogSideIconList) {
				if (sideIcon.svg) {
					if (sideIcon.svg.html) sideIcon.svg.html.show();
				}
			}
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
			for (let sideIcon of this.formSideIconList) {
				if (sideIcon.svg && sideIcon.svg.html) {
					sideIcon.svg.html.hide();
				}
			}
			for (let sideIcon of this.dialogSideIconList) {
				if (sideIcon.svg && sideIcon.svg.html) {
					sideIcon.svg.html.hide();
				}
			}
		}
	}
}