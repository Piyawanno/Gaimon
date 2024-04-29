let InputGetterState = function(parent, isShowOnly, isShowError, isVerifyHidden){
	let object = this;
	this.parent = parent;
	this.isShowOnly = isShowOnly;
	this.isShowError = isShowError;
	this.isVerifyHidden = isVerifyHidden;

	this.message = [];
	this.isContinue = false;
	this.isVerify = true;
	this.isPass = true;

	this.getRequiredData = function(data){
		let requiredTag = object.parent.requireTag;
		for (let name in requiredTag) {
			let input = requiredTag[name];
			object.isContinue = false;
			object.isVerify = true;
			object.getHidden(data, input, name);
			if (object.isContinue) continue;
			let isQuill = input.type == 'div' && input.tag.quill != undefined;
			if (input.type == 'text') object.getText(data, input, name);
			else if (input.type == 'password') object.getText(data, input, name);
			else if (input.type == 'number') object.getText(data, input, name);
			else if (input.type == 'email') object.getText(data, input, name);
			else if (input.type == 'select') object.getSelect(data, input, name);
			else if (input.type == 'radio') object.getRadio(data, input, name);
			else if (input.type == 'checkbox') object.getCheckBox(data, input, name);
			else if (input.type == 'datetime-local') object.getDateTimeLocal(data, input, name);
			else if (input.type == 'date') object.getDate(data, input, name);
			else if (input.type == 'time') object.getTime(data, input, name);
			else if (input.type == 'textarea') object.getTextArea(data, input, name);
			else if (isQuill) object.getQuill(data, input, name);
		}
	}

	this.getRecursiveData = function(data, input){
		let parent = object.parent;
		for (let i in input) {
			object.name = i;
			object.input = input[i];
			if (Array.isArray(input[i])) object.getArray(data, input[i], i);
			else if (input[i].isRequired) object.getRequiredRecursiveData(data, input[i], i);
			else  data[i] = parent.getValueFromTag(input[i]);
		}
		data = parent.getTimeSpanValue(data);
		data = parent.getFractionValue(data);
		data = parent.getCurrencyValue(data);
		return object.isPass;
	}

	this.getRequiredRecursiveData = function(data, input, name){
		if (input.tag.offsetParent == null) {
			input.tag.classList.remove('error');
			return;
		}
		let classList = input.tag.offsetParent.classList;
		classList = new Array(...classList);
		let notOffset = input.tag.offsetParent == null;
		let isHidden = classList.includes('hidden')
		if ((notOffset || isHidden) && object.isShowOnly) return;
		if (input.type == 'text') object.getText(data, input, name);
		else if (input.tagName == 'password') object.getText(data, input, name);
		else if (input.tagName == 'number') object.getText(data, input, name);
		else if (input.tagName == 'email') object.getText(data, input, name);
		else if (input.tagName == 'SELECT') object.getSelect(data, input, name);
		else if (input.type == 'radio') object.getRadio(data, input, name)
		else if (input.type == 'checkbox') object.getCheckBox(data, input, name);
		else if (input.type == 'textarea') object.getAreaText(data, input, name)
	}

	this.getArrayData = function(data, input, name){
		if (data[name] == undefined) data[name] = [];
		for (let j in input) {
			let item = {};
			data[name].push(item);
			object.getRecursiveData(item, input[j]);
		}
	}

	this.getHidden = function(data, input, name){
		let isHidden = false;
		if (!Array.isArray(input.tag) && input.tag.offsetParent == null){
			isHidden = true;
		}
		if (isHidden && object.isShowOnly){
			object.isContinue = true;
			return;
		}
		if (input.tag.offsetParent != null) {
			let classList = input.tag.offsetParent.classList;
			classList = new Array(...classList);
			isHidden = isHidden || classList.includes('hidden');
			if (isHidden && object.isShowOnly){
				object.isContinue = true;
				return;
			}
		}
		if (input.type == 'checkbox' || input.type == 'radio') {
			for(let i in input.tag){
				if(input.tag[i].offsetParent == null) isHidden = true;
			}
		}
		if (!isHidden) object.isVerify = false;
		if (isHidden && object.isVerifyHidden) object.isVerify = false;
	}

	this.getText = function(data, input, name){
		let isPass = object.isPass;
		let isVerify = object.isVerify;
		if (input.tag.value.length == 0) {
			if (object.isShowError) input.tag.classList.add('error');
			isPass = false || isVerify;
			if(!isPass){
				let label = input.tag.__dom__.data.label;
				let message;
				if(label == undefined) message = 'The required field is not filled.';
				else message = `The required field (${label}) is not filled.`
				object.message.push(message);
			}
		} else {
			let isValid = true;
			if (input.type == "number") {
				if(input.tag.getAttribute('currency') != undefined){
					return;
				}
				data[name] = parseFloat(input.tag.value);
			} else if(input.type == "email") {
				isValid = object.parent.validateEmail(input.tag.value);
				isPass = (isPass & isValid) || isVerify;
				if(!isPass){
					let label = input.tag.__dom__.data.label;
					let message;
					if(label == undefined) message = 'Email address is not conformed';
					else message = `Email address is not conformed (${label}).`
					object.message.push(message);
				}
				data[name] = input.tag.value;
			} else if(input.type == "password") {
				object.getPassword(data, input, name);
			} else {
				data[name] = input.tag.value;
			}
			if(isValid) input.tag.classList.remove('error');
		}
		object.isPass = isPass;
	}

	this.getPassword = function(data, input, name){
		let isPass = object.isPass;
		let isVerify = object.isVerify;
		if(name.split('_').length == 2 && object.parent.requireTag[`${name.split('_')[1]}`] != undefined){
			if(!object.parent.requireTag[`${name.split('_')[1]}`].tag.classList.contains('error')){
				object.parent.requireTag[`${name.split('_')[1]}`].tag.classList.add('error');
			}
			if(!input.tag.classList.contains('error')){
				input.tag.classList.add('error');
			}
			isValid = object.parent.validatePassword(object.parent.requireTag[`${name.split('_')[1]}`].tag.value, input.tag.value);
			if(!isValid) object.message.push('Password is invalid.')
			isPass = (isPass & isValid) || isVerify;
			if(isValid) object.parent.requireTag[`${name.split('_')[1]}`].tag.classList.remove('error');
		}else{
			isValid = object.parent.validatePassword(input.tag.value);
			isPass = (isPass & isValid) || isVerify;
			if(isValid) input.tag.classList.remove('error');
			if(!isValid) object.message.push('Password is invalid.')
		}
		object.isPass = isPass;
	}

	this.getSelect = function(data, input, name){
		if (input.tag.value == -1) {
			if (object.isShowError) input.tag.classList.add('error');
			let label = input.tag.__dom__.data.label;
			let message;
			if(label == undefined) message = 'Option is not selected.';
			else message = `Option (${label}) is not selected.`
			object.message.push(message);
			object.isPass = false || object.isVerify;
		} else {
			data[name] = parseInt(input.tag.value);
			if (isNaN(data[name])) data[name] = input.tag.value;
			input.tag.classList.remove('error');
		}
	}

	this.getRadio = function(data, input, name){
		let isChecked = false;
		let value = -1;
		for (let j in input.tag) {
			if (input.tag[j].checked) {
				isChecked = true;
				value = parseInt(input.tag[j].getAttribute('value'));
			}
		}
		if (!isChecked){
			object.isPass = false || object.isVerify;
			let message;
			if(input.tag.__dom__ != undefined){
				let label = input.tag.__dom__.data.label;
				if(label == undefined) message = 'Radio option is not selected.';
				else message = `Radio option (${label}) is not selected.`
				
			}else{
				message = 'Radio option is not selected.';
			}
			object.message.push(message);			
		}else{
			data[name] = value;
		}
		for (let j in input.tag) {
			let rel = input.tag[j].getAttribute('rel');
			if (object.parent.dom[rel+'Label'] != undefined) {
				if (isChecked){
					object.parent.dom[rel+'Label'].classList.remove('error');
				}else {
					if (object.isShowError){
						object.parent.dom[rel+'Label'].classList.add('error');
					}
				}
			}
		}
	}

	this.getCheckBox = function(data, input, name){
		let isChecked = false;
		let value = [];
		for (let j in input.tag) {
			if(input.tag[j].classList && input.tag[j].classList.contains('hidden') && object.isShowOnly){
				isChecked = true;
				continue;
			}
			if (input.tag[j].checked) {
				isChecked = true;
				value.push(parseInt(input.tag[j].getAttribute('value')));
			}
		}
		if (!isChecked){
			object.isPass = false || object.isVerify;
			let message;
			if(input.tag.__dom__ != undefined){
				let label = input.tag.__dom__.data.label;
				if(label == undefined) message = 'Checkbox option is not selected.';
				else message = `Checkbox option (${label}) is not selected.`
				
			}else{
				message = 'Checkbox option is not selected.';
			}
			object.message.push(message);
		}else{
			data[name] = value;
		}
		for (let j in input.tag) {
			let rel = input.tag[j].getAttribute('rel');
			if (object.parent.dom[rel+'Label'] != undefined) {
				if (isChecked){
					object.parent.dom[rel+'Label'].classList.remove('error');
				} else { 
					if (object.isShowError) object.parent.dom[rel+'Label'].classList.add('error');
				}
			}
		}
	}

	this.getDateTimeLocal = function(data, input, name){
		if (input.tag.value.length == 0) {
			object.isPass = false;
			input.tag.classList.add('error');
			let label = input.tag.__dom__.data.label;
			let message;
			if(label == undefined) message = 'Date time is not set.';
			else message = `Date time (${label}) is not set.`
			object.message.push(message);
		} else {
			let value = input.tag.value;
			if (value.length == 0) return;
			value = value+':00';
			data[name] = value.replace('T', ' ');
			input.tag.classList.remove('error');
		}
	}

	this.getDate = function(data, input, name){
		if (input.tag.value.length == 0) {
			object.isPass = false || object.isVerify;
			let label = input.tag.__dom__.data.label;
			let message;
			if(label == undefined) message = 'Date is not set.';
			else message = `Date (${label}) is not set.`
			object.message.push(message);
			input.tag.classList.add('error');
		} else {
			let value = input.tag.value;
			if (value.length == 0) return;
			/// TODO Why no value set.
			input.tag.classList.remove('error');
		}
	}

	this.getTime = function(data, input, name){
		if (input.tag.value.length == 0) {
			object.isPass = false;
			input.tag.classList.add('error');
			let label = input.tag.__dom__.data.label;
			let message;
			if(label == undefined) message = 'Time is not set.';
			else message = `Time (${label}) is not set.`
			object.message.push(message);
		} else {
			data[name] = input.tag.value;
			input.tag.classList.remove('error');
		}
	}

	this.getTextArea = function(data, input, name){
		if (input.tag.value.length == 0) {
			input.tag.classList.add('error');
			object.isPass = false;
			let label = input.tag.__dom__.data.label;
			let message;
			if(label == undefined) message = 'No text in text area.';
			else message = `No text in text area (${label}).`
			object.message.push(message);
		} else {
			data[name] = input.tag.value;
			input.tag.classList.remove('error');
		}
	}

	this.getQuill = function(data, input, name){
		let hasText = !!object.parent.getValueFromTag(input.tag).replace(/(<([^>]+)>)/ig, "").length;
		if (!hasText) {
			input.tag.classList.add('error');
			object.isPass = false;
			object.message.push('');
			let label = input.tag.__dom__.data.label;
			let message;
			if(label == undefined) message = 'No text in text area.';
			else message = `No text in text area (${label}).`
			object.message.push(message);
		} else {
			data[name] = input.tag.value;
			input.tag.classList.remove('error');
		}
	}
}