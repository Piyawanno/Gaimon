class TimeSpanInput extends TextInput{
    /**
	 * 
	 * @param {InputConfig} config 
	 */
	static create(config) {
		let data = super.create(config);
		data.typeName = "TimeSpan";
		return data;
	}
}