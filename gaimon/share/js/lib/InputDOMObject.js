function renderOption(selectTag, data){
	selectTag.html(`<option value="-1">None</option>`);
	for(let i in data){
		selectTag.append(`<option value="${data[i].value}">${data[i].label}</option>`);
	}
}

let InputDOMObject = function(template, data, isHTML) {
	DOMObject.call(this, template, data, isHTML, false);

	let object = this;

	this.isInput = true;
	this.__input__ = {};
	this.__require_input__ = {};
	this.__position_input__ = {};
	this.__autocomplete__ = {};
	this.__timeSpan_input__ = {};
	this.__fraction_input__ = {};
	this.__currency_input__ = {};
	this.__fileMatrix_input__ = {};

	let init = object.init;
	this.init = function(template, data, isHTML){
		init.call(object, template, data, isHTML);
		object.creator = InputDOMObject;
	}

	// TODO - Fix recursive dom object
	this.setTagRecursiveEvent = function(dom, child, key){
		let input = {};
		let requiredTag;
		let timeSpanInput;
		if (key != undefined) {
			if (dom.__input__[key] == undefined) dom.__input__[key] = {};
			input = {};
			input = dom.__input__[key];
			if (dom.__require_input__[key] == undefined) dom.__require_input__[key] = {};
			requiredTag =  dom.__require_input__[key];
			if (dom.__timeSpan_input__[key] == undefined) dom.__timeSpan_input__[key] = {};
			timeSpanInput = dom.__timeSpan_input__[key];

		} else {
			input = dom.__input__;
			requiredTag = dom.__require_input__;
			timeSpanInput = dom.__timeSpan_input__;
		}
		for (let i in child.dom) {
			if(child.dom[i] == undefined) continue;
			let tagName = child.dom[i].tagName;
			if (tagName == 'INPUT' || tagName == 'SELECT') {
				input[i] = child.dom[i];
			}
		}
		for (let i in child.__require_input__) {
			requiredTag[i] = child.__require_input__[i];
		}
		for (let i in child.__timeSpan_input__) {
			timeSpanInput[i] = child.__timeSpan_input__[i];
		}
		if (dom.__parent__ != undefined && dom.__parent__.__input__ != undefined){
			object.setTagRecursiveEvent(dom.__parent__, child, key);
		}
	}

	let initTagEvent = object.initTagEvent;
	this.initTagEvent = function(attribute, tag) {
		initTagEvent.call(object, attribute, tag);
		if (tag.tagName == 'LABEL') object.initLabelEvent(attribute, tag);
		if (tag.tagName == 'SELECT')  object.initSelectEvent(attribute, tag);
		tag.complete = async function(data, config, callback, dom = undefined) {
			if (typeof Autocomplete == 'undefined') {
				console.error('Missing Autocomplete Plugin.');
				return;
			}
			if (tag.autocompleteObject == undefined) {
				tag.autocompleteObject = new Autocomplete();
				tag.autocompleteObject.init(tag, config);
				tag.autocompleteObject.setData(data, callback);
				tag.autocompleteObject.autocomplete();
			} else {
				tag.autocompleteObject.setData(data, callback);
			}
			if(dom != undefined) dom.__autocomplete__[attribute] = tag;
			else object.__autocomplete__[attribute] = tag;
		}
	}

	let initAttributeEvent = object.initAttributeEvent;
	this.initAttributeEvent = function(attribute, tag) {
		initAttributeEvent.call(object, attribute, tag);
		// object.setRequireTag(attribute, tag);
		object.setValidateTag(attribute, tag);
		// object.setTimeSpanTag(attribute, tag);
		// object.setFractionTag(attribute, tag);
		object.initTagEvent(attribute, tag);
		if (tag.tagName == 'INPUT' || tag.tagName == 'SELECT' || tag.tagName == 'TEXTAREA') object.__input__[attribute] = tag;
		if (object.data == null || object.data == undefined || Object.keys(object.data).length == 0) return;

		// TODO handler change value
		if (false) object.initAttributeOnChangeEvent(attribute, tag);
	}

	this.initAttributeOnChangeEvent = function(attribute, tag){
		let data = object.data;
		if (typeof(attribute) == 'object') {
			for (let i=0; i < attribute.length; i++) {
				if (data[attribute[i]] == undefined) return;
				if (i == attribute.length-1) {
					attribute = attribute[i];
					break;
				} else data = data[attribute[i]];
			}
		}
		
		if (data[attribute] == undefined) return;
		if (data._value == undefined) data._value = {};
		data._value[attribute] = data[attribute];
		if (data._tags == undefined) data._tags = {};
		if (data._tags[attribute] == undefined) data._tags[attribute] = []
		if (!data._tags[attribute].includes(tag)) data._tags[attribute].push(tag);
		
		Object.defineProperty(data, attribute, {
			get: function(){
				return this._value[attribute];
			},
			set: function(value){
				this._value[attribute] = value;
				object.setValueFromTag(data._tags[attribute], this._value[attribute]);
			}
		});

		tag.onchange = function(event) {
		}
	}

	this.initLabelEvent = function(attribute, tag){
		if (attribute.indexOf('Label') != -1) {
			let inputKey = attribute.replace('Label', '');
			tag.onclick = function() {
				if (object.dom[inputKey] != undefined) {
					object.dom[inputKey].click();
				}
			}
		}
	}

	this.initSelectEvent = function(attribute, tag){
		tag.setOption = function(options) {
			tag.resetOption();
			for (let item of options) {
				let option = new DOMObject('<option value="{{{value}}}" localize>{{{label}}}</option>', item);
				tag.append(option);
			}
			tag.value = -1;
		}

		tag.resetOption = function() {
			let rel = tag.getAttribute('rel');
			let option = new DOMObject('<option rel="defaultValue_{{{rel}}}" value="{{{value}}}" localize>{{{label}}}</option>', {rel, value: -1, label: 'None'});
			tag.html('');
			tag.append(option);
		}
	}

	this.setValidateTag = function(attribute, tag) {
		let name = attribute;
		tag.tag = tag;
		if (tag.getAttribute('validate') == null) return;
		tag.isRequired = true;
		if (tag.getAttribute('validate').length > 0) {
			name = tag.getAttribute('validate');
			object.validateTag[name] = {type: tag.type, tag: tag};
		} else if (tag.tagName == "SELECT") {
			object.validateTag[name] = {type: 'select', tag: tag};
		} else {
			object.validateTag[name] = {type: tag.type, tag: tag};
		}
	}

	this.setTimeSpanTag = function(attribute, tag) {
		tag.tag = tag;
		if (tag.getAttribute('timespan') == null) return;
		if (tag.getAttribute('timespan') == 0) return;
		tag.isTimeSpan = true;

		let name = tag.getAttribute('timespan');
		tag.timeSpanName = name;
		let splitted = attribute.split('_');
		let timeSpanType = splitted[splitted.length-1];
		tag.isHour = false;
		tag.isMinute = false;
		tag.isSecond = false;
		
		if (timeSpanType == 'hour') tag.isHour = true;
		else if (timeSpanType == 'minute') tag.isMinute = true;
		else if (timeSpanType == 'second') tag.isSecond = true;

		if (object.__timeSpan_input__[name] == undefined) {
			tag.tag = [];
			object.__timeSpan_input__[name] = {type: tag.type, tag: tag.tag, rel: attribute}
			tag.rel = attribute;
		}
		if (object.__timeSpan_input__[name].tag.indexOf(tag) == -1) { 
			object.__timeSpan_input__[name].tag.push(tag);
		}
	}

	this.setPositionTag = function(attribute, tag) {
		if (tag.getAttribute('isPosition') == null) return;
		if (tag.getAttribute('isPosition') == 0) return;
		if (tag.getAttribute('isPosition').length == 0) return;
		tag.isPosition = true;
		let name = tag.getAttribute('isPosition');
		if (object.__position_input__[name] == undefined) {
			tag.tag = [];
			object.__position_input__[name] = {type: 'position', tag: tag.tag, rel: attribute}
			tag.rel = attribute;
		}
		if (object.__position_input__[name].tag.indexOf(tag) == -1) { 
			object.__position_input__[name].tag.push(tag);
		}
	}

	this.setFractionTag = function(attribute, tag){
		tag.tag = tag;
		if (tag.getAttribute('fraction') == null) return;
		if (tag.getAttribute('fraction') == 0) return;
		let name = tag.getAttribute('fraction');
		tag.fractionName = name;
		let splitted = attribute.split('_');
		let fractionType = splitted[splitted.length-1];
		tag.isInteger = false;
		tag.isDecimal = false;
		if (fractionType == 'integer') tag.isInteger = true;
		else if (fractionType == 'decimal') tag.isDecimal = true;
		if (object.__fraction_input__[name] == undefined) {
			tag.tag = [];
			object.__fraction_input__[name] = {type: tag.type, tag: tag.tag, rel: attribute};
			tag.rel = attribute;
		}
		if (object.__fraction_input__[name].tag.indexOf(tag) == -1) { 
			object.__fraction_input__[name].tag.push(tag);
		}
	}

	this.setCurrencyTag = function(attribute, tag){
		tag.tag = tag;
		if (tag.getAttribute('currency') == null) return;
		if (tag.getAttribute('currency') == 0) return;
		let name = tag.getAttribute('currency');
		tag.currencyName = name;
		let splitted = attribute.split('_');
		let currencyType = splitted[splitted.length-1];
		tag.isInteger = false;
		tag.isDecimal = false;
		if (currencyType == 'integer') tag.isInteger = true;
		else if (currencyType == 'decimal') tag.isDecimal = true;
		if (object.__currency_input__[name] == undefined) {
			tag.tag = [];
			object.__currency_input__[name] = {type: tag.type, tag: tag.tag, rel: attribute}
			tag.rel = attribute;
		}
		if (object.__currency_input__[name].tag.indexOf(tag) == -1) { 
			object.__currency_input__[name].tag.push(tag);
		}
	}

	this.setFileMatrixTag = function(attribute, tag){
		tag.tag = tag;
		if (tag.getAttribute('fileMatrix') == null) return;
		if (tag.getAttribute('fileMatrix') == 0) return;
		let name = tag.getAttribute('fileMatrix');
		tag.fileMatrixName = name;
		if (object.__fileMatrix_input__[name] == undefined) {
			tag.tag = [];
			object.__fileMatrix_input__[name] = {type: tag.type, tag: tag.tag, rel: attribute}
			tag.rel = attribute;
		}
		if (object.__fileMatrix_input__[name].tag.indexOf(tag) == -1) { 
			object.__fileMatrix_input__[name].tag.push(tag);
		}
	}
	
	this.setRequireTag = function(attribute, tag) {
		if (Array.isArray(tag)) return;
		let name = attribute;
		tag.tag = tag;
		if (tag.getAttribute == undefined || tag.getAttribute('required') == null) return;
		tag.isRequired = true;
		if (tag.getAttribute('required').length > 0) {
			name = tag.getAttribute('required');
			if (object.requireTag[name] == undefined) {
				tag.tag = [];
				object.requireTag[name] = {type: tag.type, tag: tag.tag, rel: attribute}
				tag.rel = attribute;
			}
			if (object.requireTag[name].tag.indexOf(tag) == -1) { 
				object.requireTag[name].tag.push(tag);
			}
		} else if (tag.tagName == "SELECT") {
			object.requireTag[name] = {type: 'select', tag: tag};
		} else {
			let type = tag.type;
			if (tag.type == undefined) type = "div";
			object.requireTag[name] = {type: type, tag: tag};
		}
		tag.requireName = name;
		object.__require_input__[name] = object.requireTag[name];
	}

	this.setInputTag = function(){
		for (let name in object.dom) {
			let dom = object.dom[name];
			if(dom.getAttribute == undefined) continue;
			object.setRequireTag(name, dom);
			object.setTimeSpanTag(name, dom);
			object.setFractionTag(name, dom);
			object.setCurrencyTag(name, dom);
			object.setFileMatrixTag(name, dom);
			object.setPositionTag(name, dom);
		}
	}

	this.validateNumberTag = function(){
		for (let i in object.validateTag) {
			let tag = object.validateTag[i];
			if (tag.type != 'number') continue;
			if (tag.tag.value.length == 0) {
				isPass = isPass && false;
				tag.tag.classList.add('error');
				continue
			}
			let value = parseFloat(tag.tag.value);
			let isValid = true;
			if (tag.tag.max.length > 0) {
				isValid = isValid && value <= parseFloat(tag.tag.max);
			}
			if (tag.tag.min.length > 0) {
				isValid = isValid && value >= parseFloat(tag.tag.min);
			}
			isPass = isPass && isValid;
			if (!isValid) tag.tag.classList.add('error');
			else tag.tag.classList.remove('error');
		}
	}

	this.getData = function(isShowOnly, isShowError, isVerifyHidden) {
		if (isShowOnly == undefined) isShowOnly = false;
		if (isShowError == undefined) isShowError = true;
		if (isVerifyHidden == undefined) isVerifyHidden = false;
		let data = {};
		object.setInputTag();
		let state = new InputGetterState(
			object,
			isShowOnly,
			isShowError,
			isVerifyHidden
		);
		state.getRequiredData(data);
		let file = new FormData();
		object.validateNumberTag();
		object.getAutoCompleteValue(data);
		object.getTimeSpanValue(data);
		object.getFractionValue(data);
		object.getCurrencyValue(data);
		object.getPositionValue(data);
		object.getTagValue(file, data);
		object.getFileMatrixValue(file, data);
		let isPass = state.isPass;
		if(isShowError && !isPass){
			let text = Mustache.render(TEMPLATE.ErrorMessageList, {message: state.message});
			SHOW_ALERT_DIALOG(text);
		}
		return {isPass, data, file}
	}

	this.getFileData = function(result){
		let formData = result.file;
		formData.append('data', JSON.stringify(result.data));
		return formData;
	}

	// TODO - Fix recursive dom object
	this.getAllData = function(isShowOnly, isShowError) {
		if (isShowOnly == undefined) isShowOnly = false;
		if (isShowError == undefined) isShowError = true;
		let data = {};
		let state = new InputGetterState(
			object,
			isShowOnly,
			isShowError,
			false
		);
		let isPass = state.getRecursiveData(data, object.__input__);
		return {isPass, data};
	}

	this.getTagValue = function(file, data){
		for (let i in object.dom) {
			if (object.dom[i].tagName == "DIV" && object.dom[i].quill == undefined) continue;
			if (object.dom[i].tagName == "OPTION") continue;
			if (object.dom[i].tagName == "INPUT" && object.dom[i].type == "file") {
				if(!object.dom[i].files.length) continue;
				file.append(i, object.dom[i].files[0]);
				if(!object.dom[i].cropped) continue;
				file.append(`${i}_cropped`, object.dom[i].cropped);
			}
			if (data[i] != undefined) continue;
			if(object.dom[i].classList != undefined){
				if(object.dom[i].classList.contains('hidden')){
					continue;
				}
			}
			data[i] = object.getValueFromTag(object.dom[i]);
		}
	}

	this.getAutoCompleteValue = function(data){
		for (let i in object.__autocomplete__) {
			let tag = object.__autocomplete__[i];
			if (tag.value.length > 0) data[i] = tag.currentValue;
		}
		return data;
	}

	this.getTimeSpanValue = function(data) {
		for (let name in object.__timeSpan_input__) {
			let tag = object.__timeSpan_input__[name];
			let hour = 0;
			let minute = 0;
			let second = 0;
			for (let i in tag.tag) {
				if (tag.tag[i].isHour) {
					hour = parseInt(tag.tag[i].value);
					if (isNaN(hour)) hour = 0;
				} else if (tag.tag[i].isMinute) {
					minute = parseInt(tag.tag[i].value);
					if (isNaN(minute)) minute = 0;
				} else if (tag.tag[i].isSecond) {
					second = parseInt(tag.tag[i].value);
					if (isNaN(second)) second = 0;
				}
			}
			data[name] = (hour*60*60) + (minute*60) + second;
		}
		return data;
	}

	this.getPositionValue = function(data){
		for (let name in object.__position_input__) {
			let tag = object.__position_input__[name];
			let value = [0, 0];
			for(let i in tag.tag){
				if (tag.tag[i].getAttribute('rel').indexOf('latitude') != -1) {
					value[1] = object.getValueFromTag(tag.tag[i]);
				} else if (tag.tag[i].getAttribute('rel').indexOf('longitude') != -1) {
					value[0] = object.getValueFromTag(tag.tag[i]);
				}
			}
			data[name] = value;
		}
		return data;
	}

	this.getFractionValue = function(data){
		for (let name in object.__fraction_input__) {
			let tag = object.__fraction_input__[name];
			let value = '0';
			for(let i in tag.tag){
				value = String(tag.tag[i].value) == '' ? '0': String(tag.tag[i].value);
			}
			let fraction = new Fraction(value);			
			fraction = `${fraction.n}/${fraction.d}`;
			data[name] = fraction;
		}
		return data;
	}

	this.getCurrencyValue = function(data){
		for (let name in object.__currency_input__) {
			let tag = object.__currency_input__[name];
			let value = '0';
			for(let i in tag.tag){
				value = String(tag.tag[i].value) == '' ? '0': String(tag.tag[i].value);
			}
			let currency = new Fraction(value);
			currency = `${currency.n}/${currency.d}`;
			if(data[name] == undefined) data[name] = {};			
			data[name]['originString'] = currency;
		}
		return data;
	}

	this.getFileMatrixValue = function(file, data){
		for(let name in object.__fileMatrix_input__){
			if (data[name] == undefined) data[name] = [];
			if (data[`${name}removed`] == undefined) data[`${name}removed`] = [];
			if (data[`${name}Removed`] == undefined) data[`${name}Removed`] = [];
			if (data[`${name}DBRemoved`] == undefined) data[`${name}DBRemoved`] = [];
			let tag = object.__fileMatrix_input__[name];
			for(let i in tag.tag){
				let input = tag.tag[i][name];
				if (tag.tag[i][`${name}removed`] != undefined) {
					data[`${name}removed`].push(...tag.tag[i][`${name}removed`]);
				}
				if (tag.tag[i][`${name}Removed`] != undefined) {
					data[`${name}Removed`].push(...tag.tag[i][`${name}Removed`]);
				}
				if (tag.tag[i][`${name}DBRemoved`] != undefined) {
					data[`${name}DBRemoved`].push(...tag.tag[i][`${name}DBRemoved`]);
				}
				object.getFileMatrixItemValue(file, input, name);
			}
		}
		for(let name in object.__fileMatrix_input__){
			if (data[name].length == 0) delete data[name]
		}
		return file;
	}

	this.getFileMatrixItemValue = function(file, input, name){
		if(input == undefined) return;
		if(Array.isArray(input)){
			object.getFileMatrixArrayValue(file, input, name);
		}else{
			if(input.offsetParent == null) return;
			if(input.files == undefined) {
				file.append(name, input.index);
				return;
			};
			if(!input.files.length) return;
			file.append(name, input.files[0]);
		}
	}

	this.getFileMatrixArrayValue = function(file, input, name){
		for(let i in input){
			if(input[i].offsetParent == null) {
				if (data[`${name}removed`] == undefined) data[`${name}removed`] = [];
				data[`${name}removed`].push(input[i].value);
				continue;
			}
			if(input[i].files == undefined) {
				file.append(name, input[i].index);
				continue;
			};
			if(!input[i].files.length) continue;
			file.append(name, input[i].files[0]);
		}
	}

	this.setData = function(data, unset) {
		this.rawData = JSON.parse(JSON.stringify(data));
		this.setInputTag();
		let state = new InputSetterState(object);
		state.setData(data, unset);
	}

	this.fetchValueAutocomplete = async function(input, value, data, tagView, key) {
		if (GLOBAL.AUTOCOMPLETE_CACHE == undefined) GLOBAL.AUTOCOMPLETE_CACHE = {};
		this.cached = GLOBAL.AUTOCOMPLETE_CACHE;
		if (typeof(input.autocompleteObject.data) == 'string') {
			if (GET == undefined) return;
			if (value == undefined) return;
			if (value.length == 0) return;
			// let response = await GET(`${input.autocompleteObject.data}/${value}`, undefined, 'json', true);
			let now = Date.now();
			let url = `${input.autocompleteObject.data}/by/reference`;
			let response;
			let isCached = false;
			if (this.cached[url] && this.cached[url][value]) {
				if (now - this.cached[url][value].time < 10000) {
					response = this.cached[url][value].response;
					isCached = true;
				} else {
					this.cached[url][value] = undefined;
				}
			}
			if (!isCached){
				response = await POST(url, {'reference': value}, undefined, 'json', true);
			}
			if (response.isSuccess) {
				if (!isCached) {
					if (this.cached[url] == undefined) this.cached[url] = {}
					this.cached[url][value] = {response: response, time: Date.now()};
					if (response.results != undefined) response.result = response.results;
				}
				input.value = response.label;
				if (tagView){
					let rendered = input.autocompleteObject.getRenderedTemplate(response.result);
					if(typeof rendered == 'string') tagView.innerHTML = rendered;
					else tagView.html(rendered);
				}
				if (response.results) input.autocompleteObject.tag.currentValue = response.results;
				else if (response.result) input.autocompleteObject.tag.currentValue = response.result;
				if (input.autocompleteObject.callback != undefined) {
					input.autocompleteObject.callback(input.autocompleteObject.tag.currentValue)
				}
				if (input.onchange != undefined) {
					await input.onchange();
					if (data != undefined && input.childInput != undefined) {
						for (let i in input.childInput) {
							object.setTagValue(input.childInput[i].input, data[input.childInput[i].detail.columnName]);
						}
					}
				}
			} else {
				input.value = '';
			}
		}
	}

	object.init(template, data, isHTML);
}

InputDOMObject.prototype.toJSON = function() {
	return '';
}