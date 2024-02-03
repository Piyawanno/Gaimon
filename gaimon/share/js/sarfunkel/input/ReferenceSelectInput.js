class ReferenceSelectInput extends InputMetaData{
	constructor(column, config){
		super(column, config);
		this.url = config.url;
		this.tableURL = config.tableURL;
		this.isReferenced = true;
	}

	async renderForm(record){
		if(this.input == null){
			let parameter = {...this};
			this.input = new DOMObject(TEMPLATE.input.SelectInput, parameter);
		}
		this.checkEditable();
		await this.getOption();
		if(record) this.setFormValue(record);
		return this.input;
	}

	async renderCell(record, reference){

	}

	async getOption(){
		let response = await GET(this.url);
		if(!response.isSuccess){
			console.error(`Error by getting option ${this.columnName} ${this.url}.`);
		}
		let select = this.input.dom[this.columnName];
		this.option = response.result;
		console.log(this.option);
		this.optionMap = {};
		for(let option of this.option){
			this.optionMap[option.value] = option;
		}
		if(select) this.setOption(select, this.option);
	}

	getFormValue(form, data, message){
		let input = this.input.dom[this.columnName];
		let result = input != undefined? input.value: null;
		data[this.columnName] = result;
		if(this.isRequired && (result == null || result == -1)){
			input.classList.add('error');
			message.push(`Required field "${this.label}" is not selected.`);
			return false;
		}else{
			return true;
		}
	}
}