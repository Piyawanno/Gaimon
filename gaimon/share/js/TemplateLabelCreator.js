const TemplateLabelCreator = function(main, template){
	AbstractPage.call(this, main);

	const object = this;
	this.main = main;

	this.tempTableOrder;

	this.renderDialog = async function(){
		object.tempTableOrder = undefined;

		let dialog = await AbstractPage.prototype.renderBlankDialog.call(this);
		dialog.dom.title.html(`Label`);
		let inputs = await object.getInput();
		let input = {};
		for(let i in inputs){
			input[inputs[i].columnName] = renderInput(inputs[i]);
			dialog.dom.form.append(input[inputs[i].columnName]);
			dialog.dom[inputs[i].columnName] = input[inputs[i].columnName].dom[inputs[i].columnName];
			if(inputs[i].SVG){
				input[`${inputs[i].columnName}_icon`] = {dom:{}};
				input[`${inputs[i].columnName}_icon`].dom[`${inputs[i].columnName}_icon`] = input[inputs[i].columnName].dom[`${inputs[i].columnName}_icon`];
				dialog.dom[`${inputs[i].columnName}_icon`] = input[inputs[i].columnName].dom[`${inputs[i].columnName}_icon`];
			}
		}
		let content = '<div class="width-100-percent flex-column gap-10px">';
		content += '<div class="abstract_dialog_topic">Preview</div>';
		content += '<div style="border:1px solid #afc6c9;padding:10px;display:flex;gap:5px;" rel="preview"></div>'
		content += '</div>';
		let label = new DOMObject(content);
		dialog.dom.form.append(label);
		dialog.dom.preview = label.dom.preview;
		await object.initEvent(dialog, input);
	}

	this.getInput = async function(){
		let options = [];
		for(let i in template.page.module){
			options.push([template.page.module[i], template.page.module[i]]);
		}
		let inputs = await object.getInputConfig([{
			'typeName': 'Select',
			'columnName': 'module',
			'label': 'module',
			'order': '1.0',
			'inputPerLine': '2',
			'option': options,
			'isRequired': true
		},{
			'typeName': 'Number',
			'columnName': 'fontSize',
			'label': 'font size',
			'order': '2.0',
			'inputPerLine': '2',
		},{
			'typeName': 'Color',
			'columnName': 'fontColor',
			'label': 'font color',
			'order': '3.0',
			'inputPerLine': '2',
			'isRequired': true
		},{
			'typeName': 'Select',
			'columnName': 'fontWeight',
			'label': 'font weight',
			'order': '4.0',
			'inputPerLine': '2',
			'option': [[0, 'Normal'], [1, 'Bold']]
		},{
			'typeName': 'Select',
			'columnName': 'fontStyle',
			'label': 'font style',
			'order': '5.0',
			'inputPerLine': '2',
			'option': [[0, 'Normal'], [1, 'Italic']]
		},{
			'typeName': 'Select',
			'columnName': 'textDecoration',
			'label': 'text decoration',
			'order': '6.0',
			'inputPerLine': '2',
			'option': [[0, 'Normal'], [1, 'Underline']]
		},{
			'typeName': 'Select',
			'columnName': 'textAlign',
			'label': 'text align',
			'order': '7.0',
			'inputPerLine': '2',
			'option': [[0, 'Left'], [1, 'Right'], [2, 'Center']]
		},{
			'typeName': 'Text',
			'columnName': 'label',
			'label': 'label',
			'order': '8.0',
			'inputPerLine': '2',
			'SVG': await CREATE_SVG_ICON('Add')
		}]);
		return inputs;
	}

	this.initEvent = async function(dialog, input){
		input.module.dom.defaultValue_module.remove();
		input.fontWeight.dom.defaultValue_fontWeight.remove();
		input.fontStyle.dom.defaultValue_fontStyle.remove();
		input.textDecoration.dom.defaultValue_textDecoration.remove();
		input.textAlign.dom.defaultValue_textAlign.remove();

		input.fontSize.dom.fontSize.value = 13;

		input.module.dom.module.onchange = async function(){

		}
		input.fontSize.dom.fontSize.onkeyup = async function(){
			object.tempTable.dom.table.style.fontSize = `${this.value}px`;
		}
		input.fontColor.dom.fontColor.onchange = async function(){
			object.tempTable.dom.table.style.color = this.value;
		}
		input.label_icon.dom.label_icon.onclick = async function(){
			let label = input.label.dom.label.value;
			let domObject = new DOMObject(`<label>${label}</label>`);
			dialog.dom.preview.append(domObject);
		}
		await input.module.dom.module.onchange();
	}

	this.submit = async function(form){
		console.log(form.dom);
		let result = await AbstractPage.prototype.submit.call(this, form);
		let style = result.data;
		let content = `<div rel="image_box"><img rel="image" src="${form.dom.imagePreviewer.src}"></div>`;
		let domObject = new DOMObject(content);
		await object.setStyle(domObject, style);
		let data = {
			'template': domObject.html.outerHTML,
			'style': style,
			'type': 'Label'
		}
		await template.appendTemplate(domObject, data);
		main.home.dom.dialog.html('');
	}
}