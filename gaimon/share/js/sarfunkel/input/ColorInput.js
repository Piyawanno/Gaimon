class ColorInput extends TextInput{
	/**
	 * @param {TextInputConfig} config 
	 */
	static create(config) {
		let data = super.create(config);
		data.typeName = "Color";
		return data;
	}
}