class TextInput extends InputMetaData{
	async renderForm(record){
		if(this.input == null){
			let parameter = {...this};
			this.input = new DOMObject(TEMPLATE.input.TextInput, parameter);
			this.setInputPerLine();
		}
		this.checkEditable();
		if(record) this.setFormValue(record);
		return this.input;
	}
}