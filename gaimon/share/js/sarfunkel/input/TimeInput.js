class TimeInput extends TextInput{
    /**
	 * 
	 * @param {InputConfig} config 
	 */
	static create(config) {
		let data = super.create(config);
		data.typeName = "Time";
		return data;
	}

	getInputTemplate(){
		return TEMPLATE.input.TimeInput;
	}

	getDetailTemplate(){
		return TEMPLATE.DetailInputView;
	}

	getTableFilterTemplate(){
		return TEMPLATE.input.DateInput;
	}

	getCellTemplate(){
		return TEMPLATE.TableCellView;
	}

	getCardRowTemplate(){
		return TEMPLATE.CardRow;
	}

	// Not Tested
	getTableFormInputTemplate(){
		return TEMPLATE.input.TableFormTimeInput;
	}

	getFormValue(form, inputForm, data, file, message, isShowError){
		let input = inputForm.dom[this.columnName];
		let result = input != undefined? input.value: null;
		if (result != null) {
			let splitted = result.split(":");
			result = (splitted[0] * 60 * 60) + (splitted[1] * 60)
		}
		data[this.columnName] = result;
		if(this.isRequired && (result == null || result == -1 || result == '')){
			if (isShowError) {
				input.classList.add('error');
				message.push(`Required field "${this.label}" is not selected.`);
			}
			return false;
		}else{
			input.classList.remove('error');
			return true;
		}
	}
}