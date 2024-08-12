let Autocomplete = function() {
	const object = this;

	object.autocompleteTag;
	object.currentFocus;
	
	object.isFetch = false;
	object.limit = -1;
	object.searchKeys = [];
	object.template = '';
	object.parameter = {};
	object.isTag = false;
	object.isInitEvent = false;

	object.currentTagValues = [];
	object.currentTagValueMap = {};

	object.tag = undefined;
	object.tagContainer = undefined;

	object.data;
	object.callback;

	this.init = function(tag, config) {
		object.create(tag);
		object.setConfig(config)
	}

	this.create = function(tag) {
		object.tag = tag;
		let label = object.tag.getAttribute("label");
		let template = `
		<div rel="modal">
			<div rel="container">
				<div rel="title" style="font-weight: bold;" localize>{{label}}</div>
				<input rel="input" type="text">
				<div rel="autocompleteTag" class="autocomplete-items"></div>
			</div>
		</div>
		`
		let dom = new DOMObject(template, {label});
		object.modal = dom.dom.modal;
		object.container = dom.dom.container;
		object.title = dom.dom.title;
		object.input = dom.dom.input;
		object.autocompleteTag = dom.dom.autocompleteTag;
		
		object.modal.style.height = "100vh";
		object.modal.style.width = "100vw";
		object.modal.style.position = "fixed";
		object.modal.style.top = "0px";
		object.modal.style.left = "0px";
		object.modal.style.zIndex = "2";
		object.modal.style.background = "rgb(135 135 135 / 50%)";
		object.modal.style.backdropFilter = "blur(8px) brightness(100%) saturate(50%)";
		object.modal.classList.add("hidden");
		object.tag.parentElement.appendChild(object.modal);
	}
	
	this.setConfig = function(config) {
		if (config != undefined) {
			if (config.isFetch != undefined) object.isFetch = config.isFetch;
			if (config.limit != undefined) object.limit = config.limit;
			if (config.searchKeys != undefined) object.searchKeys = config.searchKeys;
			if (config.template != undefined) object.template = config.template;
			if (config.parameter != undefined) object.parameter = config.parameter;
			if (config.isTag != undefined) object.isTag = config.isTag;
		}
		if (object.template == undefined || object.template.length == 0) object.template = "{{{label}}}";
		if (object.isFetch) object.autocomplete = object.autocompleteFetch;
		else object.autocomplete = object.autocompleteLocal;
	}

	this.setData = function(data, callback) {
		object.data = data;
		object.callback = callback;
	}

	this.clear = function() {
		if (object.tag) {
			if (object.isTag) {
				object.tag.currentValue = undefined;
				object.tag.value = '';
				object.currentTagValues = [];
				object.currentTagValueMap = {};
				object.tagContainer.innerHTML = "";
			} else {
				object.tag.currentValue = undefined;
				object.tag.value = '';	
			}
		}
	}

	this.getRenderedTemplate = function(value) {
		return AbstractInputUtil.prototype.getRenderedTemplate(value, object.template);
	}

	this.renderTag = async function(data, value, callback) {
		let isExists = true;
		if (object.currentTagValueMap[value.value] == undefined) {
			object.currentTagValueMap[value.value] = value;
			object.currentTagValues.push(value);
			isExists = false;
		}
		let isObject = typeof(value) == 'object';
		let valueLabel = "";
		if (isObject && object.template.length > 0) {
			valueLabel = Mustache.render(object.template, value);
		} else if (isObject) {
			valueLabel = value.label != undefined ? value.label: value;
		} else {
			valueLabel= value;
		}
		if (object.tagItemTemplate && !isExists) {
			let tagItem = Mustache.render(object.tagItemTemplate, value);
			let div = document.createElement('div');
			div.innerHTML = tagItem;
			let item = div.firstChild;
			let button = item.getElementsByClassName("delete")[0];
			object.tagContainer.appendChild(item);
			button.onclick = async function() {
				delete object.currentTagValueMap[value.value];
				let index = object.currentTagValues.indexOf(value);
				if (index != -1) {
					object.currentTagValues.splice(index, 1);
				}
				item.remove();
			}
		}
		if (callback != undefined) {
			let result = value;
			if (isObject) {
				result = JSON.parse(JSON.stringify(value));
				if (object.template.length > 0) result.template = Mustache.render(object.template, value);
			}
			callback(result, data);
		}
		if(object.tag.onchange) object.tag.onchange();
		object.closeAllLists();
	}

	this.renderLabel = async function(data, value, callback) {
		let isObject = typeof(value) == 'object';
		if (isObject && object.template.length > 0) {
			if(value.label) object.tag.value = Mustache.render('{{{label}}}', value);
			else object.tag.value = Mustache.render(object.template, value);
			object.tag.currentValue = value;
		} else if (isObject) {
			object.tag.value = value.label != undefined ? value.label: value;
		} else {
			object.tag.value = value;
		}
		if (callback != undefined) {
			let result = value;
			if (isObject) {
				result = JSON.parse(JSON.stringify(value));
				if (object.template.length > 0) result.template = Mustache.render(object.template, value);
			}
			callback(result, data);
		}
		if(object.tag.onchange) object.tag.onchange();
		object.closeAllLists();
	}

	this.renderFoundValue = function(data, key, value, callback) {
		let isArray = Array.isArray(data);
		let isObject = typeof(value) == 'object';
		let tag = document.createElement("DIV");
		tag.setAttribute("class", "item");
		if (object.template.length > 0) {
			let rendered = object.getRenderedTemplate(value);
			if(typeof rendered == 'string') tag.innerHTML = rendered;
			else tag.appendChild(rendered.html);
		} else {
			tag.innerHTML = value.label != undefined ? value.label: value;
		}
		let inputValue = value;
		if (isObject) inputValue = JSON.stringify(value);
		if (isArray) tag.innerHTML += "<input type='hidden' value='" + inputValue + "'>";
		else tag.innerHTML += "<input type='hidden' value='" + key + "'>";
		tag.addEventListener("click", function(e) {
			if (object.isTag) {
				object.renderTag(data, value, callback);
			} else {
				object.renderLabel(data, value, callback);
			}
			object.modal.classList.add('hidden');
		});
		object.autocompleteTag.appendChild(tag);
	}

	this.filter = function(data, val, callback) {
		let count = 0;
		for (let i in data) {
			if (object.limit != -1 && count == object.limit) break;
			if (object.searchKeys.length == 0) {
				if (val.length == 0) {
					object.renderFoundValue(data, i, data[i], callback);
					count += 1;
				} else if (typeof(data[i]) == 'object') {
					object.renderFoundValue(data, i, data[i], callback);
					count += 1;
				} else if (data[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
					object.renderFoundValue(data, i, data[i], callback);
					count += 1;
				}
			} else {
				for (let key in object.searchKeys) {
					if (val.length == 0) {
						object.renderFoundValue(data, i, data[i], callback);
						count += 1;
						break;
					} else if (data[i][object.searchKeys[key]] != undefined && data[i][object.searchKeys[key]].indexOf(val) != -1) {
						object.renderFoundValue(data, i, data[i], callback);
						count += 1;
						break;
					}
				}
			}
		}
	}

	this.setPosition = function() {
		// let rect = object.tag.getBoundingClientRect();
		// object.autocompleteTag.style.top = rect.bottom + "px";
		// object.autocompleteTag.style.left = rect.left + "px";
		// object.autocompleteTag.style.right = rect.right + "px";
		// object.autocompleteTag.style.width = (rect.right - rect.left)  + "px";

		object.modal.classList.remove("hidden");

		let rect = object.tag.getBoundingClientRect();
		object.container.style.position = 'fixed';
		object.container.style.borderRadius = "10px";
		object.container.style.top = isMobile() ? "10%": "20%";
		object.container.style.left = isMobile() ? "10%": "20%";
		object.container.style.right = isMobile() ? "10%": "20%";
		object.container.style.boxShadow = "var(--box-shadow)";
		object.container.style.background = "#ffffff";
		object.container.style.padding = "20px";
		object.container.style.display = "flex";
		object.container.style.flexDirection = "column";
		object.container.style.gap = "10px";
		object.autocompleteTag.style.maxHeight = isMobile() ? "70vh": "55vh";
		object.input.focus();


		let fontSize = window.getComputedStyle(object.tag).fontSize;
		object.autocompleteTag.style.fontSize = fontSize;
	}

	this.autocompleteLocal = function() {
		if (object.isInitEvent) return;
		function trigger() {
			object.setPosition();
			object.autocompleteTag.innerHTML = '';
			let val = object.tag.value;
			object.closeAllLists();
			object.currentFocus = -1;
			object.filter(object.data, val, object.callback);
		}
		object.tag.addEventListener("input", function(e) {
			trigger();
		});
		object.tag.addEventListener("click", function(e) {
			trigger();
		});
		object.setKeyDown();
		object.isInitEvent = true;
	}

	this.autocompleteFetch = function() {
		if (object.isInitEvent) return;
		async function trigger() {
			object.setPosition();
			object.autocompleteTag.innerHTML = '';
			let val = object.input.value;
			object.closeAllLists();
			object.currentFocus = -1;
			if (object.data.constructor.name == 'AsyncFunction') {
				let data = await object.data(val, object.limit, object.parameter);
				object.autocompleteTag.innerHTML = '';
				if (data == null || data == undefined) return;
				object.filter(data, val, object.callback);
			} else {
				if(typeof(object.data) == 'string'){
					let data = {
						name: val,
						limit: object.limit,
						parameter: object.parameter,
						template: object.template
					}
					let response = await POST(object.data, data);
					object.autocompleteTag.innerHTML = '';
					let result;
					if (response.results != null && response.results != undefined) {
						console.log(`*** DEPRECATED: 'results' should not be used@${object.data}.`);
						result = response.results;
					} else if (response.result != null && response.result != undefined) {
						result = response.result;
					}
					if (result == undefined) return;
				   	object.filter(result, val, object.callback);
				}else{
					object.data(val, object.limit, object.parameter, function(data) {
						object.autocompleteTag.innerHTML = '';
						if (data == null || data == undefined) return;
						object.filter(data, val, object.callback);
					});
				}
			}
		}
		object.tag.addEventListener("input", async function(e) {
			await trigger();
		});
		object.tag.addEventListener("click", async function(e) {
			object.input.value = object.tag.value;
			await trigger();
		});
		object.input.addEventListener("input", async function(e) {
			await trigger();
		});
		object.input.addEventListener("click", async function(e) {
			await trigger();
		});
		object.setKeyDown();
		object.isInitEvent = true;
	}

	this.fetch = async function(val) {
		let data = {
			name: val,
			limit: object.limit,
			parameter: object.parameter
		}
		let response = await POST(object.data, data);
		object.autocompleteTag.innerHTML = '';
		let result;
		if (response.results != null && response.results != undefined){
			console.log(`*** DEPRECATED: 'results' should not be used@${object.data}.`);
			result = response.results;
		}else if (response.result != null && response.result != undefined){
			result = response.result;
		}
		return result;
	}

	this.setKeyDown = function() {
		function handler(e) {
			let x = object.autocompleteTag;
			if (x) x = x.getElementsByTagName("div");
			if (e.keyCode == 40) {
				object.currentFocus++;
				object.addActive(x);
			} else if (e.keyCode == 38) {
				object.currentFocus--;
				object.addActive(x);
			} else if (e.keyCode == 13) {
				e.preventDefault();
				if (object.currentFocus > -1) {
					if (x) x[object.currentFocus].click();
				}
			}
		}
		object.tag.addEventListener("keydown", handler);
		object.input.addEventListener("keydown", handler);
		document.addEventListener("click", function (e) {
			object.closeAllLists(e.target);
			if (e.target == object.modal) {
				object.modal.classList.add('hidden');
			}
		});
	}

	this.addActive = function(x) {
		if (!x) return false;
		object.removeActive(x);
		if (object.currentFocus >= x.length) object.currentFocus = 0;
		if (object.currentFocus < 0) object.currentFocus = (x.length - 1);
		x[object.currentFocus].classList.add("autocomplete-active");
	}
	this.removeActive = function(x) {
		for (let i = 0; i < x.length; i++) {
		  x[i].classList.remove("autocomplete-active");
		}
	}
	this.closeAllLists = function(element) {
		if (element != object.autocompleteTag && element != object.tag) {
			object.autocompleteTag.innerHTML = '';
		}
	}
}