class PositionInput extends InputMetaData{
	/**
	 * 
	 * @param {InputConfig} config 
	 */
	static create(config) {
		let data = InputConfigCreator.createByConfig(config);
		data.typeName = "Position";
		return data;
	}

    getInputTemplate(){
		return TEMPLATE.input.PositionInput;
	}

    async renderForm(record){
		this.currentRecord = record;
		if (this.input == null){
			let parameter = {...this};
			this.input = new DOMObject(this.getInputTemplate(), parameter);
			this.setInputPerLine(this.input);
			this.setFormSideIcon(this.input, record);
			this.setFormEvent(this.input);
		}
		this.checkEditable(this.input);
		if (record == undefined || record == null || Object.keys(record).length == 0) {
			this.clearFormValue(this.input)
		} else if(record){
			this.setFormValue(this.input, record);
		}
		return this.input;
	}
}