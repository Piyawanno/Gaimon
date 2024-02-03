class ColumnMetaData{
	static inputMap = {
		Number: NumberInput,
		Text: TextInput,
		ReferenceSelect: ReferenceSelectInput,
	}

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
		let InputClass = ColumnMetaData.inputMap[this.config.typeName];
		if(InputClass == undefined) InputClass = InputMetaData;
		return new InputClass(this, this.config);
	}
}