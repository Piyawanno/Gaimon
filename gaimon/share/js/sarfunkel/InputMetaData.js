class InputMetaData{
	constructor(column, config){
		this.column = column;
		this.config = config;
		this.label = config.label;
		this.columnName = config.columnName;
		this.group = config.group;
		this.default = config.default;
		this.inputPerLine = config.inputPerLine;
		this.isReferenced = false;
		
		this.help = config.help;
		this.isAdvanceForm = config.isAdvanceForm;
		this.isEditable = config.isEditable;
		this.isFile = config.isFile;
		this.isFloatingPoint = config.isFloatingPoint;
		this.isGroup = config.isGroup;
		this.isLink = config.isLink;
		this.isMobile = config.isMobile;
		this.isNegative = config.isNegative;
		this.isNumber = config.isNumber;
		this.isRequired = config.isRequired;
		this.isEnabled = true;
		this.isGrouped = false;

		this.order = column.order;
		this.message = null;

		this.input = null;
		this.cell = null;
		this.detail = null;
	}

	enable(){
		this.isEnabled = true;
		if(this.input != null) this.input.html.show();
		if(this.cell != null) this.cell.html.show();
	}

	disable(){
		this.isEnabled = false;
		if(this.input != null) this.input.html.hide();
		if(this.cell != null) this.cell.html.hide();
	}

	enableEdit(){
		this.isEditable = true;
		if(this.input != null) this.input.disabled = false;
	}

	disableEdit(){
		this.isEditable = false;
		if(this.input != null) this.input.disabled = true;
	}

	async renderForm(record){
		if(this.input == null){
			this.input = new DOMObject('', {});
		}
		return this.input;
	}

	async renderCell(record, reference){
		let cell = new DOMObject('', {});
		return cell;
	}

	async renderCard(record, reference){
		let card = new DOMObject('', {});
		return card;
	}

	async renderTableForm(record, reference){
		let input = new DOMObject('', {});
		return input;
	}

	async renderDetail(record, reference){
		if(this.detail == null){
			this.detail = new DOMObject('', {});
		}
		return this.detail;
	}

	getFormValue(form, data, message){
		let input = this.input.dom[this.columnName];
		let result = input != undefined? input.value: null;
		this.isPass = true;
		data[this.columnName] = result;
		if(this.isRequired && (result == null || result.length == 0)){
			input.classList.add('error');
			message.push(`Required field "${this.label}" is not set.`);
			this.isPass = false;
			return false;
		}else{
			return true;
		}
	}

	setFormValue(record){
		if(record != undefined){
			let attribute = record[this.columnName];
			let input = this.input.dom[this.columnName];
			if(attribute != undefined && input != undefined){
				input.value = attribute;
			}
		}
	}

	checkEditable(){
		let input = this.input.dom[this.columnName];
		if(input != undefined){
			input.disabled = !this.isEditable;
			if(this.isEnabled) input.show();
			else input.hide();
		}
	}

	setInputPerLine(){
		if(this.input != null){
			this.input.html.classList.add(`input_per_line_${this.inputPerLine}`);
		}
	}

	setOption(select, option){
		select.innerHTML = '';
		select.html(`<option value="-1">None</option>`);
		for(let data of option){
			select.append(`<option value="${data.value}">${data.label}</option>`);
		}
	}

	onRender(){
		let input = this.input.dom[this.columnName];
		if(input){
			input.value = '';
			this.message = '';
		}
		let error = this.input.dom[`${this.columnName}_error`];
		if(error){
			error.hide();
		}
	}
}