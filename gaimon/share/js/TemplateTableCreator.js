const TemplateTableCreator = function(main, template){
	AbstractPage.call(this, main);

	const object = this;
	this.main = main;

	this.currentInputs = [];
	this.currentModule;
	this.tempTable;
	this.tempTableOrder;
	this.formInputs = {};

	this.theme = [
		['default_table', 'Default'],
		['default_table_1', 'Default 1']
	]

	this.renderDialog = async function(){
		object.tempTable = undefined;
		object.tempTableOrder = undefined;
		object.currentModule = undefined;
		object.currentInputs = [];
		object.formInputs = {};
		
		let dialog = await AbstractPage.prototype.renderBlankDialog.call(this);
		dialog.dom.title.html(`Table`);
		let inputs = await object.getInput();
		let input = {};
		for(let i in inputs){
			input[inputs[i].columnName] = renderInput(inputs[i]);
			dialog.dom.form.append(input[inputs[i].columnName]);
			dialog.dom[inputs[i].columnName] = input[inputs[i].columnName].dom[inputs[i].columnName];
		}
		object.formInputs = input;
		await object.initTableEvent(dialog, input);
	}

	this.initTableEvent = async function(dialog, input){
		input.module.dom.defaultValue_module.remove();
		input.tableStyle.dom.defaultValue_tableStyle.remove();

		input.module.dom.module.onchange = async function(){
			object.tempTableOrder = undefined;
			object.currentModule = this.value;
			let {tableOrder, inputs} = await object.getTemplateTableOrder(this.value);
			await object.getTemplateTable(inputs);
			dialog.dom.additionalForm.html('');
			dialog.dom.additionalForm.append(tableOrder);
			dialog.dom.additionalForm.append(object.tempTable);
		}
		input.fontSize.dom.fontSize.value = 13;
		input.fontSize.dom.fontSize.onkeyup = async function(){
			object.tempTable.dom.table.style.fontSize = `${this.value}px`;
		}
		input.fontColor.dom.fontColor.onchange = async function(){
			object.tempTable.dom.table.style.color = this.value;
		}
		input.borderColor.dom.borderColor.onchange = async function(){
			let th = object.tempTable.html.getElementsByTagName('th');
			let td = object.tempTable.html.getElementsByTagName('td');
			for(let i in th){
				if(typeof(th[i]) == 'object') th[i].style.borderColor = this.value;
			}
			for(let i in td){
				if(typeof(td[i]) == 'object') td[i].style.borderColor = this.value;
			}
		}
		input.tableStyle.dom.tableStyle.onchange = async function(){
			object.tempTable.dom.table.className = this.value;
		}
		await input.module.dom.module.onchange();
	}

	this.submit = async function(form){
		let inputs = object.currentInputs;
		let result = await AbstractPage.prototype.submit.call(this, form);
		let style = result.data;
		let content = `<table class="${style.tableStyle}">`;
		let thead = await object.getTableHead(inputs);
		let tbody = await object.getTableBody(inputs);
		content += thead;
		content += tbody;
		content += '</table>';
		let domObject = new DOMObject(content);
		await object.setStyle(domObject, style);
		let data = {
			'template': content,
			'style': style,
			'type': 'Table'
		}
		await template.appendTemplate(domObject, data);
		main.home.dom.dialog.html('');
	}

	this.getTableHead = async function(inputs){
		let thead = `<thead>`;
		thead += `<tr>`;
		for(let i in inputs){
			if(!inputs[i].isChecked) continue;
			thead += `<th>${inputs[i].label}</th>`;
		}
		thead += `</tr>`;
		thead += `</thead>`;
		return thead;
	}

	this.getTableBody = async function(inputs){
		let module = object.currentModule.charAt(0).toLowerCase()+object.currentModule.slice(1);
		let tbody = `<tbody>`;
		tbody += '{{#'+module+'}}';
		tbody += `<tr>`;		
		for(let i in inputs){
			if(!inputs[i].isChecked) continue;
			tbody += '<td>{{{'+inputs[i].columnName+'}}}</td>';
		}		
		tbody += `</tr>`;
		tbody += '{{/'+module+'}}';
		tbody += `</tbody>`;
		return tbody;
	}

	this.setStyle = async function(domObject, style){
		domObject.html.style.fontSize = `${style.fontSize}px`;
		domObject.html.style.color = style.fontColor;
		let th = domObject.html.getElementsByTagName('th');
		let td = domObject.html.getElementsByTagName('td');
		for(let i in th){
			if(typeof(th[i]) == 'object'){
				th[i].style.borderColor = style.borderColor;
				th[i].style.color = style.fontColor;
			}
		}
		for(let i in td){
			if(typeof(td[i]) == 'object'){
				td[i].style.borderColor = style.borderColor;
				td[i].style.color = style.fontColor;
			}
		}
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
			'isRequired': true
		},{
			'typeName': 'Color',
			'columnName': 'fontColor',
			'label': 'font color',
			'order': '3.0',
			'inputPerLine': '2',
			'isRequired': true
		},{
			'typeName': 'Color',
			'columnName': 'borderColor',
			'label': 'border color',
			'order': '4.0',
			'inputPerLine': '2',
			'isRequired': true
		},{
			'typeName': 'Select',
			'columnName': 'tableStyle',
			'label': 'table style',
			'order': '5.0',
			'inputPerLine': '1',
			'option': object.theme,
			'isRequired': true

		}]);
		return inputs;
	}

	this.getTemplateTable = async function(inputs){
		if(object.tempTable == undefined) object.tempTable = new DOMObject(TEMPLATE.TemplateTable);
		let table = object.tempTable;
		table.dom.thead.html('');
		for(let i in inputs){
			if(!inputs[i].isChecked) continue;
			let thead = new DOMObject(`<th>${inputs[i].label}</th>`);
			table.dom.thead.append(thead);
		}
		table.dom.tbody.html('');
		for(let i=0;i<3;i++){
			let content = `<tr>`;
			for(let j in inputs){
				if(!inputs[j].isChecked) continue;
				content += '<td>-</td>';
			}
			content += '</tr>';
			let tbody = new DOMObject(content);
			table.dom.tbody.append(tbody);
		}
		object.currentInputs = inputs;
		let borderColor = object.formInputs.borderColor.dom.borderColor.value;
		let th = object.tempTable.html.getElementsByTagName('th');
		let td = object.tempTable.html.getElementsByTagName('td');
		for(let i in th){
			if(typeof(th[i]) == 'object') th[i].style.borderColor = borderColor;
		}
		for(let i in td){
			if(typeof(td[i]) == 'object') td[i].style.borderColor = borderColor;
		}
	}

	this.getTemplateTableOrder = async function(module, inputs){
		if(inputs == undefined) inputs = await object.getInputData(module);
		let content = '<div class="width-100-percent flex-column gap-10px">';
		content += '<div class="abstract_dialog_topic">Column Name</div>';
		content += '<div class="flex-column gap-5px width-100-percent" style="max-height:200px;overflow-y:auto;user-select:none;" rel="container">';
		for(let i in inputs){
			if(inputs[i].isChecked == undefined) inputs[i].isChecked = false;
			content += `<div class="flex gap-5px" rel="item_${inputs[i].columnName}">`;
			content += `<div class="flex-center"><input type="checkbox" rel="${inputs[i].columnName}_checkbox"></div>`;
			content += `<div class="flex-center" rel="${inputs[i].columnName}_moveUp" style="color:green;cursor:pointer;">${ICON['Up']}</div>`;
			content += `<div class="flex-center" rel="${inputs[i].columnName}_moveDown" style="color:red;cursor:pointer;">${ICON['Down']}</div>`;
			content += `<div class="flex-center"><label rel="${inputs[i].columnName}_checkboxLabel">${inputs[i].label}</label></div>`;
			content += `</div>`;
		}
		content += '</div>';
		if(object.tempTableOrder == undefined) object.tempTableOrder = new DOMObject(content);
		let tableOrder = object.tempTableOrder;
		inputs = await object.initTableOrderEvent(module, tableOrder, inputs);
		return {tableOrder, inputs};
	}

	this.initTableOrderEvent = async function(module, tableOrder, inputs){
		for(let i in inputs){
			tableOrder.dom[`${inputs[i].columnName}_checkbox`].onchange = async function(){
				inputs[i].isChecked = this.checked;
				await object.getTemplateTable(inputs);
			}
			tableOrder.dom[`${inputs[i].columnName}_moveUp`].onclick = async function(){
				if(parseInt(i)-1 < 0) tableOrder.dom.container.insertBefore(tableOrder.dom[`item_${inputs[i].columnName}`], tableOrder.dom.container.firstChild);
				else{
					tableOrder.dom.container.insertBefore(tableOrder.dom[`item_${inputs[i].columnName}`], tableOrder.dom[`item_${inputs[parseInt(i)-1].columnName}`]);
					swapArrayIndex(inputs, i, parseInt(i)-1);
				}
				await object.getTemplateTableOrder(module, inputs);
				await object.getTemplateTable(inputs);
			}
			tableOrder.dom[`${inputs[i].columnName}_moveDown`].onclick = async function(){
				if(parseInt(i)+2 > inputs.length-1) tableOrder.dom.container.appendChild(tableOrder.dom[`item_${inputs[i].columnName}`]);
				else tableOrder.dom.container.insertBefore(tableOrder.dom[`item_${inputs[i].columnName}`], tableOrder.dom[`item_${inputs[parseInt(i)+2].columnName}`]);
				swapArrayIndex(inputs, i, parseInt(i)+1);
				await object.getTemplateTableOrder(module, inputs);
				await object.getTemplateTable(inputs);
			}
		}
		return inputs;
	}
}