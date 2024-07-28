class VersionInput extends TextInput{
    /**
	 * 
	 * @param {InputConfig} config 
	 */
	static create(config) {
		let data = super.create(config);
		data.typeName = "Version";
		return data;
	}

	getInputTemplate(){
		return TEMPLATE.input.VersionInput;
	}

	getDetailTemplate(){
		return TEMPLATE.DetailInputView;
	}

	getTableFilterTemplate(){
		return TEMPLATE.input.TextInput;
	}

	getCellTemplate(){
		return TEMPLATE.TableCellView;
	}

	getCardRowTemplate(){
		return TEMPLATE.CardRow;
	}

	getTableFormInputTemplate(){
		return TEMPLATE.input.TableFormTextInput;
	}
}