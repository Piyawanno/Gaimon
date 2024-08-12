class SelectInput extends InputMetaData{
	constructor(column, config){
		super(column, config);
		config.option = config.option != undefined ? config.option: [];
		this.option = [];
		for (let option of config.option) {
			if (option.value == undefined) {
				option = {value: option[0], label: option[1]};
			}
			this.option.push(option);
		}
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
		return TEMPLATE.input.TableFormSelectInput;
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
			this.setInputPerLine(this.detail, 2);
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
		// let parameter = {...this};
		// let input = new InputDOMObject(this.getInputTemplate(), parameter);
		// this.setDialogSideIcon(input, record);
		// this.setFormEvent(input);
		// this.checkEditable(input);
		// this.setOption(input.dom[this.columnName], this.option);
		// if(record) this.setFormValue(input, record);
		// return input;
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

	async renderCell(record, reference) {
		let cell;
		if (this.config.isStatusDisplay) {
			let parameter = {...this};
			cell = new DOMObject(await this.getStatusCellTemplate(), parameter);
			if(record) this.setTableValue(cell, record, reference);
		} else {
			let parameter = {...this};
			cell = new DOMObject(this.getCellTemplate(), parameter);
			if(record) this.setTableValue(cell, record, reference);
		}
		return cell;
	}

	async getStatusCellTemplate() {
		if (this.config.tableDisplayType == TABLE_DISPLAY_TYPE.LABEL) {
			return this.getCellTemplate();
		} else if (this.config.tableDisplayType == TABLE_DISPLAY_TYPE.CIRCLE_STATUS_COLOR) {
			return TEMPLATE.input.TableCellStatusCircle;
		} else if (this.config.tableDisplayType == TABLE_DISPLAY_TYPE.ICON || this.config.tableDisplayType == TABLE_DISPLAY_TYPE.ICON_COLOR) {
			return TEMPLATE.input.TableCellStatusIcon;
		} else if (this.config.tableDisplayType == TABLE_DISPLAY_TYPE.RECTANGLE_STATUS_COLOR) {
			return TEMPLATE.input.TableCellStatusRectangle;
		}
	}

	async renderCellTemp(record, reference) {
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

	async renderFormCell(record, reference, row) {
		let parameter = {...this};
		let cell = new InputDOMObject(this.getTableFormInputTemplate(), parameter);
		cell.row = row;
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
			if(result == null) result = inputForm.data.default;
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
		if(this.isRequired && (result == null || result == -1 || result == '')){
			formCell.classList.add('error');
			message.push(`Required field "${this.label}" is not selected.`);
			return false;
		}else{
			return true;
		}
	}

	setTableValue(cell, record, reference){
		function hover(option) {
			cell.dom.status.onmouseover = async function(e) {
				cell.dom.tooltip.classList.add("table-status-tooltip")
				cell.dom.tooltip.innerText = option.label;
				cell.dom.tooltip.style.left = e.clientX + "px";
			}
			
		}
		if(record != undefined){
			let attribute = record[this.columnName];
			let data = this.optionMap;
			if (data == undefined) return;
			let option = data[attribute];
			if (this.config.tableDisplayType == TABLE_DISPLAY_TYPE.CIRCLE_STATUS_COLOR || this.config.tableDisplayType == TABLE_DISPLAY_TYPE.RECTANGLE_STATUS_COLOR) {
				hover(option);
				if(!option) return;
				cell.dom.tooltip.innerHTML = option.label;
				cell.dom.status.style.backgroundColor = option.color;
			} else if (this.config.tableDisplayType == TABLE_DISPLAY_TYPE.ICON || this.config.tableDisplayType == TABLE_DISPLAY_TYPE.ICON_COLOR) {
				let template = eval(`ICON.${option.icon}`);
				cell.dom.icon.innerHTML = template;
				if (this.config.tableDisplayType == TABLE_DISPLAY_TYPE.ICON_COLOR) {
					cell.dom.icon.style.color = option.color;
				}
				hover(option);
			} else {
				let item = cell.dom[this.columnName];
				if (item != undefined) {
					let option = data[attribute];
					if(option) item.innerHTML = option.label;
				}
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

	async setFormCellSideIcon(inputForm, record) {
		this.createFormSideIcon();
		let sideIcons = [];
		if (this.formSideIconMap['add'] == undefined) {
			if (this.column.foreignModelName != null && this.column.foreignColumn != null) {
				let addIcon = new AddSideIcon('add', 'Add', '1.0', this, inputForm);
				sideIcons.push(addIcon);
			}
		}
		sideIcons.sort((a, b) => VersionParser.compare(a.order, b.order));
		let sideIconList = [];
		for(let icon of sideIcons){
			sideIconList.push(await icon.render(record));
		}
		for (let sideIcon of sideIconList) {
			inputForm.dom.sideIconContainer.appendChild(sideIcon.html);
		}
	}
}