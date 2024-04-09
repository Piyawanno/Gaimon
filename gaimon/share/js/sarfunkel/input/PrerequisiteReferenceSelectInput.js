class PrerequisiteReferenceSelectInput extends ReferenceSelectInput{
	/**
	 * @typedef {object} PrerequisiteReferenceSelectInputAdditionalConfig
	 * @property {string} prerequisite
	 * 
	 * @typedef {ReferenceSelectInputConfig & PrerequisiteReferenceSelectInputAdditionalConfig} PrerequisiteReferenceSelectInputConfig
	 * @param {PrerequisiteReferenceSelectInputConfig} config 
	 */
	static create(config) {
		let data = super.create(config);
		data.typeName = "PrerequisiteReferenceSelect";
		data.prerequisite = config.prerequisite != undefined ? config.prerequisite: "";
		return data;
	}

	async renderForm(record){
		this.currentRecord = record;
		if(this.input == null){
			let parameter = {...this};
			this.input = new InputDOMObject(TEMPLATE.input.PrerequisiteReferenceSelectInput, parameter);
			this.setFormSideIcon(this.input, record);
			this.setFormEvent(this.input);
			if (this.config.prerequisite) this.setPrerequisite(this, this.input);
		}
		this.checkEditable(this.input);
		if(record) {
			this.setFormValue(this.input, record);
		}else {
			this.disableEdit(this.input);
		}
		return this.input;
	}

	setFormValue(inputForm, record){
		let object = this;
		if(record != undefined){
			let attribute = record[this.columnName];
			let input = inputForm.dom[this.columnName];
			if(attribute != undefined && input != undefined){
				this.getPrerequisiteOption(attribute).then(isSuccess => {
					if (isSuccess) object.enableEdit(inputForm);
					else this.disableEdit(inputForm);
					object.setOption(inputForm.dom[object.columnName], object.option);
					if (object.prerequisite != null) object.callPrerequisite(object, inputForm);
				});
			}
		}
	}

	async handlePrerequisite(input, dom, inputForm) {
		let data = {};
		input.getFormValue(input.formView, dom, data);
		let isSuccess = await this.getPrerequisiteOption(data[input.columnName]);
		if (isSuccess) this.enableEdit(inputForm);
		else this.disableEdit(inputForm);
		this.setOption(this.input.dom[this.columnName], this.option);
	}

	async getPrerequisiteOption(value){
		let response = await GET(`${this.url}${value}`);
		if(!response.isSuccess){
			console.error(`Error by getting option ${this.columnName} ${this.url}.`);
			this.option = [];
			this.optionMap = {};
			return false;
		}
		this.option = response.result;
		this.optionMap = {};
		for(let option of this.option){
			this.optionMap[option.value] = option;
		}
		return true;
	}
}