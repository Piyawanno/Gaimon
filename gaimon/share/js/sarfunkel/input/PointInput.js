class PointInput extends InputMetaData{
    /**
	 * 
	 * @param {InputConfig} config 
	 */
	static create(config) {
		let data = InputConfigCreator.createByConfig(config);
		data.typeName = "Point";
		return data;
	}
}