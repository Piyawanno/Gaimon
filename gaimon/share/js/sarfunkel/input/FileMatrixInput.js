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
		return TEMPLATE.input.TableFormFileMatrixViewInput;
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
		if (input.deleteList == undefined) input.deleteList = [];
		this.fileInput = new FileInput(object.config, object.config);
		input.dom.add.onclick = async function() {
			let {record, dom} = await object.createFileRecord.bind(object)()
			dom.dom.delete.onclick = async function() {
				let ID = Object.id(dom);
				input.recordList = input.recordList.filter((item) => {
					return ID != Object.id(item)
				});
				record.html.remove();
			}
			input.dom.tbody.appendChild(record.html);
			input.recordList.push(dom);
		}
	}

	setTableFormEvent(input) {
		let object = this;
		if (input.recordList == undefined) input.recordList = [];
		if (input.deleteList == undefined) input.deleteList = [];
		this.fileInput = new FileInput(object.config, object.config);
		input.dom.add.onclick = async function() {
			let {record, dom} = await object.createFileRecord.bind(object)()
			dom.dom.delete.onclick = async function() {
				let ID = Object.id(dom);
				input.recordList = input.recordList.filter((item) => {
					return ID != Object.id(item)
				});
				record.html.remove();
			}
			input.dom.tbody.appendChild(record.html);
			input.recordList.push(dom);
		}
	}

	async createFileRecord(item, reference, row) {
		let record = new DOMObject(TEMPLATE.input.TableFormFileMatrixViewInputRecord, {});
		let fileInput = new FileInput(this.config, this.config);
		let dom = await fileInput.renderFormCell();
		Object.id(dom);
		fileInput.setFormEvent(dom);
		dom.dom.file_box.style.width = "100%";
		dom.dom.file_box.style.maxWidth = "100%";
		if (item) {
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
		inputForm.recordList = [];
		if(record != undefined){
			let attribute = record[this.columnName];
			if (attribute == null || attribute == undefined) return;
			let items = JSON.parse(attribute);
			inputForm.dom.tbody.innerHTML = '';
			inputForm.recordList = [];
			if (items == null) return;
			for (let item of items) {
				object.createFileRecord(item).then(({record, dom}) => {
					record.currentRecord = item;
					dom.dom.delete.onclick = async function() {
						let ID = Object.id(dom);
						inputForm.recordList = inputForm.recordList.filter((item) => {
							return ID != Object.id(item)
						});
						record.html.remove();
						object.deleteRecord(inputForm, record);
					}
					inputForm.dom.tbody.appendChild(record.html);
					inputForm.recordList.push(dom);
					
					for(let i in inputForm.recordList){
						let input = inputForm.recordList[i];
						input.dom.preview.onclick = () => {
							// if (input.dom.fileInput.files[0]) {
							// 	let file = input.dom.fileInput.files[0];
							// 	let name = input.dom.fileInput.files[0].name;
							// 	let reader = new FileReader();
							// 	reader.onload = function(e){
							// 		fetch(e.target.result).then(res => res.blob()).then(blob => {
							// 			const fileURL = URL.createObjectURL(blob);
							// 			const link = document.createElement('a');
							// 			link.href = fileURL;
							// 			link.download = name;
							// 			link.click();
							// 		})
							// 	}
							// 	if(file != undefined) reader.readAsDataURL(file);
							// } else {
							// 	let record = JSON.parse(object.currentRecord);
							// 	let tag = document.createElement("a");
							// 	tag.href = `${rootURL}share/${record[1]}`;
							// 	tag.download = record[0];
							// 	tag.target = "_blank";
							// 	tag.classList.add("hidden");
							// 	document.body.appendChild(tag);
							// 	tag.click();
							// 	document.body.removeChild(tag);
							// }
						}
					}
				});
			}
		}
	}

	setTableFormValue(inputForm, record) {
		this.setFormValue(inputForm, record);
	}

	getFormValue(form, inputForm, data, file, message){
		let ID = Object.id(data);
		data.__ID__ = ID;
		this.isPass = true;
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
							file.append(`${result.value}`, item);
							fileResult.push([item.name, ""])
						}
					}
					if (result.done) break;
				}
				data[this.columnName] = JSON.stringify(fileResult);
			}
		}
		data[`${this.columnName}_deleteList`] = inputForm.deleteList;
		return this.isPass;
	}

	getTableFormValue(form, inputForm, data, file, message){
		return this.getFormValue.bind(this)(form, inputForm, data, file, message);
	}

	deleteRecord(inputForm, record) {
		inputForm.deleteList.push(record.currentRecord);
	}
	
}