class FileMatrixInput extends FileInput {
	constructor(column, config){
		super(column, config);
		this.min = config.min;
		this.max = config.max;
		this.isZeroIncluded = config.isZeroIncluded;
		this.isFloatingPoint = config.isFloatingPoint;
		this.inputPerLine = 1;
	}

	/// Tested
	getInputTemplate(){
		return TEMPLATE.input.FileMatrixViewInput;
	}

	/// Not Tested
	getDetailTemplate(){
		return TEMPLATE.DetailInputView;
	}

	/// Not Tested
	getTableFilterTemplate(){
		return TEMPLATE.input.TextInput;
	}

	/// Not Tested
	getCellTemplate(){
		return TEMPLATE.TableCellView;
	}

	/// Not Tested
	getCardRowTemplate(){
		return TEMPLATE.CardRow;
	}

	/// Not Tested
	getTableFormInputTemplate(){
		return TEMPLATE.input.TableFormTextInput;
	}

	/**
	 * 
	 * @param {FileInputConfig} config 
	 */
	static create(config) {
		let data = super.create(config);
		data.typeName = "FileMatrix";
		return data;
	}

	setFormEvent(input){
		let object = this;
		if (input.recordList == undefined) input.recordList = [];
		this.fileInput = new FileInput(object.config, object.config);
		input.dom.add.onclick = async function() {
			let {record, dom} = await object.createFileRecord.bind(object)()
			input.dom.tbody.appendChild(record.html);
			input.recordList.push(dom);
		}
	}

	async createFileRecord(item) {
		let record = new DOMObject(TEMPLATE.input.TableFormFileMatrixViewInputRecord, {});
		let fileInput = new FileInput(this.config, this.config);
		let dom = await fileInput.renderFormCell();
		fileInput.setFormEvent(dom);
		dom.dom.file_box.style.width = "100%";
		dom.dom.file_box.style.maxWidth = "100%";
		if (item) {
			// dom.dom.fileName.innerHTML = item[0];
			let content = {};
			content[this.columnName] = JSON.stringify(item);
			fileInput.setFormValue(dom, content);
		}
		record.dom.delete.appendChild(dom.dom.delete);
		record.dom.input.appendChild(dom.dom.box);
		return {record, dom};
	}

	setFormValue(inputForm, record){
		let object = this;
		if(record != undefined){
			let attribute = record[this.columnName];
			if (attribute == null || attribute == undefined) return;
			let items = JSON.parse(attribute);
			inputForm.dom.tbody.innerHTML = '';
			inputForm.recordList = [];
			if (items == null) return;
			for (let item of items) {
				object.createFileRecord(item).then(({record, dom}) => {
					inputForm.dom.tbody.appendChild(record.html);
					inputForm.recordList.push(dom);
				});
			}
		}
	}

	getFormValue(form, inputForm, data, file, message){
		let ID = Object.id(data);
		data.__ID__ = ID;
		for (let record of inputForm.recordList) {
			let fileMatrix = new FormData();
			this.isPass = this.fileInput.getFormValue.bind(this.fileInput)(form, record, data, fileMatrix, message);
			if (!fileMatrix.isEmpty()) {
				if (data[this.columnName] == undefined) data[this.columnName] = [];
				let fileResult = data[this.columnName];
				if (typeof data[this.columnName] == 'string') {
					fileResult = JSON.parse(data[this.columnName]);
				}
				let iterator = fileMatrix.keys();
				while (true) {
					let result = iterator.next();
					if (result.value != 'data') {
						let items = fileMatrix.getAll(result.value);
						for (let item of items) {
							file.append(`${ID}_${result.value}`, item);
							fileResult.push([item.name, ""])
						}
					}
					if (result.done) break;
				}
				data[this.columnName] = JSON.stringify(fileResult);
			}
		}
		return this.isPass;
	}
	
}