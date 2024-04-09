class TagAutoCompleteInput extends AutoCompleteInput{
	constructor(column, config){
		super(column, config);
        this.isTagReferenced = true;
	}

	/**
	 * @param {AutoCompleteInputConfig} config 
	 */
	static create(config) {
		let data = super.create(config);
		data.typeName = "TagAutoComplete";
		return data;
	}

	async renderForm(record){
		if(this.input == null){
			let parameter = {...this};
			this.input = new DOMObject(TEMPLATE.input.TagAutoCompleteInput, parameter);
			this.setFormSideIcon(this.input, record);
			this.setFormEvent(this.input);
			if (this.config.prerequisite) this.setPrerequisite(this, this.input);
		} else {
			this.clearFormValue(this.input);
		}
		this.checkEditable(this.input);
		if(record) this.setFormValue(this.input, record);
		else if (this.config.prerequisite) this.disableEdit(this.input);
		return this.input;
	}

	async setFormEvent(input) {
		await super.setFormEvent(input);
		input.autocompleteObject.tagContainer = input.dom.tag;
		input.autocompleteObject.tagItemTemplate = TEMPLATE.AutocompleteTagItem;
	}

	async fetch(input, id) {
		let url = `${this.config.url}/by/reference`;
		POST(url, {reference:id}).then(response => {
			if (!response.isSuccess) return;
			let value = response.result;
			input.autocompleteObject.renderTag([], value, input.autocompleteObject.callback);
		});
	}

	setFormValue(inputForm, record){
		if(record != undefined){
			let attribute = record[this.columnName];
			let input = inputForm.dom[this.columnName];
			if(attribute != undefined && input != undefined){
				GET(`${this.config.childrenURL}/${record.id}`).then(response => {
					if (!response.isSuccess) return;
					let result = response.result;
					for (let value of result) {
						inputForm.autocompleteObject.renderTag([], value, inputForm.autocompleteObject.callback);
					}
				});
			}
		}
	}

    setTableValue(cell, record, reference){
		if(record != undefined){
            GET(`${this.config.childrenURL}/${record.id}`).then(response => {
                if (!response.isSuccess) return;
                let result = response.result;
                let item = cell.dom[this.columnName];
				let labelList = [];
				for (let value of result) {
					labelList.push(value.label)
				}
				item.innerHTML = labelList.join(", ");
            });
		}
	}

	setDetailValue(inputForm, record, reference){
		if(record != undefined){
            GET(`${this.config.childrenURL}/${record.id}`).then(response => {
                if (!response.isSuccess) return;
                let result = response.result;
                let item = inputForm.dom[this.columnName];
				let labelList = [];
				for (let value of result) {
					labelList.push(value.label)
				}
				item.innerHTML = labelList.join(", ");
            });
		}
	}

	getFormValue(form, inputForm, data, file, message){
		let input = inputForm.dom[this.columnName];
		let result = [];
		let childrenColumn = this.config.childrenColumn;
		for (let currentValue of inputForm.autocompleteObject.currentTagValues) {
			let value = currentValue != undefined ? currentValue.value != undefined ? currentValue.value: currentValue.id: null;
			let item = {};
			item[childrenColumn] = value;
			result.push(item);
		}
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

	clearFormValue(inputForm) {
		inputForm.autocompleteObject.clear();
	}
}