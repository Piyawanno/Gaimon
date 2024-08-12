class TimeSpanInput extends NumberInput{

	constructor(column, config){
		super(column, config);
		this.formatter = new Intl.RelativeTimeFormat(LANGUAGE, { style: 'short' });
	}
    /**
	 * 
	 * @param {InputConfig} config 
	 */
	static create(config) {
		let data = super.create(config);
		data.typeName = "TimeSpan";
		return data;
	}

	async renderForm(record){
		if(this.input == null){
			let parameter = {...this};
			this.input = new InputDOMObject(TEMPLATE.input.FormTimeSpanInput, parameter);
		}
		this.checkEditable(this.input);
		this.setInputEvent(this.input);
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
			this.input = new InputDOMObject(TEMPLATE.input.FormTimeSpanInput, parameter);
		}
		this.checkEditable(this.input);
		this.setInputEvent(this.input);
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

	async renderFormCell(record, reference, row){
		let parameter = {...this};
		let cell = new InputDOMObject(TEMPLATE.input.TableFormTimeSpanInput, parameter);
		cell.row = row;
		this.checkTableFormEditable(cell);
		this.setInputEvent(cell);
		if(record) this.setTableFormValue(cell, record);
		return cell;
	}

	setFormValue(inputForm, record){
		if(record != undefined){
			let attribute = record[this.columnName];
			if(attribute != undefined && inputForm != undefined){
				let value = this.convertToInput(attribute);
				inputForm.dom.hour.value = value.hour;
				inputForm.dom.minute.value = value.minute;
				inputForm.dom.second.value = value.second;
			}
		}
	}

	setTableValue(cell, record, reference){
		if(record != undefined){
			let attribute = record[this.columnName];
			let item = cell.dom[this.columnName];
			if(attribute != undefined && item != undefined){
				item.innerHTML = this.convertToDisplay(attribute);
			}
		}
	}

	setTableFormValue(cell, record){
		console.log(record);
		if(record != undefined){
			let attribute = record[this.columnName];
			if(attribute != undefined && cell != undefined){
				let value = this.convertToInput(attribute);
				cell.dom.hour.value = value.hour;
				cell.dom.minute.value = value.minute;
				cell.dom.second.value = value.second;
			}
		}
	}

	setInputEvent(input) {
		if (input.dom.minute) {
			input.dom.minute.onkeyup = function() {
				if (parseInt(this.value) > 59) this.value = 59;
				else if (parseInt(this.value) < 0) this.value = 0;
			}
		}
		if (input.dom.second) {
			input.dom.second.onkeyup = function() {
				if (parseInt(this.value) > 59) this.value = 59;
				else if (parseInt(this.value) < 0) this.value = 0;
			}
		}
	}

	getFormValue(form, inputForm, data, file, message, isShowError){
		data[this.columnName] = this.convertToValue(inputForm);
		return true;
	}

	convertToInput(data) {
		let hour = parseInt(data / (60 * 60));
		let minute = parseInt(data / (60)) % 60;
		let second = data % 60;
		return {hour, minute, second};
	}

	convertToDisplay(data) {
		let result = [];
		let value = this.convertToInput(data);
		let hours = this.formatter.formatToParts(value.hour, 'hour');
		if (hours[1].value != "0") {
			result.push(hours[1].value + hours[2].value);
		}

		let minutes = this.formatter.formatToParts(value.minute, 'minute');
		if (minutes[1].value != "0") {
			result.push(minutes[1].value + minutes[2].value);
		}

		let seconds = this.formatter.formatToParts(value.second, 'second');
		if (seconds[1].value != "0") {
			result.push(seconds[1].value + seconds[2].value);
		}
		return result.join(" ");
	}

	convertToValue(input) {
		let hour = input.dom.hour.value.length > 0 ? parseInt(input.dom.hour.value) : 0;
		let minute = input.dom.minute.value.length > 0 ? parseInt(input.dom.minute.value) : 0;
		let second = input.dom.second.value.length > 0 ? parseInt(input.dom.second.value) : 0;
		return (hour * 60 * 60) + (minute * 60) + second;
	}
}