const EMAIL_VALIDATION = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

class EmailInput extends TextInput{
	/**
	 * @param {TextInputConfig} config 
	 */
	static create(config) {
		let data = super.create(config);
		data.typeName = "Email";
		return data;
	}

	getFormValue(form, inputForm, data, file, message){
		let isPass = super.getFormValue(form, inputForm, data, message);
		if(isPass){
			let input = inputForm.dom[this.columnName];
			let result = input != undefined? input.value: null;
			if(result){
				let isValidated = EMAIL_VALIDATION.test(result);
				if(!isValidated){
					message.push(`Email address is not conformed (${this.label}).`)
				}
				return isValidated;
			}
		}
		return isPass;
	}
}