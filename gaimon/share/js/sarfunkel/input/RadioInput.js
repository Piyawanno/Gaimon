class RadioInput extends SelectInput{

    /**
	 * @typedef {object} RadioInputAdditionalConfig
	 * @property {Array} option
	 * @property {boolean} isStatusDisplay
	 * 
	 * @typedef {InputConfig & RadioInputAdditionalConfig} RadioInputConfig
	 * @param {RadioInputConfig} config 
	 */
	static create(config) {
		let data = super.create(config);
		data.typeName = "Radio";
		return data;
	}
}