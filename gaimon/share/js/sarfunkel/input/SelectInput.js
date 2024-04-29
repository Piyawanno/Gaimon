class SelectInput extends InputMetaData{
	constructor(column, config){
		super(column, config);
		this.option = config.option;
		this.optionMap = {};
		if (this.option != undefined) {
			for(let option of this.option){
				this.optionMap[option.value] = option;
			}
		}
	}

	/**
	 * @typedef {object} SelectInputAdditionalConfig
	 * @property {Array} option
	 * @property {boolean} isStatusDisplay
	 * 
	 * @typedef {InputConfig & SelectInputAdditionalConfig} SelectInputConfig
	 * @param {SelectInputConfig} config 
	 */
	static create(config) {
		let data = InputConfigCreator.createByConfig(config);
		data.typeName = "Select";
		data.option = config.option != undefined ? config.option: [];
		data.isStatusDisplay = config.isStatusDisplay != undefined ? config.isStatusDisplay: false;
		return data;
	}

	getInputTemplate(){
		return TEMPLATE.input.SelectInput;
	}

	getDetailTemplate(){
		return TEMPLATE.DetailInputView;
	}

	getTableFilterTemplate(){
		return TEMPLATE.input.SelectInput;
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

	async renderForm(record){
		if(this.input == null){
			let parameter = {...this};
			this.input = new InputDOMObject(this.getInputTemplate(), parameter);
			this.setFormSideIcon(this.input, record);
			this.setFormEvent(this.input);
		}
		this.checkEditable(this.input);
		this.setOption(this.input.dom[this.columnName], this.option);
		if(record) this.setFormValue(this.input, record);
		return this.input;
	}

	async renderDetail(record, reference){
		if(this.detail == null){
			let parameter = {...this};
			this.detail = new DOMObject(this.getDetailTemplate(), parameter);
			this.setInputPerLine(this.detail, 1);
		}
		if(record) this.setDetailValue(this.detail, record, reference);
		return this.detail;
	}

	async renderTableFilter(record){
		if(this.filterInput == null){
			let parameter = {...this};
			parameter.isRequired = false;
			this.filterInput = new InputDOMObject(this.getInputTemplate(), parameter);
			this.setInputPerLine(this.filterInput);
		}
		this.checkEditable(this.filterInput);
		this.setOption(this.filterInput.dom[this.columnName], this.option);
		if(record) this.setFormValue(this.filterInput, record);
		return this.filterInput;
	}

	async renderDialogForm(record){
		let parameter = {...this};
		let input = new InputDOMObject(this.getInputTemplate(), parameter);
		this.setDialogSideIcon(input, record);
		this.setFormEvent(input);
		this.checkEditable(input);
		this.setOption(input.dom[this.columnName], this.option);
		if(record) this.setFormValue(input, record);
		return input;
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

	async renderFormCell(record, reference) {
		let parameter = {...this};
		let cell = new InputDOMObject(this.getTableFormInputTemplate(), parameter);
		this.checkTableFormEditable(cell);
		this.setOption(cell.dom[this.columnName], this.option);
		if(record) this.setTableFormValue(cell, record);
		return cell;
	}

	getFormValue(form, inputForm, data, file, message){
		let input = inputForm.dom[this.columnName];
		let result = input != undefined? input.value: null;
		data[this.columnName] = result;
		if(this.isRequired && (result == null || result == -1 || result == '')){
			input.classList.add('error');
			message.push(`Required field "${this.label}" is not selected.`);
			return false;
		}else{
			input?.classList.remove('error');
			return true;
		}
	}

	getTableFormValue(form, cell, data, message){
		let formCell = cell.dom[this.columnName];
		let result = formCell != undefined? formCell.value: null;
		data[this.columnName] = result;
		if(this.isRequired && (result == null || result == -1)){
			formCell.classList.add('error');
			message.push(`Required field "${this.label}" is not selected.`);
			return false;
		}else{
			return true;
		}
	}

	setTableValue(cell, record, reference){
		if(record != undefined){
			let attribute = record[this.columnName];
			let item = cell.dom[this.columnName];
			let data = this.optionMap;
			if (data != undefined && item != undefined) {
				let option = data[attribute];
				if(option) item.innerHTML = option.label;
			}
		}
	}

	setDetailValue(cell, record, reference){
		if(record != undefined){
			let attribute = record[this.columnName];
			let item = cell.dom[this.columnName];
			let data = this.optionMap;
			if (data != undefined && item != undefined) {
				let option = data[attribute];
				if(option) item.innerHTML = option.label;
			}
		}
	}

	setCardValue(cell, record, reference){
		if(record != undefined){
			let attribute = record[this.columnName];
			let item = cell.dom[this.columnName];
			let data = this.optionMap;
			if (data != undefined && item != undefined) {
				let option = data[attribute];
				if(option) item.innerHTML = option.label;
			}
		}
	}

	setFormEvent(input) {
		let object = this;
		if (input.dom[`${this.columnName}_icon`]) {
				input.dom[`${this.columnName}_icon`].onclick = async function() {
				// main.pageModelDict[object.column.foreignModelName].renderView(object.column.foreignModelName, {}, 'Dialog');
				console.log(object.column);
			}
		}
	}

	async setFormSideIcon(inputForm, record) {
		this.createFormSideIcon();
		if (this.formSideIconMap['add'] == undefined) {
			if (this.column.foreignModelName != null && this.column.foreignColumn != null) {
				this.addIcon = new AddSideIcon('add', 'Add', '1.0', this, inputForm);
				this.appendFormSideIcon(this.addIcon);
			}
		}
		let sideIconList = await this.renderFormSideIcon(record);
		for (let sideIcon of sideIconList) {
			inputForm.dom.sideIconContainer.appendChild(sideIcon.html);
		}
	}
}