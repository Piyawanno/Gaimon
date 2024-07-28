class TextInput extends InputMetaData{
	getInputTemplate(){
		return TEMPLATE.input.TextInput;
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

	/**
	 * 
	 * @param {InputConfig} config 
	 */
	static create(config) {
		let data = InputConfigCreator.createByConfig(config);
		data.typeName = "Text";
		return data;
	}

	async renderForm(record){
		this.currentRecord = record;
		if (this.input == null){
			let parameter = {...this};
			/// Do we need InputDOMObject?
			this.input = new InputDOMObject(this.getInputTemplate(), parameter);
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

	async renderDetail(record, reference){
		if(this.detail == null){
			let parameter = {...this};
			this.detail = new DOMObject(this.getDetailTemplate(), parameter);
			this.setInputPerLine(this.detail, 2);
		}
		if(record){
			this.setDetailValue(this.detail, record, reference);
		}
		return this.detail;
	}

	async renderTableFilter(record){
		if(this.filterInput == null){
			let parameter = {...this};
			parameter.isRequired = false;
			this.filterInput = new InputDOMObject(this.getTableFilterTemplate(), parameter);
			this.setInputPerLine(this.filterInput);
		}
		this.checkEditable(this.filterInput);
		if(record){
			this.setFormValue(this.filterInput, record);
		}
		return this.filterInput;
	}

	async renderDialogForm(record){
		// let parameter = {...this};
		// let input = new InputDOMObject(this.getInputTemplate(), parameter);
		// this.setInputPerLine(input);
		// this.checkEditable(input);
		// if(record){
		// 	this.setFormValue(input, record);
		// }
		// return this.input;
		this.currentRecord = record;
		if (this.input == null){
			let parameter = {...this};
			/// Do we need InputDOMObject?
			this.input = new InputDOMObject(this.getInputTemplate(), parameter);
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

	async renderCell(record, reference) {
		let parameter = {...this};
		let cell = new DOMObject(this.getCellTemplate(), parameter);
		if(record){
			this.setTableValue(cell, record, reference);
		}
		return cell;
	}

	async renderCardRow(record, reference) {
		let parameter = {...this};
		let cell = new DOMObject(this.getCardRowTemplate(), parameter);
		if(record){
			this.setCardValue(cell, record, reference);
		}
		return cell;
	}

	async renderFormCell(record){
		let parameter = {...this};
		let formCell = new InputDOMObject(this.getTableFormInputTemplate(), parameter);
		this.checkTableFormEditable(formCell);
		this.setTableFormEvent(formCell);
		if(record){
			this.setTableFormValue(formCell, record);
		}
		return formCell;
	}
}