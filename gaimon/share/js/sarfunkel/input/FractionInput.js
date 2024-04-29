class FractionInput extends NumberInput{
    /**
	 * 
	 * @param {NumberInputConfig} config 
	 */
	static create(config) {
		let data = super.create(config);
		data.typeName = "Fraction";
		return data;
	}
}