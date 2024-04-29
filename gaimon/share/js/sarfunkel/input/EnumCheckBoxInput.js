class EnumCheckBoxInput extends CheckBoxInput{
    /**
	 * @param {CheckBoxInputConfig} config 
	 */
	static create(config) {
		let data = super.create(config);
		data.typeName = "EnumCheckBox";
		return data;
	}
}