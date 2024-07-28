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

	// getInputTemplate(){
	// 	return TEMPLATE.input.EnableInput;
	// }

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
				if(typeof(attribute) == 'String' && attribute == 'False') attribute = 0;
				else attribute = 1;
				item.html(this.optionMap[attribute].label);
			} else {
				item.html(this.optionMap[0].label);
			}
		}
	}

	setDetailValue(detail, record, reference) {
		if(record != undefined){
			let attribute = record[this.columnName];
			let item = detail.dom[this.columnName];
			if(attribute != undefined && item != undefined){
				if (attribute.length == 0) attribute = '-';
				item.innerHTML = this.optionMap[attribute].label;
			} else {
				item.innerHTML = 'Disable';
			}
		}
	}

	clearFormValue(inputForm) {
		let input = inputForm.dom[`${this.columnName}_1`];
		input.checked = false;
	}

	getFormValue(form, inputForm, data, file, message){
		let input = inputForm.dom[`${this.columnName}_1`];
		let result = input != undefined? input.checked: null;
		data[this.columnName] = result;
		if(this.isRequired && (result == null || result == -1 || result == '')){
			input.classList.add('error');
			message.push(`Required field "${this.label}" is not selected.`);
			if(result == null) result = inputForm.data.default;
			return false;
		}else{
			input?.classList.remove('error');
			return true;
		}
	}
}