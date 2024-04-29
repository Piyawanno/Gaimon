class CheckBoxInput extends SelectInput{
	/**
	 * @param {SelectInputConfig} config 
	 */
	static create(config) {
		let data = super.create(config);
		data.typeName = "CheckBox";
		return data;
	}

	getInputTemplate(){
		return TEMPLATE.input.CheckBoxInput;
	}

    async renderForm(record){
		if(this.input == null){
			let parameter = {...this};
			this.input = new InputDOMObject(this.getInputTemplate(), parameter);
			this.setFormSideIcon(this.input, record);
			this.setFormEvent(this.input);
		}
		this.checkEditable(this.input);
		this.setOption(this.input, this.option);
		if (record == undefined || record == null || Object.keys(record).length == 0) {
			this.clearFormValue(this.input)
		} else if(record){
			this.setFormValue(this.input, record);
		}
		return this.input;
	}

	async renderDialogForm(record){
		let parameter = {...this};
		let input = new InputDOMObject(this.getInputTemplate(), parameter);
		this.setFormSideIcon(input, record);
		this.setFormEvent(input);
		this.checkEditable(input);
		this.setOption(input, this.option);
		if (record == undefined || record == null || Object.keys(record).length == 0) {
			this.clearFormValue(input)
		} else if(record){
			this.setFormValue(input, record);
		}
        
		return input;
	}

    setOption(input, option) {
    }

    setTableValue(cell, record, reference){
		if(record != undefined){
			let attribute = record[this.columnName];
			let item = cell.dom[this.columnName];
			let data = this.optionMap;
			if (data != undefined && item != undefined) {
				let option = data[attribute];
				if(option) item.html(option.label);
			}
		}
	}
}