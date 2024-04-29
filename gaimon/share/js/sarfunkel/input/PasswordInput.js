class PasswordInput extends InputMetaData{
    /**
	 * 
	 * @param {InputConfig} config 
	 */
	static create(config) {
		let data = InputConfigCreator.createByConfig(config);
		data.typeName = "Password";
		return data;
	}
}