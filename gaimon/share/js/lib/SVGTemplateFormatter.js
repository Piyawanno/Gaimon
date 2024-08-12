class SVGTemplateFormatter {
	constructor(template) {
		this.template = template;
		this.element = new DOMObject(this.template);
		this.document = this.element.html;
		this.def = this.#getDefs();
		this.style = this.#getStyle();
		this.textTemplate = `<text rel="{{key}}" x="{{x}}" y="{{y}}" onclick="window.SVG_TEMPLATE_EDITOR?.onSelect(this);" class="{{#classList}}.{{/classList}}">{{text}}</text>`;
		this.textElementMap = {};
		this.signatureBoxMap = {};
	}

	#getDefs() {
		let defs = this.document.getElementsByTagName("defs");
		if (defs.length == 0) {
			let tag = document.createElement("defs");
			this.document.insertAdjacentElement('afterbegin', tag)
			return tag;
		}
		for (let def of defs) {
			return def;
		}
	}

	#getStyle() {
		let styles = this.document.getElementsByTagName("style");
		if (styles.length == 0) {
			let tag = document.createElement("style");
			this.document.insertAdjacentElement('afterbegin', tag)
			return tag;
		}
		for (let style of styles) {
			return style;
		}
	}

	/***
	 * @param {string} family
	 * @param {string} url
	 * @param {string} weight 
	 */
	addFont(family, url, weight) {
		let template = `
		@font-face {
			{{#family}}font-family: "{{family}}";{{/family}}
			{{#url}}src: url("{{url}}");{{/url}}
			{{#weight}}font-weight: {{weight}};{{/weight}}
		};
		`
		let rendered = Mustache.render(template, {family, url, weight});
		this.style.innerHTML += rendered;
	}

	/***
	 * @typedef {object} CSSProperty
	 * @property {string} property
	 * @property {string} value
	 * 
	 * @param {string} selector
	 * @param {Array<CSSProperty>} properties
	 */
	addStyle(selector, properties) {
		let template = `
		{{selector}} {
			{{#properties}}
			{{property}} : {{value}};
			{{/properties}}
		};
		`
		properties = JSON.parse(JSON.stringify(properties));
		for (let property of properties) {
			if (typeof property.value != "number") {
				property = `"${property.value}"`
			}
		}
		let rendered = Mustache.render(template, {selector, properties});
		this.style.innerHTML += rendered;
	}

	addText(key, text, x, y, classList, style) {
		let element = new DOMObject(this.textTemplate, {key, text, x, y, classList, style});
		this.textElementMap[key] = element;
		this.document.appendChild(element.html);
		this.document.innerHTML += "";
		return element;
	}

	addSignatureBox(key, x, y, width, height) {
		let template = `<image class="signature-box" onclick="this.onselect(e);" rel="{{key}}" x="{{x}}" y="{{y}}" href="" height="{{height}}" width="{{width}}" />`;
		let rendered = Mustache.render(template, {key, x, y, width, height});
		this.document.innerHTML += rendered;
	}

	addSignatureBoxWithText(preText, duty, name, position, x, y) {
		let template = `
		<g transform="translate({{x}}, {{y}})">
			<text text-anchor="left">
				<tspan x="0" y="30">{{preText}}</tspan>
				<tspan dx="0%" dy="0%">...................................................</tspan>
				<tspan dx="0" dy="0">{{duty}}</tspan>
			</text>
			<text text-anchor="left">
				<tspan x="0" y="60" opacity="0">{{preText}}</tspan>
				<tspan dx="-3" dy="0%">(.................................................)</tspan>
				<tspan dx="0" dy="0" opacity="0">{{duty}}</tspan>
			</text>
				<text text-anchor="left">
				<tspan x="0" y="90">{{position}}</tspan>
				<tspan dx="0%" dy="0%">...................................................</tspan>
			</text>
		</g>
		`
		let element = new DOMObject(template, {preText, duty, name, position, x, y});
		this.document.appendChild(element.html);
		this.document.innerHTML += "";
	}
}