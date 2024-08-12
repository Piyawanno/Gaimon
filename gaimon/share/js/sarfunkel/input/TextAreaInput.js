class TextAreaInput extends TextInput{
	getInputTemplate(){
		return TEMPLATE.input.TextAreaInput;
	}

	getDetailTemplate(){
		return TEMPLATE.DetailInputView;
	}

	// Not Tested
	getTableFilterTemplate(){
		return TEMPLATE.input.TextAreaInput;
	}

	getCellTemplate(){
		return TEMPLATE.TableCellView;
	}

	getCardRowTemplate(){
		return TEMPLATE.CardRow;
	}

	// Not Tested
	getTableFormInputTemplate(){
		return TEMPLATE.input.TableFormTextAreaInput;
	}

	/**
	 * 
	 * @param {InputConfig} config 
	 */
	static create(config) {
		let data = super.create(config);
		data.typeName = "TextArea";
		return data;
	}
}