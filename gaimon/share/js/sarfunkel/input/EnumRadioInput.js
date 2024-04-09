class EnumRadioInput extends RadioInput{
    /**
	 * @param {RadioInputConfig} config 
	 */
	static create(config) {
		let data = super.create(config);
		data.typeName = "EnumRadio";
		return data;
	}
}