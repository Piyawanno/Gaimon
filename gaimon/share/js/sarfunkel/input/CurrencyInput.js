class CurrencyInput extends NumberInput{
	/**
	 * @param {NumberInputConfig} config 
	 */
	static create(config) {
		let data = super.create(config);
		data.typeName = "Currency";
		return data;
	}
}