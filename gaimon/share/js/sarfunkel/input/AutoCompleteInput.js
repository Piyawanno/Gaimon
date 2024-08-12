class AutoCompleteInput extends ReferenceSelectInput{
	constructor(column, config){
		super(column, config);
		this.parameter = {};
		if (this.config.prerequisite) {
			if (this.config.prerequisiteParameterKey) {
				this.parameter[this.config.prerequisiteParameterKey] = -1;
			} else {
				this.parameter[this.config.prerequisite.split('.')[1]] = -1;
			}
		}
	}

	/**
	 * @typedef {object} AutoCompleteInputAdditionalConfig
	 * @property {string} prerequisite
	 * @property {string} prerequisiteParameterKey
	 * 
	 * @typedef {ReferenceSelectInputConfig & AutoCompleteInputAdditionalConfig} AutoCompleteInputConfig
	 * @param {AutoCompleteInputConfig} config 
	 */
	static create(config) {
		let data = super.create(config);
		data.typeName = "AutoComplete";
		data.prerequisite = config.prerequisite != undefined ? config.prerequisite: "";
		data.prerequisiteParameterKey = config.prerequisiteParameterKey != undefined ? config.prerequisiteParameterKey: "";
		data.template = config.template;
		return data;
	}


	async renderForm(record){
		if(this.input == null){
			let parameter = {...this};
			this.input = new DOMObject(TEMPLATE.input.AutoCompleteInput, parameter);
			this.setFormSideIcon(this.input, record);
			this.setFormEvent(this.input);
			if (this.config.prerequisite) this.setPrerequisite(this, this.input);
		}
		this.checkEditable(this.input);
		if (record == undefined || record == null || Object.keys(record).length == 0) this.clearFormValue(this.input);
		else if(record){
			if(record[this.columnName] == this.default) this.clearFormValue(this.input);
			else this.setFormValue(this.input, record);
		}
		else if (this.config.prerequisite) this.disableEdit(this.input);
		return this.input;
	}

	async renderDetail(record, reference){
		if(this.detail == null){
			let parameter = {...this};
			this.detail = new DOMObject(TEMPLATE.DetailInputView, parameter);
			this.setInputPerLine(this.detail, 2);
			this.initLinkEvent(this.detail, parameter, record);
		}
		if (record == undefined || record == null || Object.keys(record).length == 0) this.clearFormValue(this.input);
		else if(record){
			if(record[this.columnName] == this.default) this.clearFormValue(this.input);
			else this.setDetailValue(this.detail, record, reference);
		}
		return this.detail;
	}

	async renderTableFilter(record){
		if(this.filterInput == null){
			let parameter = {...this};
			parameter.isRequired = false;
			this.filterInput = new InputDOMObject(TEMPLATE.input.AutoCompleteInput, parameter);
		}
		this.checkEditable(this.filterInput);
		if(record) this.setFormValue(this.filterInput, record);
		return this.filterInput;
	}

	async renderDialogForm(record){
		if(this.input == null){
			let parameter = {...this};
			this.input = new DOMObject(TEMPLATE.input.AutoCompleteInput, parameter);
			this.setFormSideIcon(this.input, record);
			this.setFormEvent(this.input);
			if (this.config.prerequisite) this.setPrerequisite(this, this.input);
		}
		this.checkEditable(this.input);
		if(record) this.setFormValue(this.input, record);
		else if (this.config.prerequisite) {
			this.disableEdit(this.input);
		}
		return this.input;
	}

	async renderFormCell(record, reference, row) {
		let parameter = {...this};
		let cell = new InputDOMObject(TEMPLATE.input.TableFormAutoCompleteInput, parameter);
		cell.row = row;
		this.setFormCellSideIcon(cell, record);
		this.checkTableFormEditable(cell);
		this.setFormEvent(cell);
		// await this.getOption();
		// this.setOption(cell.dom[this.columnName], this.option);
		if(record) this.setFormValue(cell, record);
		return cell;
	}

	async renderCell(record, reference) {
		let parameter = {...this};
		let cell = new DOMObject(TEMPLATE.TableReferenceCellView, parameter);
		if(record){
			this.setTableValue(cell, record, reference);
		}
		return cell;
	}

	setTableValue(cell, record, reference){
		let object = this;
		let parameter = {...object};
		if(record != undefined){
			let attribute = record[this.columnName];
			if(attribute != undefined){
				if (attribute == -1) {
					cell.dom.avatarContainer.hide();
					cell.dom[this.columnName].innerHTML = "-";
					return;
				}
				let url = `${this.url}/by/reference`;
				let template = this.config.template;
				if (typeof attribute == 'object') {
					cell.dom[this.columnName].innerHTML = Mustache.render(template, attribute);
				} else {
					POST(url, {'reference': attribute, 'template': template}, undefined, 'json', true).then(response => {
						if (response.isSuccess) {
							if(response.result.label) cell.dom[this.columnName].innerHTML = Mustache.render('{{{label}}}', response.result);
							else cell.dom[this.columnName].innerHTML = Mustache.render(template, response.result);
							if (response.result.__avatar__ == null) {
								cell.dom.avatarContainer.hide();
							}
							if (response.result?.__avatar__?.url) {
								cell.dom.avatar.onerror = function() {
									this.src = `${rootURL}${response.result?.__avatar__?.default}`;
								}
								cell.dom.avatar.src = `${rootURL}${response.result?.__avatar__?.url}`;
							}
						} else {
							cell.dom.avatarContainer.hide();
							cell.dom[this.columnName].innerHTML = "-";
						}
					});
				}
			} else {
				cell.dom.avatarContainer.hide();
				cell.dom[this.columnName].innerHTML = "-";
			}
		}
	}

	async setFormEvent(input) {
		let object = this;
		if (this.config.url) this.config.isFetch = true;
		if (input.autocompleteObject == null) {
			input.autocompleteObject = new Autocomplete();
			input.autocompleteObject.create(input.dom[this.columnName]);
			input.autocompleteObject.setConfig(this.config);
			input.autocompleteObject.parameter = this.parameter;
			input.autocompleteObject.limit = 10;
			input.autocompleteObject.autocomplete(this.config);
			input.autocompleteObject.data = this.config.url;
			input.autocompleteObject.callback = async function() {
				if (object.prerequisite != null) object.callPrerequisite(object, input);
			}
		}
		input.complete = async function(data, callback, dom = undefined) {
			input.autocompleteObject.setData(data, callback);
		}
	}

	setFormValue(inputForm, record){
		let object = this;
		if(record != undefined&& inputForm != undefined){
			let attribute = record[this.columnName];
			let input = inputForm.dom[this.columnName];
			let template = this.config.template;
			if(attribute != undefined && input != undefined){
				let url = `${inputForm.autocompleteObject.data}/by/reference`;
				if (attribute == -1) return;
				if (typeof attribute == 'object') {
					input.value = Mustache.render(inputForm.autocompleteObject.template, attribute);
					input.currentValue = attribute;
					if (object.prerequisite != null) object.callPrerequisite(object, inputForm);
				} else {
					POST(url, {'reference': attribute, 'template': template}, undefined, 'json', true).then(response => {
						if (response.isSuccess) {
							if(response.result.label) input.value = Mustache.render('{{{label}}}', response.result);
							else input.value = Mustache.render(template, response.result);
							input.currentValue = response.result;
							if (object.prerequisite != null) object.callPrerequisite(object, inputForm);
						}
					});
				}
				
			}
		}
	}

	setDetailValue(detail, record, reference) {
		let object = this;
		if(record != undefined){
			let attribute = record[this.columnName];
			let item = detail.dom[this.columnName];
			if(attribute == this.default){
				item.innerHTML = '-';
			}
			let template = this.config.template;
			if(attribute != undefined && item != undefined){
				let url = `${this.url}/by/reference`;
				if (attribute == -1) return;
				if (typeof attribute == 'object') {
					item.innerHTML = Mustache.render(this.config.template, attribute);
				} else {
					POST(url, {'reference': attribute, 'template': template}, undefined, 'json', true).then(response => {
						if (response.isSuccess) {
							if(response.label) item.innerHTML = Mustache.render('{{{label}}}', response);
							else item.innerHTML = Mustache.render('{{{label}}}', response.result);
						}
					});
				}
			}
		}
	}

	getFormValue(form, inputForm, data, file, message, key = null){
		let input = inputForm.dom[this.columnName];
		let currentValue = inputForm.autocompleteObject.tag != undefined ? input.currentValue: null;
		let result = currentValue != undefined ? currentValue.value != undefined ? currentValue.value: currentValue.id: null;
		if(key != null) result = currentValue != undefined ? currentValue.value != undefined ? currentValue.value: currentValue[key]: null;
		this.isPass = true;
		data[this.columnName] = result;
		if(this.isRequired && (result == null || result.length == 0)){
			input.classList.add('error');
			message.push(`Required field "${this.label}" is not set.`);
			if(result == null) result = inputForm.data.default;
			this.isPass = false;
			return false;
		}else{
			return true;
		}
	}

	async handlePrerequisite(input, dom, inputForm) {
		let key = this.config.prerequisiteParameterKey;
		if (this.config.prerequisiteParameterKey == null) key = input.columnName;
		let data = {};
		input.getFormValue(input.formView, dom, data);
		this.parameter[key] = data[input.columnName];
		inputForm.autocompleteObject.clear();
		if (data[input.columnName] == -1) this.disableEdit(inputForm);
		else this.enableEdit(inputForm);
	}

	async getOption(){
	}

	clearFormValue(inputForm) {
		let input = inputForm.dom[this.columnName];
		if(input != undefined){
			input.value = '';
			input.currentValue = {};
		}
	}
}