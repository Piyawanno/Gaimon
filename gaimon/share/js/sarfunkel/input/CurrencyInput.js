class CurrencyInput extends NumberInput{
	constructor(column, config){
		super(column, config);
		this.min = config.min;
		this.max = config.max;
		this.isZeroIncluded = config.isZeroIncluded;
		if (config.isFloatingPoint == undefined){
			this.isFloatingPoint = true;
		}else{
			this.isFloatingPoint = config.isFloatingPoint;
		}
		this.isShowCurrency = false;
	}
	/**
	 * @param {NumberInputConfig} config 
	 */
	static create(config) {
		let data = super.create(config);
		data.typeName = "Currency";
		return data;
	}


	getInputTemplate(){
		return TEMPLATE.input.CurrencyViewInput;
	}

	getDetailTemplate(){
		return TEMPLATE.DetailInputView;
	}

	getTableFilterTemplate(){
		return TEMPLATE.input.CurrencyViewInput;
	}

	getCardRowTemplate(){
		return TEMPLATE.CardRow;
	}

	getTableFormInputTemplate(){
		return TEMPLATE.input.TableFormCurrencyInput;
	}

	setFormValue(inputForm, record){
		if(record != undefined){
			let attribute = record[this.columnName];
			let input = inputForm == undefined ? undefined : inputForm.dom[this.columnName];
			if(attribute != undefined && input != undefined) {
				inputForm.dom.currency.value = attribute.originCurrency;
				input.value = Fraction(attribute.origin[0], attribute.origin[1]).toString();
			}
		}
	}

	setDetailValue(cell, record, reference){
		super.setDetailValue(cell, record, reference);
	}

	setTableFormValue(cell, record){
		if(record != undefined){
			let attribute = record[this.columnName];
			let formCell = cell.dom[this.columnName];
			if(attribute != undefined && formCell != undefined) {
				cell.dom.currency.value = attribute.originCurrency;
				formCell.value = Fraction(attribute.origin[0], attribute.origin[1]).toString();
			}
		}
	}

	getFormValue(form, inputForm, data, file, message, isShowError){
		let input = inputForm.dom[this.columnName];
		let result = input != undefined? (new CurrencyData(input.value, inputForm.dom.currency.value)).toJSON(): null;
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

	getTableFormValue(form, cell, data, message){
		let formCell = cell.dom[this.columnName];
		let result = formCell != undefined? (new CurrencyData(formCell.value, cell.dom.currency.value)).toJSON(): null;
		data[this.columnName] = result;
		if(this.isRequired && (result == null || result == -1)){
			formCell.classList.add('error');
			message.push(`Required field "${this.label}" is not selected.`);
			return false;
		}else{
			return true;
		}
	}
}