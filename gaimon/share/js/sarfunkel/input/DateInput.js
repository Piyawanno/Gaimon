class DateInput extends TextInput{
	/**
	 * @param {TextInputConfig} config 
	 */
	static create(config) {
		let data = super.create(config);
		data.typeName = "Date";
		return data;
	}

	getInputTemplate(){
		return TEMPLATE.input.DateInput;
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
		return TEMPLATE.input.TableFormDateInput;
	}
}