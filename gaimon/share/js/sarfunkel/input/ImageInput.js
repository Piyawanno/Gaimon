class ImageInput extends TextInput{
	constructor(column, config){
		super(column, config);
		this.hasCrop = config.hasCrop;
		if(!this.hasCrop === undefined) this.hasCrop = true;
		this.imageURL = undefined;
		this.removed = false;
		this.hasImage = false;
		this.fileUpload = [];
		this.cropper = null;
	}

	/**
	 * @typedef {object} ImageInputAdditionalConfig
	 * @property {boolean} isPreview
	 * @property {boolean} isShare
	 * @property {number} uploadURL
	 * @property {boolean} hasCrop
	 * 
	 * @typedef {InputConfig & ImageInputAdditionalConfig} ImageInputConfig
	 * @param {ImageInputConfig} config 
	 */
	static create(config) {
		let data = super.create(config);
		data.typeName = "Image";
		data.isPreview = config.isPreview != undefined ? config.isPreview: false;
		data.isShare = config.isShare != undefined ? config.isShare: false;
		data.uploadURL = config.uploadURL != undefined ? config.uploadURL: "";
		data.hasCrop = config.hasCrop != undefined ? config.hasCrop: false;
		return data;
	}
	
	/// Tested
	getInputTemplate(){
		return TEMPLATE.input.ImageFileInput;
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
		return TEMPLATE.input.TableFormImageInput;
	}

	async initCropperEvent(image){
		this.cropper = new Cropper(
			image, {
				dragMode: 'move',
				aspectRatio: 1,
				autoCropArea: .75,
				restore: false,
				guides: true,
				center: true,
				highlight: true,
				cropBoxMovable: false,
				cropBoxResizable: false,
				toggleDragModeOnDblclick: false,
			}
		);
	}

	setPreviewImage(input) {
		let record = this.currentRecord;
		if (record != undefined && record[this.columnName] != undefined) {
			if(!this.imageURL) this.imageURL = record[this.columnName];
			this.hasImage = true;
			input.dom.originalImage.src = `${rootURL}share/${this.imageURL}`;
		} else {
			let file = input.dom.fileInput.files[0];
			let reader = new FileReader();
			reader.onload = function(e){
				input.dom.originalImage.src = e.target.result;
			}
			if(file != undefined) reader.readAsDataURL(file);
		}
		if(input.dataURL != undefined){
			input.dom.croppedImage.src = record.dataURL;
		}
	}

	setFormEvent(input){
		input.dom.file.onclick = async function(){
			input.dom.fileInput.click();
		}
		let object = this;
		let record = this.currentRecord;
		if (record != undefined && record[this.columnName] != undefined) {
			this.imageURL = record[this.columnName];
		}
		input.dom.fileInput.onchange = async function(){
			if(object.cropper) object.cropper.destroy();
			if(!input.dom.fileInput.files.length) return;
			let file = input.dom.fileInput.files[0];
			let reader = new FileReader();
			reader.onload = function(e){
				input.dom.image.src = e.target.result;
				input.dom.confirm.show();
				input.dom.cropper.show();
				if(object.column.hasCrop){
					object.initCropperEvent(input.dom.image);
				}
			}
			reader.readAsDataURL(file);
		}
		input.dom.preview.onclick = async function(){
			if(!object.hasImage) return;
			input.dom.previewer.show();
			object.setPreviewImage(input);
			input.dom.originalButton.onclick();
		}

		if(input.dom.delete){
			input.dom.delete.onclick = async function(){
				/// NOTE to clear file in input.
				input.dom.fileInput.type = 'text';
				input.dom.fileInput.type = 'file';
				input.dom.fileName.html('No File Chosen');
				input.dom.preview.classList.add('disabled');
				input.removed = true;
				object.removed = true;
				object.hasImage = false;
				if(object.cropper) object.cropper.destroy();
				delete input.cropped;
				delete input.cropper;
				delete input.dataURL;
			}
		}
		
		input.dom.confirm.onclick = async function(){
			if(object.hasCrop) await object.crop(i, input.dom);
			input.dom.cropper.hide();
			input.dom.preview.classList.add('disabled');
			if(!input.dom.fileInput.files.length) return;
			input.dom.preview.classList.remove('disabled');
			input.dom.fileName.html(input.dom.fileInput.files[0].name);
			input.removed = false;
			object.removed = false;
			object.hasImage = true;
			object.fileUpload = input.dom.fileInput.files;
		}

		input.dom.cancel.onclick = async function(){
			if(object.fileUpload.length){
				input.dom.fileInput.files = object.fileUpload;
			}else{
				/// NOTE to clear file in input.
				input.dom.fileInput.type = 'text';
				input.dom.fileInput.type = 'file';
			}
			input.dom.cropper.hide();
		}

		input.dom.originalButton.onclick = async function(){
			input.dom.original.show();
			input.dom.cropped.hide();
			input.html.classList.remove('disabled');
			input.dom.croppedButton.classList.add('disabled');
		}
		
		if(this.column.hasCrop){
			input.dom.croppedButton.onclick = async function(){
				input.dom.original.hide();
				input.dom.cropped.show();
				this.classList.remove('disabled');
				input.dom.originalButton.classList.add('disabled');
			}
		}else {
			input.dom.croppedButton.remove();
		}
		
		input.dom.previewerCancel.onclick = async function(){
			input.dom.previewer.hide();
		}
	}

	setTableFormEvent(input){
		this.setFormEvent(input);
	}

	getFormValue(form, inputForm, data, file, message){
		let input = inputForm.dom[this.columnName];
		this.isPass = true;
		if(this.isRequired && (this.fileUpload.length == 0)){
			input?.classList.add('error');
			message.push(`Required field "${this.label}" is not set.`);
			this.isPass = false;
			return false;
		}else{
			if (this.fileUpload.length) {
				file.append(this.columnName, this.fileUpload[0]);
				file.append(`${this.columnName}_cropped`, this.fileUpload[0]);
			}
			return true;
		}
	}

	setFormValue(inputForm, record){
		if(record != undefined && Object.keys(record).length > 0){
			let path = record[this.columnName];
			if (path == null || path == undefined) return;
			if (path == '[]') return;
			let splitted = path.split('/');
			let name = splitted[splitted.length-1];
			inputForm.dom.fileName.html(name);
			this.hasImage = true;
			inputForm.dom.preview.classList.remove('disabled');
		}
	}

	clearFormValue(inputForm) {
		inputForm.dom.fileName.html("No File Chosen");
		inputForm.dom.preview.classList.add('disabled');
		inputForm.removed = false;
		this.imageURL = undefined;
		this.removed = false;
		this.hasImage = false;
		this.fileUpload = [];
		this.cropper = null;
	}

	setTableFormValue(cell, record){
		this.currentRecord = record;
		if(record != undefined){
			let attribute = record[this.columnName];
			let formCell = cell.dom.fileName;
			if(attribute != undefined && formCell != undefined){
				let value = JSON.parse(attribute);
				if(value.length == 0) return;
				formCell.innerHTML = this.column.toInput(JSON.parse(attribute)[0][0]);
				this.imageURL = JSON.parse(attribute)[0][1];
				this.hasImage = true;
				cell.dom.preview.classList.remove('disabled');
			}
		}
	}
}