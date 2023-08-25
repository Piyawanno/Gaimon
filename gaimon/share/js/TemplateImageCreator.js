const TemplateImageCreator = function(main, template){
	AbstractPage.call(this, main);

	const object = this;
	this.main = main;

	this.renderDialog = async function(){
		let dialog = await AbstractPage.prototype.renderBlankDialog.call(this);
		dialog.dom.title.html(`Image`);
		let inputs = await object.getInput();
		let input = {};
		for(let i in inputs){
			input[inputs[i].columnName] = renderInput(inputs[i]);
			dialog.dom.form.append(input[inputs[i].columnName]);
			dialog.dom[inputs[i].columnName] = input[inputs[i].columnName].dom[inputs[i].columnName];
		}
		let content = '<div class="width-100-percent text-align-center" rel="preview" style="border:1px solid #afc6c9;color:gray;padding:10px;">';
		content += '<img rel="image" style="width:100%;">';
		content += '</div>';
		let image = new DOMObject(content);
		dialog.dom.form.append(image);
		dialog.dom.preview = image.dom.preview;
		dialog.dom.imagePreviewer = image.dom.image;
		await object.initEvent(dialog, input);
	}

	this.getInput = async function(){
		let inputs = await object.getInputConfig([{
			'typeName': 'Select',
			'columnName': 'imageStyle',
			'label': 'image style',
			'order': '1.0',
			'inputPerLine': '2',
			'option': [[0, 'Normal'], [1, 'Watermark']]
		},{
			'typeName': 'File',
			'columnName': 'image',
			'label': 'image',
			'order': '2.0',
			'inputPerLine': '2',
		},{
			'typeName': 'Number',
			'columnName': 'width',
			'label': 'width [px]',
			'order': '3.0',
			'inputPerLine': '2',
		},{
			'typeName': 'Number',
			'columnName': 'height',
			'label': 'height [px]',
			'order': '4.0',
			'inputPerLine': '2',
		}]);
		return inputs;
	}

	this.initEvent = async function(dialog, input){
		input.imageStyle.dom.defaultValue_imageStyle.remove();
		input.width.dom.width.placeholder = '100%';
		input.height.dom.height.placeholder = 'auto';

		input.image.dom.image.onchange = async function(){
			let width = input.width.dom.width.value == '' ? '100%' : `${input.width.dom.width.value}px`;
			let height = input.height.dom.height.value == '' ? 'auto' : `${input.height.dom.height.value}px`;
			dialog.dom.imagePreviewer.style.width = width;
			dialog.dom.imagePreviewer.style.height = height;
			const [file] = this.files;
			if(file){
				await object.toDataURL(URL.createObjectURL(file), function(dataURL){
					dialog.dom.imagePreviewer.src = dataURL;
				});
				// dialog.dom.imagePreviewer.src = URL.createObjectURL(file);
			}
		}
		input.width.dom.width.onkeyup = async function(){
			let width = this.value == '' ? '100%' : `${this.value}px`;
			dialog.dom.imagePreviewer.style.width = `${width}`;
		}
		input.height.dom.height.onkeyup = async function(){
			let height = this.value == '' ? 'auto' : `${this.value}px`;
			dialog.dom.imagePreviewer.style.height = `${height}`;
		}
		input.imageStyle.dom.imageStyle.onchange = async function(){
			if(this.value  == 1){
				input.width.dom.width_box.classList.add('hidden');
				input.height.dom.height_box.classList.add('hidden');
				dialog.dom.imagePreviewer.classList.add('template_image_watermark');
			}else{
				input.width.dom.width_box.classList.remove('hidden');
				input.height.dom.height_box.classList.remove('hidden');
				dialog.dom.imagePreviewer.classList.remove('template_image_watermark');
			}
		}
	}

	this.submit = async function(form){
		let result = await AbstractPage.prototype.submit.call(this, form);
		let style = result.data;
		let content = `<div rel="image_box"><img rel="image" src="${form.dom.imagePreviewer.src}"></div>`;
		let domObject = new DOMObject(content);
		await object.setStyle(domObject, style);
		let data = {
			'template': domObject.html.outerHTML,
			'style': style,
			'type': 'Image'
		}
		await template.appendTemplate(domObject, data);
		main.home.dom.dialog.html('');
	}

	this.setStyle = async function(domObject, style){
		let width = style.width == 0 ? '100%' : `${style.width}px`;
		let height = style.height == 0 ? 'auto' : `${style.height}px`;
		domObject.dom.image.style.width = `${width}`;
		domObject.dom.image.style.height = `${height}`;
		if(style.imageStyle == '1'){
			domObject.dom.image_box.classList.add('absolute');
			domObject.dom.image_box.classList.add('center');
			domObject.dom.image_box.classList.add('document_watermark');
			domObject.dom.image.classList.add('template_image_watermark');
		}
	}

	this.toDataURL = async function(url, callback){
		let xhr = new XMLHttpRequest();
		xhr.onload = function() {
			let reader = new FileReader();
			reader.onloadend = function() {
				callback(reader.result);
			}
			reader.readAsDataURL(xhr.response);
		};
		xhr.open('GET', url);
		xhr.responseType = 'blob';
		xhr.send();
	}
}