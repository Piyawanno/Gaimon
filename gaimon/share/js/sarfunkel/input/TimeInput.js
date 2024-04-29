class TimeInput extends TextInput{
    /**
	 * 
	 * @param {InputConfig} config 
	 */
	static create(config) {
		let data = super.create(config);
		data.typeName = "Time";
		return data;
	}
}