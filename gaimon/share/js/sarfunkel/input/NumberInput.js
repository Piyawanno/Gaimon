class NumberInput extends InputMetaData{
	constructor(column, config){
		super(column, config);
		this.min = config.min;
		this.max = config.max;
		this.isZeroIncluded = config.isZeroIncluded;
		this.isFloatingPoint = config.isFloatingPoint;
	}

	async renderForm(record){
		if(this.input == null){
			let parameter = {...this};
			this.input = new DOMObject(TEMPLATE.input.NumberInput, parameter);
		}
		this.checkEditable();
		if(record) this.setFormValue(record);
		return this.input;
	}
}