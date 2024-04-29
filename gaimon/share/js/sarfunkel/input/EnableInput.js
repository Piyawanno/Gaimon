class EnableInput extends CheckBoxInput{
	constructor(column, config){
		super(column, config);
		this.option = [{value: 1, label: config.label}];
		this.optionMap = {
			0: {value:0, label: "Disable"}, 
			1: {value:1, label: "Enable"}
		};
	}

	/**
	 * @param {CheckBoxInputConfig} config 
	 */
	static create(config) {
		let data = super.create(config);
		data.typeName = "Enable";
		return data;
	}

	setFormValue(inputForm, record){
		if(record != undefined && Object.keys(record).length > 0){
			let attribute = record[this.columnName];
			let input = inputForm.dom[`${this.columnName}_1`];
			if(attribute != undefined && input != undefined){
				if (attribute == 1) input.checked = true;
				else input.checked = false;
			}
		}
	}

	setTableValue(cell, record, reference){
		if(record != undefined){
			let attribute = record[this.columnName];
			let item = cell.dom[this.columnName];
			if(attribute != undefined && item != undefined){
				item.html(this.optionMap[attribute].label);
			} else {
				item.html(this.optionMap[0].label);
			}
		}
	}

	clearFormValue(inputForm) {
		let input = inputForm.dom[`${this.columnName}_1`];
		input.checked = false;
	}
}