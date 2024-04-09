class ReferenceRadioInput extends RadioInput{

    /**
	 * @typedef {object} ReferenceRadioInputAdditionalConfig
	 * @property {string} url
	 * @property {string} tableURL
	 * 
	 * @typedef {InputConfig & ReferenceRadioInputAdditionalConfig} ReferenceRadioInputConfig
	 * @param {ReferenceRadioInputConfig} config 
	 */
	static create(config) {
		let data = super.create(config);
		data.typeName = "ReferenceRadio";
		data.url = config.url != undefined ? config.url: "";
		data.tableURL = config.tableURL != undefined ? config.tableURL: "";
		return data;
	}
}