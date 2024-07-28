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

	async renderFormCell(record, reference) {
		this.currentRecord = record;
		let parameter = {...this};
		let cell = new InputDOMObject(TEMPLATE.input.TableFormSelectInput, parameter);
		if (this.config.prerequisite) this.setPrerequisite(this, cell);
		this.checkTableFormEditable(cell);
		// await this.getOption();
		this.setOption(cell.dom[this.columnName], this.option);
		if(record) this.setTableFormValue(cell, record);
		return cell;
	}

	setFormValue(inputForm, record){
		let object = this;
		if(record != undefined){
			let prerequisite = record[this.config.prerequisiteColumn];
			let attribute = record[this.columnName];
			let input = inputForm.dom[this.columnName];
			if(attribute != undefined && input != undefined){
				this.getPrerequisiteOption(prerequisite).then(isSuccess => {
					if (isSuccess) object.enableEdit(inputForm);
					else this.disableEdit(inputForm);
					object.setOption(inputForm.dom[object.columnName], object.option);
					if (object.prerequisite != null) object.callPrerequisite(object, inputForm);
					if (object.optionMap[object.currentRecord[object.columnName]]) {
						let value = object.optionMap[object.currentRecord[object.columnName]].value;
						input.value = value;
					}
				});
			}
		}
	}

	setDetailValue(detail, record, reference) {
		let object = this;
		if(record != undefined){
			let prerequisite = record[this.config.prerequisiteColumn];
			let attribute = record[this.columnName];
			let input = detail.dom[this.columnName];
			if(attribute != undefined && input != undefined){
				this.getPrerequisiteOption(prerequisite).then(isSuccess => {
					if (isSuccess) object.enableEdit(detail);
					else this.disableEdit(detail);
					if (object.optionMap[record[object.columnName]] == undefined) return;
					let label = object.optionMap[record[object.columnName]].label;
					input.innerHTML = label;
				});
			}
		}
	}

	setTableValue(cell, record){
		let object = this;
		if(record != undefined){
			let prerequisite = record[this.config.prerequisiteColumn];
			let attribute = record[this.columnName];
			let input = cell.dom[this.columnName];
			if(attribute != undefined && input != undefined){
				this.getPrerequisiteOption(prerequisite).then(isSuccess => {
					if (isSuccess) object.enableEdit(cell);
					else this.disableEdit(cell);
					if (object.optionMap[attribute] == undefined) return;
					input.innerHTML = object.optionMap[attribute].label;
					if (object.optionMap[attribute]?.avatar?.url) {
						cell.dom.avatar.onerror = function() {
							this.src = object.optionMap[attribute]?.avatar?.default;
						}
						cell.dom.avatar.src = object.optionMap[attribute]?.avatar?.url;
					} else {
						if (object.optionMap[attribute]?.avatar?.default) {
							cell.dom.avatar.src = object.optionMap[attribute]?.avatar?.default;
						} else {
							cell.dom.avatar.src = `${rootURL}share/icon/logo_padding.png`;
							cell.dom.avatarContainer.hide();
						}
						
					}
				});
				
			}
		}
	}

	async handlePrerequisite(input, dom, inputForm) {
		let data = {};
		input.getFormValue(input.formView, dom, data, new FormData(), []);
		let isSuccess = await this.getPrerequisiteOption(data[input.columnName]);
		if (isSuccess) this.enableEdit(inputForm);
		else this.disableEdit(inputForm);
		this.setOption(inputForm.dom[this.columnName], this.option);
		if (this.currentRecord) {
			if (this.optionMap[this.currentRecord[this.columnName]]) {
				let value = this.optionMap[this.currentRecord[this.columnName]].value;
				inputForm.dom[this.columnName].value = value;
			}
		}
	}

	async getPrerequisiteOption(value){
		if (value == undefined) return false;
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