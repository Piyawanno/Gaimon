let DOMObject = function(template, data, isHTML) {
	let object = this;
	
	this.html;
	this.dom;
	this.rawData;
	this.data;
	this.requireTag = {};
	this.validateTag = {};
	this.localizeTag = [];
	this.__input__ = {};
	this.__require_input__ = {};
	this.__position_input__ = {};
	this.__autocomplete__ = {};
	this.__timeSpan_input__ = {};
	this.__fraction_input__ = {};
	this.__currency_input__ = {};
	this.__filematrix_input__ = {};

	if (window.LOCALE == undefined) window.LOCALE = {};

	this.localize = function() {
		return function(val, render) {
			if (LOCALE[val] == undefined) {
				setTextLocale(val);
				return val;
			} else {
				return LOCALE[val];
			}
		};
	}

	this.init = function(template, data, isHTML) {
		if (data == undefined) data = {};
		if (isHTML == undefined) isHTML = false;
		// if (Array.isArray(data)) this.rawData = Object.assign([], data);
		// else this.rawData = JSON.parse(JSON.stringify(Object.assign({}, data)));
		this.rawData = JSON.parse(JSON.stringify(data, function replacer(key, value) {
			try {
				JSON.stringify(value);
				return value;
			} catch (error) {
				return null;
			}
		}));

		this.data = data;
		// data.localize = object.localize;
		if (!isHTML) {
			let text = Mustache.render(template, data);
			this.html = this.createElement(text);
		}
		if (this.html == null) return;
		this.dom = this.getObject(this.html);
		object.initTagEvent('', object.html);
		object.renderLocalize();
	}

	this.createElement = function(text) {
		text = text.trim();
		if (text.indexOf('<tr') == 0) {
			const table = document.createElement('table');
			table.insertAdjacentHTML('beforeend', text);
			return table.firstChild.firstChild;
		} else if (text.indexOf('<th') == 0) {
			const table = document.createElement('tr');
			table.insertAdjacentHTML('beforeend', text);
			return table.firstChild;
		} else if (text.indexOf('<td') == 0) {
			const table = document.createElement('tr');
			table.insertAdjacentHTML('beforeend', text);
			return table.firstChild;
		} else if (text.indexOf('<colgroup') == 0) {
			const colgroup = document.createElement('colgroup');
			colgroup.insertAdjacentHTML('beforeend', text);
			return colgroup;
		} else if (text.indexOf('<option') == 0) {
			const select = document.createElement('select');
			select.innerHTML = text
			return select.options[0];
		} else {
			const div = document.createElement('div');
			div.innerHTML = text;
			return div.firstChild; 
		}
	}

	this.getObject = function(dom) {
		let tag = {}
		this.walk(dom, tag);
		return tag;
	}

	this.createObjectTree = function(tag, rel, node) {
		let relList = rel.split('.');
		if (relList.length > 1) {
			let currentTag = tag;
			for (let i=0; i < relList.length; i++) {
				if (currentTag[relList[i]] == undefined) currentTag[relList[i]] = {}
				if (i == relList.length-1) currentTag[relList[i]] = node;
				currentTag = currentTag[relList[i]];
			}
			object.initAttributeEvent(relList, node);
		} else {
			tag[rel] = node;
			object.initAttributeEvent(rel, node);
		}
		return tag;
	}

	this.walk = function(node, tag) {
		// if(node.getAttribute == undefined) return;
		let rel = node.getAttribute('rel');
		if (rel != null) {
			object.createObjectTree(tag, rel, node);
		}
		object.setLocalizeTag(node);
		const children = node.children;
		for (let i = 0; i < children.length; i++) {
			let rel = children[i].getAttribute('rel');
			if (rel != null) {
				object.createObjectTree(tag, rel, children[i]);
			}
			object.walk(children[i], tag);
		}
	}

	this.setRequireTag = function(atrribute, tag) {
		if (Array.isArray(tag)) return;
		let name = atrribute;
		tag.tag = tag;
		if (tag.getAttribute == undefined || tag.getAttribute('required') == null) return;
		tag.isRequired = true;
		if (tag.getAttribute('required').length > 0) {
			name = tag.getAttribute('required');
			if (object.requireTag[name] == undefined) {
				tag.tag = [];
				object.requireTag[name] = {type: tag.type, tag: tag.tag, rel: atrribute}
				tag.rel = atrribute;
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

	this.setValidateTag = function(atrribute, tag) {
		let name = atrribute;
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

	this.setLocalizeTag = function(tag) {
		if (tag.getAttribute('localize') == null) return;
		object.localizeTag.push(tag);
	}

	this.renderLocalize = function() {
		let texts = [];
		for (let i in object.localizeTag) {
			let tag = object.localizeTag[i];
			object.setLocalizeByTag(tag);
		}
	}

	this.getLocalizeByTag = function(tag) {
		if (tag.tagName == 'DIV') {
			return tag.innerHTML;
		} else if (tag.tagName == 'LABEL') {
			return tag.innerHTML;
		} else if (tag.tagName == 'A') {
			return tag.innerHTML;
		} else if (tag.tagName == 'TEXTAREA') {
			return tag.placeholder;
		} else if (tag.tagName == 'TD' || tag.tagName == 'TH') {
			return tag.innerHTML;
		} else if (tag.tagName == 'INPUT') {
			if (tag.type == 'text' || tag.type == 'password' || tag.type == "number") {
				return tag.placeholder;
			} else {
				return '';
			}
		} else if (tag.tagName == 'OPTION') {
			return tag.innerHTML;
		} else {
			return ''
		}
	}

	this.setLocalizeByTag = function(tag) {
		let texts = [];
		let localizeText = LOCALE[tag.innerHTML];
		if (tag.getAttribute('localize') != undefined && tag.getAttribute('localize').length != 0) {
			localizeText = LOCALE[tag.getAttribute('localize')];
		} else if (tag.getAttribute('localize') != undefined) {
			tag.setAttribute('localize', object.getLocalizeByTag(tag));
			localizeText = LOCALE[tag.getAttribute('localize')];
		}
		if (tag.tagName == 'DIV') {
			if (localizeText != undefined) tag.innerHTML = localizeText;
			else if (tag.innerHTML.length > 0) texts.push(tag.innerHTML);
		} else if (tag.tagName == 'LABEL') {
			if (localizeText != undefined) tag.innerHTML = localizeText;
			else if (tag.innerHTML.length > 0) texts.push(tag.innerHTML);
		} else if (tag.tagName == 'A') {
			if (localizeText != undefined) tag.innerHTML = localizeText;
			else if (tag.innerHTML.length > 0) texts.push(tag.innerHTML);
		} else if (tag.tagName == 'TEXTAREA') {
			if (LOCALE[tag.placeholder] != undefined) tag.placeholder = LOCALE[tag.placeholder];
			else if (tag.placeholder.length > 0) texts.push(tag.placeholder);
		} else if (tag.tagName == 'TD' || tag.tagName == 'TH') {
			if (localizeText != undefined) tag.innerHTML = localizeText;
			else if (tag.innerHTML.length > 0) texts.push(tag.innerHTML);
		} else if (tag.tagName == 'INPUT') {
			if (tag.type == 'text' || tag.type == 'password' || tag.type == "number") {
				if (tag.placeholder.length > 0 && LOCALE[tag.placeholder] != undefined) {
					tag.placeholder = LOCALE[tag.placeholder];
				} else if (tag.innerHTML.length > 0) texts.push(tag.innerHTML);
			}
		} else if (tag.tagName == 'SELECT') {
			let length = tag.options.length;
			for (let index=0; index < length; index++) {
				let option = tag.options[index];
				if (option.text.length > 0 && LOCALE[option.text] != undefined) {
					option.text = LOCALE[option.text];
				} else if (tag.innerHTML.length > 0) texts.push(tag.innerHTML);
			}
		} else if (tag.tagName == 'OPTION') {
			if (localizeText != undefined) tag.innerHTML = localizeText;
			else if (tag.innerHTML.length > 0) texts.push(tag.innerHTML);
		} else if (tag.tagName == 'SPAN') {
			if (localizeText != undefined) tag.innerHTML = localizeText;
			else if (tag.innerHTML.length > 0) texts.push(tag.innerHTML);
		} else if (tag.tagName == 'P') {
			if (localizeText != undefined) tag.innerHTML = localizeText;
			else if (tag.innerHTML.length > 0) texts.push(tag.innerHTML);
		} else if (tag.tagName == 'OL') {
			if (localizeText != undefined) tag.innerHTML = localizeText;
			else if (tag.innerHTML.length > 0) texts.push(tag.innerHTML);
		} else if (tag.tagName == 'LI') {
			if (localizeText != undefined) tag.innerHTML = localizeText;
			else if (tag.innerHTML.length > 0) texts.push(tag.innerHTML);
		}
		return texts;
	}

	this.setTimeSpanTag = function(atrribute, tag) {
		tag.tag = tag;
		if (tag.getAttribute('timespan') == null) return;
		if (tag.getAttribute('timespan') == 0) return;
		tag.isTimespan = true;

		let name = tag.getAttribute('timespan');
		tag.timeSpanName = name;
		let splited = atrribute.split('_');
		let timeSpanType = splited[splited.length-1];
		tag.isHour = false;
		tag.isMinute = false;
		tag.isSecond = false;
		if (timeSpanType == 'hour') tag.isHour = true;
		else if (timeSpanType == 'minute') tag.isMinute = true;
		else if (timeSpanType == 'second') tag.isSecond = true;
		if (object.__timeSpan_input__[name] == undefined) {
			tag.tag = [];
			object.__timeSpan_input__[name] = {type: tag.type, tag: tag.tag, rel: atrribute}
			tag.rel = atrribute;
		}
		if (object.__timeSpan_input__[name].tag.indexOf(tag) == -1) { 
			object.__timeSpan_input__[name].tag.push(tag);
		}
	}

	this.setPositionTag = function(atrribute, tag) {
		if (tag.getAttribute('isPosition') == null) return;
		if (tag.getAttribute('isPosition') == 0) return;
		if (tag.getAttribute('isPosition').length == 0) return;
		tag.isPosition = true;
		let name = tag.getAttribute('isPosition');
		if (object.__position_input__[name] == undefined) {
			tag.tag = [];
			object.__position_input__[name] = {type: 'position', tag: tag.tag, rel: atrribute}
			tag.rel = atrribute;
		}
		if (object.__position_input__[name].tag.indexOf(tag) == -1) { 
			object.__position_input__[name].tag.push(tag);
		}
	}

	this.setFractionTag = function(atrribute, tag){
		tag.tag = tag;
		if (tag.getAttribute('fraction') == null) return;
		if (tag.getAttribute('fraction') == 0) return;
		let name = tag.getAttribute('fraction');
		tag.fractionName = name;
		let splited = atrribute.split('_');
		let fractionType = splited[splited.length-1];
		tag.isInteger = false;
		tag.isDecimal = false;
		if (fractionType == 'integer') tag.isInteger = true;
		else if (fractionType == 'decimal') tag.isDecimal = true;
		if (object.__fraction_input__[name] == undefined) {
			tag.tag = [];
			object.__fraction_input__[name] = {type: tag.type, tag: tag.tag, rel: atrribute};
			tag.rel = atrribute;
		}
		if (object.__fraction_input__[name].tag.indexOf(tag) == -1) { 
			object.__fraction_input__[name].tag.push(tag);
		}
	}

	this.setCurrencyTag = function(atrribute, tag){
		tag.tag = tag;
		if (tag.getAttribute('currency') == null) return;
		if (tag.getAttribute('currency') == 0) return;
		let name = tag.getAttribute('currency');
		tag.currencyName = name;
		let splited = atrribute.split('_');
		let currencyType = splited[splited.length-1];
		tag.isInteger = false;
		tag.isDecimal = false;
		if (currencyType == 'integer') tag.isInteger = true;
		else if (currencyType == 'decimal') tag.isDecimal = true;
		if (object.__currency_input__[name] == undefined) {
			tag.tag = [];
			object.__currency_input__[name] = {type: tag.type, tag: tag.tag, rel: atrribute}
			tag.rel = atrribute;
		}
		if (object.__currency_input__[name].tag.indexOf(tag) == -1) { 
			object.__currency_input__[name].tag.push(tag);
		}
	}

	this.setFileMatrixTag = function(atrribute, tag){
		tag.tag = tag;		
		if (tag.getAttribute('fileMatrix') == null) return;
		if (tag.getAttribute('fileMatrix') == 0) return;
		let name = tag.getAttribute('fileMatrix');
		tag.fileMatrixName = name;
		if (object.__filematrix_input__[name] == undefined) {
			tag.tag = [];
			object.__filematrix_input__[name] = {type: tag.type, tag: tag.tag, rel: atrribute}
			tag.rel = atrribute;
		}
		if (object.__filematrix_input__[name].tag.indexOf(tag) == -1) { 
			object.__filematrix_input__[name].tag.push(tag);
		}
	}

	this.initAttributeEvent = function(atrribute, tag) {
		// object.setRequireTag(atrribute, tag);
		object.setValidateTag(atrribute, tag);
		// object.setTimeSpanTag(atrribute, tag);
		// object.setFractionTag(atrribute, tag);
		object.initTagEvent(atrribute, tag);
		if (tag.tagName == 'INPUT' || tag.tagName == 'SELECT' || tag.tagName == 'TEXTAREA') object.__input__[atrribute] = tag;
		if (object.data == null || object.data == undefined || Object.keys(object.data).length == 0) return;
		let data = object.data;
		if (typeof(atrribute) == 'object') {
			for (let i=0; i < atrribute.length; i++) {
				if (data[atrribute[i]] == undefined) return;
				if (i == atrribute.length-1) {
					atrribute = atrribute[i];
					break;
				} else data = data[atrribute[i]];
			}
		}
		if (data[atrribute] == undefined) return;
		if (data._value == undefined) data._value = {};
		data._value[atrribute] = data[atrribute];
		if (data._tags == undefined) data._tags = {};
		if (data._tags[atrribute] == undefined) data._tags[atrribute] = []
		if (!data._tags[atrribute].includes(tag)) data._tags[atrribute].push(tag);
		
		Object.defineProperty(data, atrribute, {
			get: function(){
				return this._value[atrribute];
			},
			set: function(value){
				this._value[atrribute] = value;
				object.setValueFromTag(data._tags[atrribute], this._value[atrribute]);
			}
		});

		tag.onchange = function(event) {
			// console.log(this, data[atrribute]);
		}
	}

	this.getData = function(isShowOnly, isShowError, isVerifyHidden) {
		if (isShowOnly == undefined) isShowOnly = false;
		if (isShowError == undefined) isShowError = true;
		if (isVerifyHidden == undefined) isVerifyHidden = false;
		let isPass = true;
		let data = {};
		function verifyHidden(isHidden, isVerifyHidden) {
			if (!isHidden) return false;
			if (isHidden && isVerifyHidden) return false;
			return true;
		}
		
		for (let i in object.dom) {
			if(object.dom[i].getAttribute == undefined) continue;
			object.setRequireTag(i, object.dom[i]);
			object.setTimeSpanTag(i, object.dom[i]);
			object.setFractionTag(i, object.dom[i]);
			object.setCurrencyTag(i, object.dom[i]);
			object.setFileMatrixTag(i, object.dom[i]);
			object.setPositionTag(i, object.dom[i]);
		}
		for (let i in object.requireTag) {
			let isHidden = false;	
			if (!Array.isArray(object.requireTag[i].tag) && object.requireTag[i].tag.offsetParent == null)
				isHidden = true;
			if (isHidden && isShowOnly) continue;
			if (object.requireTag[i].tag.offsetParent != null) {
				let classList = object.requireTag[i].tag.offsetParent.classList;
				classList = new Array(...classList);
				isHidden = isHidden || classList.includes('hidden');
				if (isHidden && isShowOnly) continue;
			}
			let isVerify = verifyHidden(isHidden, isVerifyHidden);
			if (object.requireTag[i].type == 'text' || object.requireTag[i].type == 'password' || object.requireTag[i].type == "number" || object.requireTag[i].type == "email") {
				if (object.requireTag[i].tag.value.length == 0) {
					if (isShowError) object.requireTag[i].tag.classList.add('error');
					isPass = false || isVerify;
				} else {
					let isValid = true;
					if (object.requireTag[i].type == "number") {
						if(object.requireTag[i].tag.getAttribute('currency') != undefined) continue;
						data[i] = parseFloat(object.requireTag[i].tag.value);
					} else if(object.requireTag[i].type == "email") {
						isValid = object.validateEmail(object.requireTag[i].tag.value);
						isPass = (isPass & isValid) || isVerify;
						data[i] = object.requireTag[i].tag.value;
					} else if(object.requireTag[i].type == "password") {
						if(i.split('_').length == 2 && object.requireTag[`${i.split('_')[1]}`] != undefined){
							if(!object.requireTag[`${i.split('_')[1]}`].tag.classList.contains('error')){
								object.requireTag[`${i.split('_')[1]}`].tag.classList.add('error');
							}
							if(!object.requireTag[i].tag.classList.contains('error')){
								object.requireTag[i].tag.classList.add('error');
							}
							isValid = object.validatePassword(object.requireTag[`${i.split('_')[1]}`].tag.value, object.requireTag[i].tag.value);
							isPass = (isPass & isValid) || isVerify;
							if(isValid) object.requireTag[`${i.split('_')[1]}`].tag.classList.remove('error');
						}
					} else {
						data[i] = object.requireTag[i].tag.value;
					}
					if(isValid) object.requireTag[i].tag.classList.remove('error');
				}
			} else if (object.requireTag[i].type == 'select') {
				if (object.requireTag[i].tag.value == -1) {
					if (isShowError) object.requireTag[i].tag.classList.add('error');
					isPass = false || isVerify;
				} else {
					data[i] = parseInt(object.requireTag[i].tag.value);
					if (isNaN(data[i])) data[i] = object.requireTag[i].tag.value;
					object.requireTag[i].tag.classList.remove('error');
				}
			} else if (object.requireTag[i].type == 'radio') {
				let isChecked = false;
				let value = -1;
				for (let j in object.requireTag[i].tag) {
					if (object.requireTag[i].tag[j].checked) {
						isChecked = true;
						value = parseInt(object.requireTag[i].tag[j].getAttribute('value'));
					}
				}
				if (!isChecked) isPass = false || isVerify;
				else data[i] = value;
				for (let j in object.requireTag[i].tag) {
					let rel = object.requireTag[i].tag[j].getAttribute('rel');
					if (object.dom[rel+'Label'] != undefined) {
						if (isChecked) object.dom[rel+'Label'].classList.remove('error');
						else {
							if (isShowError) object.dom[rel+'Label'].classList.add('error');
						}
					}
				}
			} else if (object.requireTag[i].type == 'checkbox') {
				let isChecked = false;
				let value = [];
				for (let j in object.requireTag[i].tag) {
					if(object.requireTag[i].tag[j].classList.contains('hidden') && isShowOnly){
						isChecked = true;
						continue;
					}
					if (object.requireTag[i].tag[j].checked) {
						isChecked = true;
						value.push(parseInt(object.requireTag[i].tag[j].getAttribute('value')));
					}
				}
				if (!isChecked) isPass = false || isVerify;
				else data[i] = value;
				for (let j in object.requireTag[i].tag) {
					let rel = object.requireTag[i].tag[j].getAttribute('rel');
					if (object.dom[rel+'Label'] != undefined) {
						if (isChecked) object.dom[rel+'Label'].classList.remove('error');
						else { 
							if (isShowError) object.dom[rel+'Label'].classList.add('error');
						}
					}
				}
			} else if (object.requireTag[i].type == 'datetime-local') {
				if (object.requireTag[i].tag.value.length == 0) {
					isPass = false;
					object.requireTag[i].tag.classList.add('error');
				} else {
					let value = object.requireTag[i].tag.value;
					if (value.length == 0) continue;
					value = value+':00';
					data[i] = value.replace('T', ' ');
					object.requireTag[i].tag.classList.remove('error');
				}
			} else if (object.requireTag[i].type == 'date') {
				if (object.requireTag[i].tag.value.length == 0) {
					isPass = false;
					object.requireTag[i].tag.classList.add('error');
				} else {
					let value = object.requireTag[i].tag.value;
					if (value.length == 0) continue;
					object.requireTag[i].tag.classList.remove('error');
				}
			} else if (object.requireTag[i].type == 'time') {
				if (object.requireTag[i].tag.value.length == 0) {
					isPass = false;
					object.requireTag[i].tag.classList.add('error');
				} else {
					data[i] = object.requireTag[i].tag.value;
					object.requireTag[i].tag.classList.remove('error');
				}
			} else if (object.requireTag[i].type == 'textarea') {
				if (object.requireTag[i].tag.value.length == 0) {
					object.requireTag[i].tag.classList.add('error');
					isPass = false;
				} else {
					data[i] = object.requireTag[i].tag.value;
					object.requireTag[i].tag.classList.remove('error');
				}
			} else if (object.requireTag[i].type == 'div' && object.requireTag[i].tag.quill != undefined) {
				let hasText = !!object.getValueFromTag(object.requireTag[i].tag).replace(/(<([^>]+)>)/ig, "").length;
				if (!hasText) {
					object.requireTag[i].tag.classList.add('error');
					isPass = false;
				} else {
					data[i] = object.requireTag[i].tag.value;
					object.requireTag[i].tag.classList.remove('error');
				}
			}
		}
		for (let i in object.validateTag) {
			let tag = object.validateTag[i];
			if (tag.type == 'number') {
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
		for (let i in object.__autocomplete__) {
			let tag = object.__autocomplete__[i];
			if (tag.value.length > 0) data[i] = tag.currentValue;
		}
		data = object.getTimeSpanValue(data);
		data = object.getFractionValue(data);
		data = object.getCurrencyValue(data);
		data = object.getPositionValue(data);
		let file = new FormData();
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
		file = object.getFileMatrixValue(file);
		return {isPass, data, file}
	}
	
	// TODO - Fix recursive dom object
	this.getAllData = function(isShowOnly, isShowError) {
		if (isShowOnly == undefined) isShowOnly = false;
		if (isShowError == undefined) isShowError = true;
		let data = {};
		let isPass = true;
		isPass = object.getDataRecursive(isShowOnly, isShowError, data, object.__input__, isPass);
		return {isPass, data}
	}

	this.getDataRecursive = function(isShowOnly, isShowError, data, input, isPass) {
		for (let i in input) {
			if (Array.isArray(input[i])) {
				if (data[i] == undefined) data[i] = [];
				for (let j in input[i]) {
					let item = {};
					data[i].push(item);
					isPass = isPass & object.getDataRecursive(isShowOnly, isShowError, item, input[i][j], isPass);
				}
			} else if (input[i].isRequired) {
				if (input[i].tag.offsetParent == null) {
					input[i].tag.classList.remove('error');
					continue;
				}
				let classList = input[i].tag.offsetParent.classList;
				classList = new Array(...classList);
				if ((input[i].tag.offsetParent == null || classList.includes('hidden')) && isShowOnly) continue;
				if (input[i].type == 'text' || input[i].type == 'password' || input[i].type == "number" || input[i].type == "email") {
					if (input[i].tag.value.length == 0) {
						if (isShowError) input[i].tag.classList.add('error');
						isPass = false;
					} else {
						let isValid = true;
						if (input[i].type == "number") {
							data[i] = parseFloat(input[i].tag.value);
						} else if(input[i].type == "email") {
							isPass = isPass & object.validateEmail(input[i].tag.value);
							data[i] = input[i].tag.value;
						} else if(input[i].type == "password") {
							if(i.split('_').length == 2 && input[`${i.split('_')[1]}`] != undefined){
								if(!input[`${i.split('_')[1]}`].tag.classList.contains('error')){
									input[`${i.split('_')[1]}`].tag.classList.add('error');
								}
								if(!input[i].tag.classList.contains('error')){
									input[i].tag.classList.add('error');
								}
								isValid = object.validatePassword(input[`${i.split('_')[1]}`].tag.value, input[i].tag.value);
								isPass = isPass & isValid
								if(isValid) input[`${i.split('_')[1]}`].tag.classList.remove('error');
							}
						} else {
							data[i] = input[i].tag.value;
						}
						if(isValid) input[i].tag.classList.remove('error');
					}
				} else if (input[i].tagName == 'SELECT') {
					if (input[i].tag.value == -1) {
						if (isShowError) input[i].tag.classList.add('error');
						isPass = false;
					} else {
						data[i] = parseInt(input[i].tag.value);
						if (isNaN(data[i])) data[i] = input[i].tag.value;
						input[i].tag.classList.remove('error');
					}
				} else if (input[i].type == 'radio') {
					let isChecked = false;
					let value = -1;
					for (let j in input[i].tag) {
						if (input[i].tag[j].checked) {
							isChecked = true;
							value = parseInt(input[i].tag[j].getAttribute('value'));
						}
					}
					if (!isChecked) isPass = false;
					else data[i] = value;
					for (let j in input[i].tag) {
						let rel = input[i].tag[j].getAttribute('rel');
						if (object.dom[rel+'Label'] != undefined) {
							if (isChecked) object.dom[rel+'Label'].classList.remove('error');
							else {
								if (isShowError) object.dom[rel+'Label'].classList.add('error');
							}
						}
					}
				} else if (input[i].type == 'checkbox') {
					let isChecked = false;
					let value = [];
					for (let j in input[i].tag) {
						if (input[i].tag[j].checked) {
							isChecked = true;
							value.push(parseInt(input[i].tag[j].getAttribute('value')));
						}
					}
					if (!isChecked) isPass = false;
					else data[i] = value;
					for (let j in input[i].tag) {
						let rel = input[i].tag[j].getAttribute('rel');
						if (object.dom[rel+'Label'] != undefined) {
							if (isChecked) object.dom[rel+'Label'].classList.remove('error');
							else { 
								if (isShowError) object.dom[rel+'Label'].classList.add('error');
							}
						}
					}
				} else if (input[i].type == 'textarea') {
					if (input[i].tag.value.length == 0) {
						input[i].tag.classList.add('error');
						isPass = false;
					} else {
						data[i] = input[i].tag.value;
						input[i].tag.classList.remove('error');
					}
				}
			} else {
				
				console.log(i);
				data[i] = object.getValueFromTag(input[i]);
			}
		}
		data = object.getTimeSpanValue(data);
		data = object.getFractionValue(data);
		data = object.getCurrencyValue(data);
		return isPass
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

	this.getFileMatrixValue = function(file){
		for(let name in object.__filematrix_input__){
			let tag = object.__filematrix_input__[name];
			for(let i in tag.tag){
				if(tag.tag[i][name] == undefined) continue;
				if(Array.isArray(tag.tag[i][name])){
					for(let j in tag.tag[i][name]){
						if(tag.tag[i][name][j].offsetParent == null) continue;
						if(tag.tag[i][name][j].files == undefined) {
							file.append(name, tag.tag[i][name][j].index);
							continue;
						};
						if(!tag.tag[i][name][j].files.length) continue;
						file.append(name, tag.tag[i][name][j].files[0]);
					}
				}else{
					if(tag.tag[i][name].offsetParent == null) continue;
					if(tag.tag[i][name].files == undefined) {
						file.append(name, tag.tag[i][name].index);
						continue;
					};
					if(!tag.tag[i][name].files.length) continue;
					file.append(name, tag.tag[i][name].files[0]);
				}
			}
		}
		return file;
	}

	this.initTagEvent = function(atrribute, tag) {
		tag.__dom__ = this;
		if (tag.tagName == 'LABEL') {
			if (atrribute.indexOf('Label') != -1) {
				let inputKey = atrribute.replace('Label', '');
				tag.onclick = function() {
					if (object.dom[inputKey] != undefined) {
						object.dom[inputKey].click();
					}
				}
			}
		}
		if (tag.tagName == 'SELECT') {
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
		tag.set = function(domObject, key) {
			if (key != undefined) {
				if (this[key] == undefined) this[key] = domObject.dom;
				object.localizeTag.push(...domObject.localizeTag);
				domObject.__parent__ = tag.__dom__;
				setInputRecursive(tag.__dom__, domObject, key);
				if (typeof(domObject) != 'object') return;
				if (domObject.localizeTag == undefined) {
					domObject.localizeTag = [];
					domObject.localizeTag.push(...domObject.localizeTag);
				}
				if (domObject.html == undefined) return;
				this.appendChild(domObject.html);
			}
		}
		tag.append = function(domObject, key, isReplace, assignObject) {
			if (assignObject == undefined) assignObject = this;
			let item;
			if (key != undefined) {
				if (isReplace == undefined) isReplace = false;
				if (isReplace) {
					assignObject[key] = domObject.dom;
				} else {
					if (assignObject[key] == undefined) assignObject[key] = [];
					assignObject[key].push(domObject.dom);
				}
				item = assignObject[key];
			} else {
				item = assignObject;
				for (let i in domObject.dom) {
					if (item[i] == undefined) {
						item[i] = domObject.dom[i];
					} else if (item[i].tagName != undefined) {
						item[i] = [item[i]];
						item[i].push(domObject.dom[i]);
					} else {
						if (!Array.isArray(item[i])) continue;
						item[i].push(domObject.dom[i]);
					}
				}
			}
			domObject.__parent__ = tag.__dom__;
			setInputRecursive(tag.__dom__, domObject, key);
			if (typeof(domObject) == 'string') {
				this.innerHTML += domObject;
				return;
			}
			if (domObject.localizeTag == undefined) {
				domObject.localizeTag = [];
				domObject.localizeTag.push(...domObject.localizeTag);
			}
			if (typeof(domObject) != 'object') return;
			if (domObject.html == undefined) return;
			this.appendChild(domObject.html);
		}

		// TODO - Fix recursive dom object
		function setInputRecursive(dom, child, key) {
			let input;
			let requiredTag;
			let timespanInput;
			if (key != undefined) {
				if (dom.__input__[key] == undefined) dom.__input__[key] = {};
				input = {};
				input = dom.__input__[key];
				if (dom.__require_input__[key] == undefined) dom.__require_input__[key] = {};
				requiredTag =  dom.__require_input__[key];
				if (dom.__timeSpan_input__[key] == undefined) dom.__timeSpan_input__[key] = {};
				timespanInput = dom.__timeSpan_input__[key];
			} else {
				input = dom.__input__;
				requiredTag = dom.__require_input__;
				timespanInput = dom.__timeSpan_input__;
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
				timespanInput[i] = child.__timeSpan_input__[i];
			}
			if (dom.__parent__ != undefined) setInputRecursive(dom.__parent__, child, key);
		}

		tag.prepend = function(domObject, key) {
			let item;
			if (key != undefined) {
				if (this[key] == undefined) this[key] = domObject.dom;
				else {
					if (!Array.isArray(this[key])) this[key] = [this[key]];
					this[key].unshift(domObject.dom);
				}
			} else {
				item = this;
				for (let i in domObject.dom) {
					if (item[i] == undefined) item[i] = domObject.dom[i];
					else if (item[i].tagName != undefined) {
						item[i] = [item[i]];
						item[i].unshift(domObject.dom[i]);
					} else {
						item[i].unshift(domObject.dom[i]);
					}
				}
			}
			if (domObject.localizeTag != undefined) object.localizeTag.push(...domObject.localizeTag);
			tag.insertBefore(domObject.html, tag.firstChild);
		}
		tag.hide = function() {
			this.classList.add('hidden');
		}
		tag.visibility = function(isVisibility) {
			if (isVisibility == undefined) return this.classList.contains('visibility-hidden');
			if (isVisibility) this.classList.remove('visibility-hidden');
			else this.classList.add('visibility-hidden');
		}
		tag.show = function() {
			this.classList.remove('hidden');
		}
		tag.toggle = function() {
			this.classList.toggle("hidden");
		}
		tag.html = function(html) {
			if (html == undefined) return this.innerHTML;
			if (this.dom) this.dom = {};
			if (tag.tagName == "DIV") {
				this.innerHTML = '';
				if (html.length == 0) return;
				if (typeof(html) == 'number') {
					this.innerHTML = html;
					return;
				}
				if (typeof(html) == 'string') {
					console.log(html);
					try {
						html = new DOMObject(html);
					} catch (error) {
						this.innerHTML = html;
						this.setAttribute('localize', html);
						object.renderLocalize();
						return;
					}
				}
				this.append(html);
			} else if (tag.tagName == "SELECT") {
				this.innerHTML = '';
				if (html.length == 0) return;
				if (typeof(html) == 'number') {
					this.innerHTML = html;
					return;
				}
				if (typeof(html) == 'string') {
					try {
						html = new DOMObject(html);
					} catch (error) {
						this.innerHTML = html;
						this.setAttribute('localize', html);
						object.renderLocalize();
						return;
					}
				}
				this.append(html);
			} else {
				this.innerHTML = '';
				if (html.length == 0) return;
				if (typeof(html) == 'number') {
					this.innerHTML = html;
					return;
				}
				if (typeof(html) == 'string') {
					try {
						html = new DOMObject(html);
					} catch (error) {
						this.innerHTML = html;
						this.setAttribute('localize', html);
						object.renderLocalize();
						return;
					}
				}
				this.append(html);
			}
			object.renderLocalize();
		}

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
			if(dom != undefined) dom.__autocomplete__[atrribute] = tag;
			else object.__autocomplete__[atrribute] = tag;
		}

		tag.getValue = function() {
			return object.getValueFromTag(tag);
		}

		tag.disable = function() {
			tag.disabled = true;
			tag.classList.add('disabled');
		}

		tag.readonly = function(){
			tag.disabled = true;
			tag.classList.add('readonly');
		}

		tag.enable = function() {
			tag.disabled = false;
			tag.classList.remove('disabled');
			tag.classList.remove('readonly');
		}
	}

	this.getValueFromTag = function(tag) {

		if (tag.tagName == "DIV") {
			if (tag.quill != undefined) {
				return tag.quill.root.innerHTML;
			} else {
				return tag.innerHTML;
			}
		} else if (tag.tagName == "SELECT") {
			return tag.value;
		} else if (tag.tagName == "INPUT") {
			if (tag.type == "text") return tag.value;
			if (tag.type == "password") return tag.value;
			if (tag.type == "number") {
				let value = parseFloat(tag.value);
				if (isNaN(value)) return 0;
				return value;
			}
			if (tag.type == "checkbox") return tag.checked;
			if (tag.type == "file") {

			}
			if (tag.type == 'datetime-local') {
				let value = tag.value;
				if (value.length == 0) return undefined;
				value = value+':00';
				value = value.replace('T', ' ');
				return value;
			}
			if (tag.type == 'date') {
				let value = tag.value;
				if (value.length == 0) return undefined;
				return value;
			}
			return tag.value;
		} else if (tag.tagName == "OPTION") {
			return tag.innerText;
		} else if (tag.tagName == "TEXTAREA") {
			return tag.value;
		}
	}

	this.setValueFromTag = function(tags, value) {
		for (let i in tags) {
			let tag = tags[i];
			object.setTagValue(tag, value);
		}
	}

	this.setTagValue = function(tag, value) {
		if (tag.tagName == "DIV") {
			if (tag.quill != undefined) {
				// const delta = tag.quill.clipboard.convert(value);
				// tag.quill.setContents(delta, 'silent');
				while(true){
					let start = value.indexOf('<figure');
					if(start == -1) break;
					let end = value.indexOf('>', start);
					value = value.substring(0, start) + value.substring(end+1, value.length);
				}
				value = value.replaceAll('</figure>', '');
				value = value.replaceAll('<!-- /wp:embed -->', '');
				value = value.replaceAll('<!-- wp:paragraph -->', '');
				value = value.replaceAll('<!-- /wp:paragraph -->', '');
				tag.quill.root.innerHTML = value;
			} else {
				tag.innerHTML = value;
			}
		} else if (tag.tagName == "SELECT") {
			tag.value = value;
		} else if (tag.tagName == "INPUT") {
			if (tag.type == 'datetime-local') {
				if(value){
					if (typeof(value) == 'string') {
						value = value.split(' ');
						value = value[0] + 'T' + value[1];
						tag.value = value;
					}
					if (typeof(value) == 'number') {
						let date = new Date(value * 1000.0);
						value = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().split('.')[0]
						tag.value = value;
					}
				}
			} else if (tag.type == 'checkbox') {
				tag.checked = Boolean(value);
			} else if (tag.type == 'file') {

			} else {
				tag.value = value;
			}
		} else if (tag.tagName == "OPTION") {
			tag.innerText = value;
		} else if (tag.tagName == "TEXTAREA") {
			tag.value = value;
		} else if (tag.tagName == "LABEL") {
			tag.innerHTML = value;
		} else if (tag.tagName == "TD") {
			tag.innerHTML = value;
		}
		// if (tag.onchange != undefined) tag.onchange();
	}

	this.resetTagValue = function(tag) {
		if (tag.tagName == "DIV") {
			tag.innerHTML = '';
		} else if (tag.tagName == "SELECT") {
			tag.selectedIndex = 0;
		} else if (tag.tagName == "INPUT") {
			if (tag.type == "text") tag.value = "";
			if (tag.type == "password") tag.value = "";
			if (tag.type == "number") tag.value = 0;
			if (tag.type == "checkbox") tag.checked = false;
			tag.value = "";
		} else if (tag.tagName == "TEXTAREA") {
			tag.value = "";
		}
		if (tag.onchange != undefined) tag.onchange();
	}

	this.fetchValueAutocomplete = async function(input, value, data) {
		if (GLOBAL.AUTOCOMPLETE_CACHE == undefined) GLOBAL.AUTOCOMPLETE_CACHE = {};
		this.cached = GLOBAL.AUTOCOMPLETE_CACHE;
		if (typeof(input.autocompleteObject.data) == 'string') {
			if (GET == undefined) return;
			if (value == undefined) return;
			if(`${value}` == '') return;
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
			if (!isCached) response = await POST(url, {'reference': value}, undefined, 'json', true);
			if (response.isSuccess) {
				if (!isCached) {
					if (this.cached[url] == undefined) this.cached[url] = {}
					this.cached[url][value] = {response: response, time: Date.now()};
				}
				input.value = response.label;
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

	this.setData = function(data, unset) {
		let dom = object.dom;
		this.rawData = JSON.parse(JSON.stringify(data));
		// if (Array.isArray(data)) this.rawData = Object.assign([], data);
		// else this.rawData = Object.assign({}, data);
		for (let i in object.dom) {
			if(object.dom[i].getAttribute == undefined) continue;
			object.setRequireTag(i, object.dom[i]);
			object.setTimeSpanTag(i, object.dom[i]);
			object.setFractionTag(i, object.dom[i]);
			object.setCurrencyTag(i, object.dom[i]);
			object.setFileMatrixTag(i, object.dom[i]);
			object.setPositionTag(i, object.dom[i]);
		}
		async function callPrerequisite(input, data) {
			if (input.onchange.constructor.name == 'AsyncFunction') {
				await input.onchange();
				for (let i in input.childInput) {
					if (data[i] == undefined) continue;
					object.setTagValue(input.childInput[i].input, data[i]);
					if (object.__input__[i] == undefined) continue;
					if (object.__input__[i].prerequisite != undefined && object.__input__[i].prerequisite && object.__input__[i].onchange != undefined) {
						callPrerequisite(object.__input__[i], data);
					}
				}
			} else {
				input.onchange();
			}
		}
		function getFileMatrixTemplate(column) {
			return `<tr rel="record">
						<td rel="${column}_column" style="vertical-align:middle;">
							<input type="text" rel="${column}">
						</td>
						<td style="vertical-align:middle;">
							<div class="flex center">
								<svg rel="view" style="width:20px;height:20px;cursor:pointer;" viewBox="0 0 24 24">
									<path fill="currentColor" d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z" />
								</svg>
							</div>
						</td>
						{{^isView}}
						<td style="vertical-align:middle;">
							<div class="flex center">
								<svg rel="delete" style="width:24px;height:24px;cursor:pointer;" viewBox="0 0 24 24">
									<path fill="#f00" d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"></path>
								</svg>
							</div>
						</td>
						{{/isView}}
					</tr>`
		}
		for (let i in data) {
			if (object.__timeSpan_input__[i] != undefined) {
				let tag = object.__timeSpan_input__[i];
				data[i] = parseInt(data[i])
				let hour = parseInt(data[i] / (60*60));
				let minute = parseInt((data[i] % (60 * 60)) / 60);
				let second = data[i] % 60;
				for (let i in tag.tag) {
					if (tag.tag[i].isHour) tag.tag[i].value = hour;
					else if (tag.tag[i].isMinute) tag.tag[i].value = minute;
					else if (tag.tag[i].isSecond) tag.tag[i].value = second;
				}
			} else if (object.__fraction_input__[i] != undefined) {
				if (data[i] == undefined) continue;
				let tag = object.__fraction_input__[i];
				let fraction = (new Fraction(data[i])).toString();
				let integer = data[i].split('.')[0] ;
				let decimal = data[i].split('.')[1] != undefined ? data[i].split('.')[1] : '0';
				for (let i in tag.tag) {
					tag.tag[i].value = fraction;
					// if (tag.tag[i].isInteger) tag.tag[i].value = integer;
					// else if (tag.tag[i].isDecimal) tag.tag[i].value = decimal;
				}
			} else if (object.__currency_input__[i] != undefined) {
				if (data[i] == undefined) continue;
				let tag = object.__currency_input__[i];
				let currency = (new Fraction(data[i].originString)).toString();
				let integer = currency.split('.')[0] ;
				let decimal = currency.split('.')[1] != undefined ? currency.split('.')[1] : '0';
				for (let i in tag.tag) {
					tag.tag[i].value = currency;
					// if (tag.tag[i].isInteger) tag.tag[i].value = integer;
					// else if (tag.tag[i].isDecimal) tag.tag[i].value = decimal;
				}
			} else if (object.__position_input__[i] != undefined) {
				let tag = object.__position_input__[i];
				let position = data[i];
				if (position == undefined) continue;
				for(let i in tag.tag){
					if (tag.tag[i].getAttribute('rel').indexOf('latitude') != -1) {
						tag.tag[i].value = position[0];
					} else if (tag.tag[i].getAttribute('rel').indexOf('longitude') != -1) {
						tag.tag[i].value = position[1];
					}
				}
			} else if (object.__autocomplete__[i] != undefined) {
				object.fetchValueAutocomplete(object.__autocomplete__[i], data[i], data);
			} else if (object.__filematrix_input__[i] != undefined) {
				let tbody = object.__filematrix_input__[i].tag[0];
				tbody.html('');
				let isView = tbody.getAttribute('isView');
				isView = isView != null ? true : false;
				let template = getFileMatrixTemplate(i);
				let items = JSON.parse(data[i]);
				let index = 0;
				function initFileMatrixEvent(tbody, tag, data, column) {
					if(tag.dom.delete){
						tag.dom.delete.onclick = async function() {
							SHOW_CONFIRM_DIALOG('คุณต้องการจะลบข้อมูลใช่หรือไม่', async function(){
								tag.html.remove();
								if(tbody[`${column}Removed`] == undefined) tbody[`${column}Removed`] = [];
								let index = tag.dom[column].index;
								tbody[`${column}Removed`].push(JSON.parse(data[column])[index][1]);
							});
						}
					}
					if(tag.dom.view){
						tag.dom.view.onclick = async function() {
							let url = tbody.getAttribute('url');
							console.log(url);
							if (url == undefined) return;
							if (url.length == 0) return;
							console.log(`${url}${data.id}/${tag.dom[column].index}`);
							let blob = await GET(`${url}${data.id}/${tag.dom[column].index}`, undefined, 'blob');
							await OPEN_FILE(blob);
						}
					}
				}
				if (items == null) continue;
				for (let item of items) {
					let tag = new DOMObject(template, {isView});
					tag.dom[i].value = item[0];
					tag.dom[i].index = index;
					if (isView) tag.dom[i].readonly();
					else tag.dom[i].disable();
					initFileMatrixEvent(tbody, tag, data, i)
					// if(tag.dom.delete){
					// 	tag.dom.delete.onclick = async function() {
					// 		tag.html.remove();
					// 	}
					// }
					// if(tag.dom.view){
					// 	tag.dom.view.onclick = async function() {
					// 		let url = tbody.getAttribute('url');
					// 		if (url == undefined) return
					// 		let blob = await GET(`${url}${data[i].id}${tag.dom[i].index}`, undefined, 'blob');
					// 		// await OPEN_FILE(blob);
					// 	}
					// }
					tbody.append(tag);
					index = index + 1;
				}
			} else if (dom[i] != undefined) {
				if(unset != undefined){
					if(unset.indexOf(i) != -1) continue;
				}
				if(dom[i].type == 'file'){
					if(data[i] == null || data[i] == '') continue;
					if (dom[`${i}_fileName`] == undefined) continue;
					dom[i].hasImage = true;
					dom[`${i}_fileName`].html(data[i]);
					dom[`${i}_originalImage`].src = dom[`${i}_originalImage`].src+data.id+`?${Date.now()}`;
					dom[`${i}_croppedImage`].src = dom[`${i}_croppedImage`].src+'/'+data.id+`?${Date.now()}`;
					dom[`${i}_preview`].classList.remove('disabled');
				}
				else if(typeof(data[i]) == 'object' && data[i] != null) object.setTagValue(dom[i], data[i].id);
				else object.setTagValue(dom[i], data[i]);
				if (dom[i].prerequisite != undefined && dom[i].prerequisite && dom[i].onchange != undefined) {
					callPrerequisite(dom[i], data);
				}
			} else if (object.__input__ != undefined && object.__input__[i] != undefined) {
				object.setTagValue(object.__input__[i], data[i]);
				if (object.__input__[i].prerequisite != undefined && object.__input__[i].prerequisite && object.__input__[i].onchange != undefined) {
					callPrerequisite(object.__input__[i], data);
				}
			}
		}
	}

	this.disable = function() {
		for (let i in object.dom) {
			if(!object.dom[i]) continue;
			if(!object.dom[i].disable) continue;
			if(!object.dom[i].type) continue;
			if(object.dom[`${i}_icon`]) object.dom[`${i}_icon`].hide();
			object.dom[i].disable();
			object.dom[i].classList.add('disabled')
		}
	}

	this.readonly = function() {
		for (let i in object.dom) {
			if(!object.dom[i]) continue;
			if(!object.dom[i].readonly) continue;
			if(!object.dom[i].type) continue;
			if(object.dom[`${i}_icon`]) object.dom[`${i}_icon`].hide();
			object.dom[i].readonly();
			object.dom[i].classList.add('readonly')
		}
	}

	this.enable = function() {
		for (let i in object.dom) {
			if(!object.dom[i]) continue;
			if(object.dom[`${i}_icon`]) object.dom[`${i}_icon`].show();
			object.dom[i].disabled = false;
			if(object.dom[i].classList == undefined) continue;
			object.dom[i].classList.remove('disabled');
			object.dom[i].classList.remove('readonly');
		}
	}

	this.clearData = function() {
		for (let i in object.dom) {
			if (object.dom[i].tagName == "DIV") continue;
			object.resetTagValue(object.dom[i]);
		}
	}

	this.init(template, data, isHTML);

	this.validateEmail = function(email){
		const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test(email);
	}

	this.validatePassword = function(password, confirmPassword){
		if(password.length < 8 && confirmPassword.length < 8) return false;
		return password === confirmPassword;
	}
}

DOMObject.prototype.toJSON = function() {
	return '';
}