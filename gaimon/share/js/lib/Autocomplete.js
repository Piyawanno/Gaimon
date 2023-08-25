let Autocomplete = function() {
	const object = this;

	object.autocompleteTag;
	object.currentFocus;
	
	object.isFetch = false;
	object.limit = -1;
	object.searchKeys = [];
	object.template = '';
	object.parameter = {};

	object.data;
	object.callback;

	this.init = function(tag, config) {
		if (config != undefined) {
			if (config.isFetch != undefined) object.isFetch = config.isFetch;
			if (config.limit != undefined) object.limit = config.limit;
			if (config.searchKeys != undefined) object.searchKeys = config.searchKeys;
			if (config.template != undefined) object.template = config.template;
			if (config.parameter != undefined) object.parameter = config.parameter;
		}
		object.tag = tag;
		object.autocompleteTag = document.createElement("DIV");
		object.autocompleteTag.setAttribute("class", "autocomplete-items");
		let body = document.getElementsByTagName('body')[0];
		body.appendChild(object.autocompleteTag);
		if (object.isFetch) object.autocomplete = object.autocompleteFetch;
		else object.autocomplete = object.autocompleteLocal;
	}

	this.setData = function(data, callback) {
		object.data = data;
		object.callback = callback;
	}

	this.renderFoundValue = function(data, key, value, callback) {
		let isArray = Array.isArray(data);
		let isObject = typeof(value) == 'object';
		let tag = document.createElement("DIV");
		tag.setAttribute("class", "item");
		if (object.template.length > 0) {
			tag.innerHTML = Mustache.render(object.template, value);
		} else {
			tag.innerHTML = value;
		}
		let inputValue = value;
		if (isObject) inputValue = JSON.stringify(value);
		if (isArray) tag.innerHTML += "<input type='hidden' value='" + inputValue + "'>";
		else tag.innerHTML += "<input type='hidden' value='" + key + "'>";
		tag.addEventListener("click", function(e) {
			object.tag.currentValue = tag.getElementsByTagName("input")[0].value;
			object.tag.value = tag.getElementsByTagName("input")[0].value;			
			if (isObject && object.template.length > 0) {
				object.tag.value = Mustache.render(object.template, value);
				object.tag.currentValue = value;
			}
			if (callback != undefined) {
				let result = tag.getElementsByTagName("input")[0].value;
				if (isObject) {
					result = JSON.parse(result);
					if (object.template.length > 0) {
						result.template = Mustache.render(object.template, value);
					}
				}
				callback(result, data);
			}
			if(object.tag.onchange) {
				object.tag.onchange();
			}
			object.closeAllLists();
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

	this.autocompleteLocal = function() {
		object.tag.addEventListener("input", function(e) {
			let rect = object.tag.getBoundingClientRect();
			object.autocompleteTag.style.top = rect.bottom + "px";
			object.autocompleteTag.style.left = rect.left + "px";
			object.autocompleteTag.style.right = rect.right + "px";
			object.autocompleteTag.style.width = (rect.right - rect.left)  + "px";
			object.autocompleteTag.innerHTML = '';
			let val = object.tag.value;
			object.closeAllLists();
			object.currentFocus = -1;
			object.filter(object.data, val, object.callback);
		});
		object.tag.addEventListener("click", function(e) {
			let rect = object.tag.getBoundingClientRect();
			object.autocompleteTag.style.top = rect.bottom + "px";
			object.autocompleteTag.style.left = rect.left + "px";
			object.autocompleteTag.style.right = rect.right + "px";
			object.autocompleteTag.style.width = (rect.right - rect.left)  + "px";
			object.autocompleteTag.innerHTML = '';
			let val = object.tag.value;
			object.closeAllLists();
			object.currentFocus = -1;
			object.filter(object.data, val, object.callback);
		});
		object.setKeyDown();
	}

	this.autocompleteFetch = function() {
		object.tag.addEventListener("input", async function(e) {
			let rect = object.tag.getBoundingClientRect();
			object.autocompleteTag.style.top = rect.bottom + "px";
			object.autocompleteTag.style.left = rect.left + "px";
			object.autocompleteTag.style.right = rect.right + "px";
			object.autocompleteTag.style.width = (rect.right - rect.left)  + "px";
			object.autocompleteTag.innerHTML = '';
			let val = object.tag.value;
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
						parameter: object.parameter
					}
					let response = await POST(object.data, data);
					console.log(response);
					object.autocompleteTag.innerHTML = '';
					let result;
					if (response.results != null && response.results != undefined) result = response.results;
					else if (response.result != null && response.result != undefined) result = response.result;
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
		});
		object.tag.addEventListener("click", async function(e) {
			let rect = object.tag.getBoundingClientRect();
			object.autocompleteTag.style.top = rect.bottom + "px";
			object.autocompleteTag.style.left = rect.left + "px";
			object.autocompleteTag.style.right = rect.right + "px";
			object.autocompleteTag.style.width = (rect.right - rect.left)  + "px";
			object.autocompleteTag.innerHTML = '';
			let val = object.tag.value;
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
						parameter: object.parameter
					}
					let response = await POST(object.data, data);
					object.autocompleteTag.innerHTML = '';
					let result;
					if (response.results != null && response.results != undefined) result = response.results;
					else if (response.result != null && response.result != undefined) result = response.result;
					if (result == undefined) return;
				   object.filter(result, val, object.callback);
				}else{
					object.data(val, object.limit, object.parameter, function(data) {
						object.autocompleteTag.innerHTML = '';
						if (data == null || data == undefined) return;
						object.filter(data, val, object.callback);
					})
				}
			}
		});
		object.setKeyDown();
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
		if (response.results != null && response.results != undefined) result = response.results;
		else if (response.result != null && response.result != undefined) result = response.result;
		return result;
	}

	this.setKeyDown = function() {
		object.tag.addEventListener("keydown", function(e) {
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
		});
		document.addEventListener("click", function (e) {
			object.closeAllLists(e.target);
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
	this.closeAllLists = function(elmnt) {
		if (elmnt != object.autocompleteTag && elmnt != object.tag) {
			object.autocompleteTag.innerHTML = '';
		}
	}
}