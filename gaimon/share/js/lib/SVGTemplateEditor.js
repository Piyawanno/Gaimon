class SVGTemplateEditor {

	constructor() {
		this.isSelectedTextBox = false;
		this.currentSelectedTextBox = undefined;
		this.filename = undefined;
	}

	createTemplate() {
		this.formatter = new SVGTemplateFormatter("<svg></svg>");
	}

	loadTemplate(template) {
		this.formatter = new SVGTemplateFormatter(template);
		window.SVG_TEMPLATE_EDITOR = this;
	}

	async render() {
		let template = await TEMPLATE.get("SVGTemplateEditor");
		if (this.home == undefined) {
			this.home = new DOMObject(template);
			this.initEvent();
		}
		return this.home;
	}

	initEvent() {
		let object = this;
		this.home.dom.import.onclick = async () => {
			object.home.dom.file_import.click();
		}

		this.home.dom.export.onclick = async () => {
			object.export();
		}

		this.home.dom.file_import.onchange = async () => {
			let input = object.home.dom.file_import;
			if (input.files && input.files[0]) {
				let file = input.files[0];
				let reader = new FileReader();
				reader.readAsText(file, "UTF-8");
				reader.onload = function (e) {
					object.onImport(e.target.result)
					object.filename = file.name;
				}
				reader.onerror = function (e) {
				}
			}
		}

		this.home.dom.text_box_component.onclick = async () => {
			object.home.dom.template_page_container.style.cursor = "text";
			object.isSelectedTextBox = true;
		}

		this.home.dom.template_page_container.onclick = async (e) => {
			if (object.isSelectedTextBox) {
				// object.formatter?.addText("", "Lorem Ipsum", e.offsetX-20, e.offsetY+5, "", "");
				object.formatter?.addText("", "Lorem Ipsum", e.offsetX, e.offsetY+5, "", "");
				object.isSelectedTextBox = false;
				object.home.dom.template_page_container.style.cursor = "default";
			} else {
				// if (e.target.tagName)
				if (e.target.tagName != "text") {
					object.currentSelectedTextBox = undefined;
					object.home.dom.attribute.value = "";
					object.home.dom.attribute.disabled = true;
					object.home.dom.text.value = "";
					object.home.dom.text.disabled = true;
				} else {
					object.home.dom.attribute.disabled = false;
					object.home.dom.text.disabled = false;
				}
				object.clearTextSelect(e.target);
				
			}
		}

		this.home.dom.attribute.onkeyup = async () => {
			if (object.currentSelectedTextBox) {
				object.currentSelectedTextBox.setAttribute("rel", object.home.dom.attribute.value);
			}
		}
		this.home.dom.text.onkeyup = async () => {
			if (object.currentSelectedTextBox) {
				object.currentSelectedTextBox.innerHTML = object.home.dom.text.value;
			}
		}
	}

	onImport(template) {
		this.loadTemplate(template);
		this.home.dom.template_page_container.appendChild(this.formatter.element.html);
	}

	onSelect(element) {
		element.setAttribute("paint-order", "stroke");
		element.setAttribute("stroke", "#000000");
		element.setAttribute("stroke-width", "1px");
		element.setAttribute("stroke-linecap", "butt");
		element.setAttribute("stroke-linejoin", "miter");
		this.home.dom.attribute.disabled = false;
		this.home.dom.text.disabled = false
		this.clearTextSelect(element);
		this.currentSelectedTextBox = element;
		this.home.dom.attribute.value = element.getAttribute("rel");
		this.home.dom.text.value = element.innerHTML;
	}

	clearTextSelect(element) {
		let elements = this.home.dom.template_page_container.getElementsByTagName("text");
		for (let item of elements) {
			if (element == undefined || item != element) {
				item.removeAttribute("paint-order");
				item.removeAttribute("stroke");
				item.removeAttribute("stroke-width");
				item.removeAttribute("stroke-linecap");
				item.removeAttribute("stroke-linejoin");
			}
		}
	}

	export() {
		if (this.filename == undefined) return;
		let data = this.home.dom.template_page_container.innerHTML;
		const blob = new Blob([data], {type: 'image/svg+xml'});
		if(window.navigator.msSaveOrOpenBlob) {
			window.navigator.msSaveBlob(blob, this.filename);
		}
		else{
			const elem = window.document.createElement('a');
			elem.href = window.URL.createObjectURL(blob);
			elem.download = this.filename;        
			document.body.appendChild(elem);
			elem.click();        
			document.body.removeChild(elem);
		}
	}
}