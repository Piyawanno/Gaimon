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

	setFormEvent(input){
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
			}
			return true;
		}
	}
}