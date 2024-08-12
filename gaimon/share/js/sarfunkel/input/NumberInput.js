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

	getInputTemplate(){
		return TEMPLATE.input.NumberInput;
	}

	getDetailTemplate(){
		return TEMPLATE.DetailInputView;
	}

	getTableFilterTemplate(){
		return TEMPLATE.input.NumberInput;
	}

	getCellTemplate(){
		return TEMPLATE.TableCellView;
	}

	getCardRowTemplate(){
		return TEMPLATE.CardRow;
	}

	getTableFormInputTemplate(){
		return TEMPLATE.input.TableFormNumberInput;
	}

	async renderForm(record){
		if(this.input == null){
			let parameter = {...this};
			this.input = new InputDOMObject(this.getInputTemplate(), parameter);
			this.setFormEvent(this.input);
		}
		this.checkEditable(this.input);
		if(record) this.setFormValue(this.input, record);
		return this.input;
	}

	async renderDetail(record, reference){
		if(this.detail == null){
			let parameter = {...this};
			this.detail = new DOMObject(this.getDetailTemplate(), parameter);
			this.setInputPerLine(this.detail, 2);
		}
		if(record) this.setDetailValue(this.detail, record, reference);
		return this.detail;
	}

	async renderTableFilter(record){
		if(this.filterInput == null){
			let parameter = {...this};
			parameter.isRequired = false;
			this.filterInput = new InputDOMObject(this.getTableFilterTemplate(), parameter);
			this.setInputPerLine(this.filterInput);
			this.setFormEvent(this.input);
		}
		this.checkEditable(this.filterInput);
		if(record) this.setFormValue(this.filterInput, record);
		return this.filterInput;
	}

	async renderDialogForm(record){
		if(this.input == null){
			let parameter = {...this};
			this.input = new InputDOMObject(this.getInputTemplate(), parameter);
		}
		this.checkEditable(this.input);
		if(record) this.setFormValue(this.input, record);
		return this.input;
	}

	async renderCell(record, reference) {
		let parameter = {...this};
		let cell = new DOMObject(this.getCellTemplate(), parameter);
		if(record) this.setTableValue(cell, record, reference);
		return cell;
	}

	async renderCardRow(record, reference) {
		let parameter = {...this};
		let cell = new DOMObject(this.getCardRowTemplate(), parameter);
		if(record) this.setCardValue(cell, record, reference);
		return cell;
	}

	async renderFormCell(record, reference, row){
		let parameter = {...this};
		let cell = new InputDOMObject(this.getTableFormInputTemplate(), parameter);
		cell.row = row;
		this.checkTableFormEditable(cell);
		this.setTableFormEvent(cell);
		if(record) this.setTableFormValue(cell, record);
		return cell;
	}

	setFormEvent(input) {
		this.setFocusEvent(input);
	}

	setTableFormEvent(input) {
		this.setFocusEvent(input);
	}

	setFormEvent(input) {
		this.setFocusEvent(input);
	}

	setFocusEvent(input) {
		input.dom[this.column.name].onfocus = async () => {
			let tag = input.dom[this.column.name];
			if (tag.value == 0) tag.value = "";
		}

		input.dom[this.column.name].onblur = async () => {
			let tag = input.dom[this.column.name];
			if (tag.value == "") tag.value = 0;
		}
	}
	
}