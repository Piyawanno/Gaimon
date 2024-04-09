class ReferenceCheckBoxInput extends CheckBoxInput{
    /**
	 * @typedef {object} ReferenceCheckBoxInputAdditionalConfig
	 * @property {string} url
	 * @property {string} tableURL
	 * 
	 * @typedef {InputConfig & ReferenceCheckBoxInputAdditionalConfig} ReferenceCheckBoxInputConfig
	 * @param {ReferenceCheckBoxInputConfig} config 
	 */
	static create(config) {
		let data = super.create(config);
		data.typeName = "ReferenceCheckBox";
		data.url = config.url != undefined ? config.url: "";
		data.tableURL = config.tableURL != undefined ? config.tableURL: "";
		return data;
	}
}