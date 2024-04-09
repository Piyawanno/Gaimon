class ColumnMetaData{
	constructor(config){
		this.config = config;
		this.name = config.columnName;
		this.order = new VersionParser(config.order);
		this.documentPath = config.documentPath;
		this.foreignColumn = config.foreignColumn;
		this.foreignModelName = config.foreignModelName;
		
		this.isForm = config.isForm;
		this.isSearch = config.isSearch;
		this.isTable = config.isTable;
		this.isTableForm = config.isTableForm;

		this.input = this.isForm ? this.createInput() : null;
	}

	createInput(){
		try{
			let input = eval(`new ${this.config.typeName}Input(this, this.config);`)
			return input;
		}catch(error){
			console.error(error);
			return new InputMetaData(this, this.config);
		}
	}

	fromJSON(data){
		return data;
	}

	toJSON(data){
		return data;
	}

	toDisplay(data){
		return data;
	}

	fromInput(data){
		return data;
	}

	toInput(data){
		return data;
	}

	inputToJSON(data){
		return data;
	}

	jsonToInput(data){
		return data;
	}
}