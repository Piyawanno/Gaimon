class DateTimeInput extends TextInput{
	/**
	 * @param {TextInputConfig} config 
	 */
	static create(config) {
		let data = super.create(config);
		data.typeName = "DateTime";
		return data;
	}
	
	getInputTemplate(){
		return TEMPLATE.input.DateTimeInput;
	}

	getDetailTemplate(){
		return TEMPLATE.DetailInputView;
	}

	getTableFilterTemplate(){
		return TEMPLATE.input.ateTimeInput;
	}

	getCellTemplate(){
		return TEMPLATE.TableCellView;
	}

	getCardRowTemplate(){
		return TEMPLATE.CardRow;
	}

	// Not Tested
	getTableFormInputTemplate(){
		return TEMPLATE.input.TableFormDateTimeInput;
	}
}