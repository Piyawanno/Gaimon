class HiddenInput extends InputMetaData{
    /**
	 * 
	 * @param {InputConfig} config 
	 */
	static create(config) {
		let data = InputConfigCreator.createByConfig(config);
		data.typeName = "Hidden";
		return data;
	}
}