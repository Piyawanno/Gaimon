class EnumSelectInput extends SelectInput{
	constructor(column, config){
		super(column, config);
		this.url = config.url;
		this.tableURL = config.tableURL;
		this.isReferenced = true;
		this.option = this.config.option;
		this.optionMap = {};
		for (let option of this.option) {
			this.optionMap[option.value] = option;
		}
	}

	/**
	 * @param {SelectInputConfig} config 
	 */
	static create(config) {
		let data = super.create(config);
		data.typeName = "EnumSelect";
		return data;
	}
}