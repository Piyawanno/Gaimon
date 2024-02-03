let DOMObject = function(template, data, isHTML, isInit) {
	let object = this;
	
	this.html;
	this.dom;
	this.rawData;
	this.data;
	this.requireTag = {};
	this.validateTag = {};
	this.localizeTag = [];
	
	if (window.LOCALE == undefined) window.LOCALE = {};

	this.init = function(template, data, isHTML) {
		if (data == undefined) data = {};
		if (isHTML == undefined) isHTML = false;
		this.rawData = JSON.parse(JSON.stringify(data, function replacer(key, value) {
			try {
				JSON.stringify(value);
				return value;
			} catch (error) {
				return null;
			}
		}));

		this.data = data;
		if (!isHTML) {
			let text = Mustache.render(template, data);
			this.html = this.createElement(text);
		}
		if (this.html == null) return;
		this.dom = this.getObject(this.html);
		object.initTagEvent('', object.html);
		object.renderLocalize();
		object.creator = DOMObject;
	}

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
		let tag = {};
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
		} else if (tag.tagName == 'SPAN') {
			return tag.innerHTML;
		} else if (tag.tagName == 'A') {
			return tag.innerHTML;
		} else if (tag.tagName == 'P') {
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

	this.initAttributeEvent = function(attribute, tag) {
		object.initTagEvent(attribute, tag);
	}

	this.setTagRecursiveEvent = function(dom, child, key){
	}

	this.initTagEvent = function(attribute, tag) {
		tag.__dom__ = this;
		tag.set = function(domObject, key) {
			if (key != undefined) {
				if (this[key] == undefined) this[key] = domObject.dom;
				object.localizeTag.push(...domObject.localizeTag);
				domObject.__parent__ = tag.__dom__;
				object.setTagRecursiveEvent(tag.__dom__, domObject, key);
				if (typeof(domObject) != 'object') return;
				if (domObject.localizeTag == undefined) {
					domObject.localizeTag = [];
					domObject.localizeTag.push(...domObject.localizeTag);
				}
				if (domObject.html == undefined) return;
				this.appendChild(domObject.html);
			}
		}
		tag.append = function(child, key, isReplace, assignObject) {
			if (assignObject == undefined) assignObject = this;
			let item;
			if (key != undefined) {
				if (isReplace == undefined) isReplace = false;
				if (isReplace) {
					assignObject[key] = child.dom;
				} else {
					if (assignObject[key] == undefined) assignObject[key] = [];
					assignObject[key].push(child.dom);
				}
				item = assignObject[key];
			} else {
				item = assignObject;
				for (let i in child.dom) {
					if (item[i] == undefined) {
						item[i] = child.dom[i];
					} else if (item[i].tagName != undefined) {
						item[i] = [item[i]];
						item[i].push(child.dom[i]);
					} else {
						if (!Array.isArray(item[i])) continue;
						item[i].push(child.dom[i]);
					}
				}
			}
			child.__parent__ = tag.__dom__;
			object.setTagRecursiveEvent(tag.__dom__, child, key);
			if (typeof(child) == 'string') {
				this.innerHTML += child;
				return;
			}
			if (child.localizeTag == undefined) {
				child.localizeTag = [];
				child.localizeTag.push(...child.localizeTag);
			}
			if (typeof(child) != 'object') return;
			if (child.html == undefined) return;
			this.appendChild(child.html);
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
			// console.log(object, object.creator);
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
					try {
						html = new object.creator(html);
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
						html = new object.creator(html);
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
						html = new object.creator(html);
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

	this.replaceAllSpacing = function(element){
		for (let childNode of element.childNodes) {
			if (childNode.nodeType === Node.TEXT_NODE) {
				childNode.data = childNode.data.replace(/ /g, '\u00a0'); // &nbsp;
				continue
			}	
			object.replaceAllSpacing(childNode)
		}
	}

	this.getValueFromTag = function(tag) {
		if (tag.tagName == "DIV") {
			if (tag.quill != undefined) {
				object.replaceAllSpacing(tag.quill.root);
				let html = tag.quill.root.innerHTML;
				return html;
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
			// tag.innerText = value; // BUG JSONColumn SelectInput
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

	this.validateEmail = function(email){
		const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test(email);
	}

	this.validatePassword = function(password, confirmPassword = undefined){
		if(password.length < 8 && confirmPassword == undefined) return false;
		else if(password.length >= 8 && confirmPassword == undefined) return true;
		else if(password.length < 8 && confirmPassword.length < 8) return false;
		return password === confirmPassword;
	}

	if(isInit == undefined || isInit) this.init(template, data, isHTML);
}

DOMObject.prototype.toJSON = function() {
	return '';
}