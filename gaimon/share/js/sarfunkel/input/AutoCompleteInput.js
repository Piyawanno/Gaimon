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
		if(record) this.setFormValue(this.input, record);
		else if (this.config.prerequisite) {
			this.disableEdit(this.input);
		}
		return this.input;
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

	async renderFormCell(record, reference) {
		let parameter = {...this};
		let cell = new InputDOMObject(TEMPLATE.input.TableFormAutoCompleteInput, parameter);
		this.setFormSideIcon(cell, record);
		this.checkTableFormEditable(cell);
		this.setFormEvent(cell);
		// await this.getOption();
		// this.setOption(cell.dom[this.columnName], this.option);
		if(record) this.setFormValue(cell, record);
		return cell;
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
		}
		input.complete = async function(data, callback, dom = undefined) {
			input.autocompleteObject.setData(data, callback);
		}
	}

	setFormValue(inputForm, record){
		let object = this;
		if(record != undefined){
			let attribute = record[this.columnName];
			let input = inputForm.dom[this.columnName];
			if(attribute != undefined && input != undefined){
				let url = `${inputForm.autocompleteObject.data}/by/reference`;
				if (typeof attribute == 'object') {
					input.value = Mustache.render(inputForm.autocompleteObject.template, attribute);
					input.currentValue = attribute;
					if (object.prerequisite != null) object.callPrerequisite(object, inputForm);
				} else {
					POST(url, {'reference': attribute}, undefined, 'json', true).then(response => {
						if (response.isSuccess) {
							input.value = Mustache.render(inputForm.autocompleteObject.template, response.result);
							input.currentValue = response.result;
							if (object.prerequisite != null) object.callPrerequisite(object, inputForm);
						}
					});
				}
				
			}
		}
	}

	getFormValue(form, inputForm, data, file, message){
		let input = inputForm.dom[this.columnName];
		let currentValue = inputForm.autocompleteObject.tag != undefined ? input.currentValue: null;
		let result = currentValue != undefined ? currentValue.value != undefined ? currentValue.value: currentValue.id: null;
		this.isPass = true;
		data[this.columnName] = result;
		if(this.isRequired && (result == null || result.length == 0)){
			input.classList.add('error');
			message.push(`Required field "${this.label}" is not set.`);
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
}