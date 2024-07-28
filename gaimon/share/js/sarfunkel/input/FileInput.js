class FileInput extends TextInput{
	/**
	 * @typedef {object} FileInputAdditionalConfig
	 * @property {boolean} isShare
	 * @property {number} uploadURL
	 * 
	 * @typedef {InputConfig & FileInputAdditionalConfig} FileInputConfig
	 * @param {FileInputConfig} config 
	 */
	static create(config) {
		let data = super.create(config);
		data.typeName = "File";
		data.isShare = config.isShare != undefined ? config.isShare: false;
		data.uploadURL = config.uploadURL != undefined ? config.uploadURL: "";
		return data;
	}

	/// Tested
	getInputTemplate(){
		return TEMPLATE.input.FileViewInput;
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
		return TEMPLATE.input.TableFormFileInput;
	}

	async renderDetail(record, reference){
		if(this.detail == null){
			this.config.isLink = true;
			let parameter = {...this};
			this.detail = new DOMObject(TEMPLATE.DetailInputView, parameter);
			this.setInputPerLine(this.detail, 1);
		}
		if(record) this.setDetailValue(this.detail, record, reference);
		return this.detail;
	}

	setDetailValue(detail, record, reference) {
		let object = this;
		if(record != undefined){
			let attribute = record[this.columnName];
			let item = detail.dom[this.columnName];
			if(attribute != undefined && item != undefined){
				item.innerHTML = '';
				attribute = JSON.parse(attribute);
				for(let i in attribute){
					let content = `<div><a class="hotLink" href="${this.config.url}${record.id}/${i}">${attribute[i][0]}</a></div>`;
					item.append(content);
				}			
			}
		}
	}

	setFormEvent(input){
		if (input.__file_upload__ == undefined) input.__file_upload__ = [];
		input.dom.file.onclick = async function(){
			input.dom.fileInput.click();
		}
		let object = this;
		input.dom.fileInput.onchange = async function(){
			if(!input.dom.fileInput.files.length) return;
			object.removed = false;
			object.hasImage = true;
			input.__file_upload__ = input.dom.fileInput.files;
			input.dom.fileName.html(input.dom.fileInput.files[0].name);
		}

		input.dom.preview.onclick = async function(){
			if(!object.hasImage) return;
			if (input.dom.fileInput.files[0]) {
				let file = input.dom.fileInput.files[0];
				let name = input.dom.fileInput.files[0].name;
				let reader = new FileReader();
				reader.onload = function(e){
					fetch(e.target.result).then(res => res.blob()).then(blob => {
						const fileURL = URL.createObjectURL(blob);
						const link = document.createElement('a');
						link.href = fileURL;
						link.download = name;
						link.click();
					})
				}
				if(file != undefined) reader.readAsDataURL(file);
			} else {
				let record = JSON.parse(object.currentRecord);
				let tag = document.createElement("a");
				tag.href = `${rootURL}share/${record[1]}`;
				tag.download = record[0];
				tag.target = "_blank";
				tag.classList.add("hidden");
				document.body.appendChild(tag);
				tag.click();
				document.body.removeChild(tag);
			}
			
		}

		if(input.dom.delete){
			input.dom.delete.onclick = async function(){
				input.dom.fileInput.type = 'text';
				input.dom.fileInput.type = 'file';
				input.dom.fileName.html('No File Chosen');
				input.dom.preview.classList.add('disabled');
				object.removed = true;
				object.hasImage = false;
				delete input.dataURL;
			}
		}
	}

	setFormValue(inputForm, record){
		if(record != undefined && Object.keys(record).length > 0){
			let attribute = record[this.columnName];
			this.currentRecord = attribute;
			if (attribute == null || attribute == undefined) return;
			if (attribute == '[]') return;
			let content = JSON.parse(attribute);
			let name = content[0];
			inputForm.dom.fileName.html(name);
			this.hasImage = true;
			inputForm.dom.preview.classList.remove('disabled');
		}
	}

	getFormValue(form, inputForm, data, file, message){
		let input = inputForm.dom[this.columnName];
		this.isPass = true;
		if(this.isRequired && (inputForm.__file_upload__.length == 0)){
			input?.classList.add('error');
			message.push(`Required field "${this.label}" is not set.`);
			this.isPass = false;
			return false;
		}else{
			if (inputForm.__file_upload__.length) {
				file.append(this.columnName, inputForm.__file_upload__[0]);
				if (inputForm.dom['remark']) file.append(`${this.columnName}_remark`, inputForm.dom['remark'].value);
			}
			return true;
		}
	}
}