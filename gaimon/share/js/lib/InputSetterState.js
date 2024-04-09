let InputSetterState = function(parent){
	let object = this;
	this.parent = parent;

	this.setData = function(data, unset) {
		let dom = object.parent.dom;
		for (let name in data) {
			if (data[name] == undefined) continue;
			let [type, input] = object.getInputByName(name);
			if (type == 'timeSpan'){
				object.setTimeSpan(data, input, name);
			}else if (type == 'fraction'){
				object.setFraction(data, input, name);
			}else if (type == 'currency'){
				object.setCurrency(data, input, name);
			}else if (type == 'position'){
				object.setPosition(data, input, name);
			}else if (type == 'autocomplete'){
				parent.fetchValueAutocomplete(input, data[name], data, dom[`${name}_view`], name);
			}else if (type == 'fileMatrix') {
				object.setFileMatrix(data, input, name);
			}else if (dom[name] != undefined) {
				object.setDOMData(data, unset, name);
			}else if (type == 'input') {
				object.setInput(data, input, name);
			}
		}
	}

	this.setInput = function(data, input, name){
		object.parent.setTagValue(input, data[name]);
		if (input.prerequisite != undefined && input.prerequisite && input.onchange != undefined) {
			object.callPrerequisite(input, data);
		}
	}

	this.setTimeSpan = function(data, input, name){
		data[name] = parseInt(data[name]);
		let hour = parseInt(data[name] / (60*60));
		let minute = parseInt((data[name] % (60 * 60)) / 60);
		let second = data[name] % 60;
		for (let i in input.tag) {
			if (input.tag[i].isHour) input.tag[i].value = hour;
			else if (input.tag[i].isMinute) input.tag[i].value = minute;
			else if (input.tag[i].isSecond) input.tag[i].value = second;
		}
	}

	this.setFraction = function(data, input, name){
		let fraction = (new Fraction(data[name])).toString();
		let integer = data[name].split('.')[0] ;
		let decimal = data[name].split('.')[1] != undefined ? data[name].split('.')[1] : '0';
		for (let i in input.tag) {
			input.tag[i].value = fraction;
		}
	}

	this.setCurrency = function(data, input, name){
		let currency = (new Fraction(data[name].originString)).toString();
		// currency = parseFloat(currency.replaceAll("(", "").replaceAll(")", "")).toFixed(4);
		currency = data[name].originValue;
		// console.log(data, input, name, data[name].originString, currency);
		// let integer = currency.split('.')[0] ;
		// let decimal = currency.split('.')[1] != undefined ? currency.split('.')[1] : '0';
		for (let i in input.tag) {
			input.tag[i].value = currency;
		}
	}

	this.setPosition = function(data, input, name){
		let position = data[name];
		for(let i in input.tag){
			if (input.tag[i].getAttribute('rel').indexOf('latitude') != -1) {
				input.tag[i].value = position[0];
			} else if (input.tag[i].getAttribute('rel').indexOf('longitude') != -1) {
				input.tag[i].value = position[1];
			}
		}
	}

	this.initFileMatrixEvent = function(tbody, tag, data, column) {
		if(tag.dom.delete){
			tag.dom.delete.onclick = async function() {
				/// NOTE SHOW_CONFIRM_DIALOG is explicitly required.
				/// TODO Translated : คุณต้องการจะลบข้อมูลใช่หรือไม่
				SHOW_CONFIRM_DIALOG('Do you want to delete data?', async function(){
					tag.html.remove();
					// if(tbody[`${column}Removed`] == undefined) tbody[`${column}Removed`] = [];
					// let index = tag.dom[column].index;
					// tbody[`${column}Removed`].push(JSON.parse(data[column])[index][1]);
					if(tbody[`${column}removed`] == undefined) tbody[`${column}removed`] = [];
					if(tbody[`${column}Removed`] == undefined) tbody[`${column}Removed`] = [];
					if(tbody[`${column}DBRemoved`] == undefined) tbody[`${column}DBRemoved`] = [];
					let index = tag.dom[column].index;
					tbody[`${column}removed`].push(JSON.parse(data[column])[index][0]);
					tbody[`${column}Removed`].push(JSON.parse(data[column])[index][1]);
					tbody[`${column}DBRemoved`].push(JSON.parse(data[column])[index]);
				});
			}
		}
		if(tag.dom.view){
			tag.dom.view.onclick = async function() {
				let url = tbody.getAttribute('url');
				console.log(tbody);
				if (url == undefined) return;
				if (url.length == 0) return;
				let blob = await GET(`${url}${data.id}/${tag.dom[column].index}`, undefined, 'blob');
				await OPEN_FILE(blob);
			}
		}
	}

	this.setFileMatrix = function(data, input, name){
		let tbody = input.tag[0];
		tbody.html('');
		let isView = tbody.getAttribute('isView');
		isView = isView != null ? true : false;
		let template = object.getFileMatrixTemplate(name, isView);
		let items = JSON.parse(data[name]);
		let index = 0;
		if (items == null) return;
		for (let item of items) {
			let fileItem = JSON.parse(data[name])[index];
			if (tbody.fileMap == undefined) tbody.fileMap = {};
			// if (tbody.fileMap[fileItem[1]] != undefined) continue;
			let tag = new DOMObject(template, {isView});
			tag.dom[name].value = item[0];
			tag.dom[name].pathFile = item[1];
			tag.dom[name].DBPath = item;
			tag.dom[name].index = index;
			if (isView) tag.dom[name].readonly();
			else tag.dom[name].disable();
			object.initFileMatrixEvent(tbody, tag, data, name)
			if (tbody.fileMap[fileItem[1]]) {
				tbody.fileIgnoreList.push(tbody.fileMap[fileItem[1]].dom[i]);
			}
			tbody.append(tag);
			tbody.fileMap[fileItem[1]] = tag;
			index = index + 1;
		}
	}

	this.getInputByName = function(name){
		let parent = object.parent;
		if(name in parent.__timeSpan_input__){
			return ['timeSpan', parent.__timeSpan_input__[name]];
		}else if(name in parent.__fraction_input__){
			return ['fraction', parent.__fraction_input__[name]];
		}else if(name in parent.__currency_input__){
			return ['currency', parent.__currency_input__[name]];
		}else if(name in parent.__position_input__){
			return ['position', parent.__position_input__[name]];
		}else if(name in parent.__autocomplete__){
			return ['autocomplete', parent.__autocomplete__[name]];
		}else if(name in parent.__fileMatrix_input__){
			return ['fileMatrix', parent.__fileMatrix_input__[name]];
		}else if(name in parent.__input__){
			return ['input', parent.__input__[name]];
		} else{
			return [null, null];
		}
	}

	this.setDOMData = function(data, unset, name){
		let dom = object.parent.dom;
		let parent = object.parent;
		if(unset != undefined){
			if(unset.indexOf(name) != -1) return;
		}
		if (Object.keys(dom[name]).length > 0) {
			object.recursiveSetData(dom[name], data[name]);
		}
		if(dom[name].type == 'file'){
			object.setFileData(data, name);
		} else if(typeof(data[name]) == 'object' && data[name] != null) {
			parent.setTagValue(dom[name], data[name].id);
			if (dom[`${name}_view`]) parent.setTagValue(dom[`${name}_view`], data[name].id);
		} else {
			parent.setTagValue(dom[name], data[name]);
			if (dom[`${name}_view`]) parent.setTagValue(dom[`${name}_view`], data[name]);
		}
		if (dom[name].prerequisite != undefined && dom[name].prerequisite && dom[name].onchange != undefined) {
			object.callPrerequisite(dom[name], data);
		}
	}

	this.setFileData = function(data, name){
		let dom = object.parent.dom;
		let config = dom[name].__dom__.data;
		if(data[name] == null || data[name] == '') return;
		if (dom[`${name}_fileName`] == undefined) return;
		dom[name].hasImage = true;
		dom[`${name}_fileName`].html(object.getFileName(data[name]));
		if(!dom[name].getAttribute('imageFile')){
			let fileURL = dom[`${name}`].getAttribute('fileURL');
			dom[`${name}`].setAttribute('fileURL', `${fileURL}${data.id}`);
		}else{
			if(config.isShare){
				/// NOTE rootURL must be explicitly set.
				dom[`${name}_originalImage`].src = `${rootURL}share/${data[name]}`;
				if(config.hasCrop){
					dom[`${name}_croppedImage`].src = `${rootURL}share/cropped/${data[name]}`;
				}
			}else{
				dom[`${name}_originalImage`].src = dom[`${name}_originalImage`].src+data.id+`?${Date.now()}`;
				if(config.hasCrop){
					dom[`${name}_croppedImage`].src = dom[`${name}_croppedImage`].src+'/'+data.id+`?${Date.now()}`;
				}
			}
		}		
		dom[`${name}_preview`].classList.remove('disabled');
	}

	this.getFileName = function(file){
		let fileName;
		try{
			fileName = JSON.parse(file);
			if(fileName[0] != undefined && fileName[0][0] != undefined) fileName = fileName[0][0];
			else if(fileName[0] != undefined) fileName = 'No File Chosen';
			else fileName = 'No File Chosen';
		}catch{
			let splitted = file.split('/');
			if(splitted.length == 0) fileName = 'No File Chosen';
			else fileName = file.split('/')[splitted.length-1];
		}
		return fileName;
	}

	this.callPrerequisite = async function(input, data) {
		let parent = object.parent;
		if (input.onchange.constructor.name == 'AsyncFunction') {
			await input.onchange();
			let childInput = input.childInput;
			for (let name in childInput) {
				let item = parent.__input__[name];
				if (data[name] == undefined) continue;
				parent.setTagValue(childInput[name].input, data[name]);
				if (item == undefined) continue;
				let isPrerequisite = item.prerequisite != undefined && item.prerequisite;
				if (isPrerequisite && item.onchange != undefined) {
					object.callPrerequisite(item, data);
				}
			}
		} else {
			input.onchange();
		}
	}

	this.getFileMatrixTemplate = function (column, isView) {
		return Mustache.render(TEMPLATE.input.FileMatrixRow, {column, config: {isView}});
	}

	this.recursiveSetData = function (input, data) {
		if (data == undefined || input == undefined) return;
		if (Object.keys(input).length > 0) {
			for (let name of Object.keys(input)) {
				object.recursiveSetData(input[name], data[name])
			}
		}
		if (typeof(data) == 'object' && data != null) {
			object.parent.setTagValue(input, data.id);
		} else {
			object.parent.setTagValue(input, data);
		}
		if (input.prerequisite != undefined && input.prerequisite && input.onchange != undefined) {
			object.callPrerequisite(input, data);
		}
	}
}