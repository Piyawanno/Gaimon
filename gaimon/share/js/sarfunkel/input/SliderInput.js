class SliderInput extends InputMetaData{
    /**
	 * 
	 * @param {InputConfig} config 
	 */
	static create(config) {
		let data = InputConfigCreator.createByConfig(config);
		data.typeName = "Slider";
		return data;
	}
}