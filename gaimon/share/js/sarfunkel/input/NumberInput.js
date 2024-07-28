class NumberInput extends InputMetaData{
	constructor(column, config){
		super(column, config);
		this.min = config.min;
		this.max = config.max;
		this.isZeroIncluded = config.isZeroIncluded;
		this.isFloatingPoint = config.isFloatingPoint;
	}

	/**
	 * @typedef {object} NumberInputAdditionalConfig
	 * @property {boolean} isNegative
	 * @property {boolean} isZeroIncluded
	 * @property {number} minValue
	 * @property {number} maxValue
	 * 
	 * @typedef {InputConfig & NumberInputAdditionalConfig} NumberInputConfig
	 * @param {NumberInputAdditionalConfig} config 
	 */
	static create(config) {
		let data = InputConfigCreator.createByConfig(config);
		data.typeName = "Number";
		return data;
	}

	async renderForm(record){
		if(this.input == null){
			let parameter = {...this};
			this.input = new InputDOMObject(TEMPLATE.input.NumberInput, parameter);
		}
		this.checkEditable(this.input);
		if(record) this.setFormValue(this.input, record);
		return this.input;
	}

	async renderDetail(record, reference){
		if(this.detail == null){
			let parameter = {...this};
			this.detail = new DOMObject(TEMPLATE.DetailInputView, parameter);
			this.setInputPerLine(this.detail, 2);
		}
		if(record) this.setDetailValue(this.detail, record, reference);
		return this.detail;
	}

	async renderTableFilter(record){
		if(this.filterInput == null){
			let parameter = {...this};
			parameter.isRequired = false;
			this.filterInput = new InputDOMObject(TEMPLATE.input.NumberInput, parameter);
			this.setInputPerLine(this.filterInput);
		}
		this.checkEditable(this.filterInput);
		if(record) this.setFormValue(this.filterInput, record);
		return this.filterInput;
	}

	async renderDialogForm(record){
		// let parameter = {...this};
		// let input = new InputDOMObject(TEMPLATE.input.NumberInput, parameter);
		// this.setInputPerLine(input);
		// this.checkEditable(input);
		// if(record) this.setFormValue(input, record);
		// return input;
		if(this.input == null){
			let parameter = {...this};
			this.input = new InputDOMObject(TEMPLATE.input.NumberInput, parameter);
		}
		this.checkEditable(this.input);
		if(record) this.setFormValue(this.input, record);
		return this.input;
	}

	async renderCell(record, reference) {
		let parameter = {...this};
		let cell = new DOMObject(TEMPLATE.TableCellView, parameter);
		if(record) this.setTableValue(cell, record, reference);
		return cell;
	}

	async renderCardRow(record, reference) {
		let parameter = {...this};
		let cell = new DOMObject(TEMPLATE.CardRow, parameter);
		if(record) this.setCardValue(cell, record, reference);
		return cell;
	}

	async renderFormCell(record){
		let parameter = {...this};
		let cell = new InputDOMObject(TEMPLATE.input.TableFormNumberInput, parameter);
		this.checkTableFormEditable(cell);
		if(record) this.setTableFormValue(cell, record);
		return cell;
	}
	
}