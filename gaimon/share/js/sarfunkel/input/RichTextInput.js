class RichTextInput extends TextAreaInput{
	constructor(column, config){
		super(column, config);
		this.hasImage = config.hasImage;
		this.hasVideo = config.hasVideo;
		this.hasLink = config.hasLink;
		this.handler = config.handler != undefined ? config.handler : [];
	}

	/**
	 * @typedef {object} RichTextAdditionalConfig
	 * @property {boolean} hasImage
	 * @property {boolean} hasVideo
	 * @property {hasLink} hasLink
	 * @property {Array} handler
	 * 
	 * @typedef {InputConfig & RichTextAdditionalConfig} RichTextInputConfig
	 * @param {RichTextInputConfig} config 
	 */
	static create(config) {
		let data = super.create(config);
		data.typeName = "RichText";
		data.hasImage = config.hasImage != undefined ? config.hasImage: false;
		data.hasVideo = config.hasVideo != undefined ? config.hasVideo: false;
		data.hasLink = config.hasLink != undefined ? config.hasLink: false;
		data.handler = config.handler != undefined ? config.handler: [];
		return data;
	}

	/// Tested
	getInputTemplate(){
		return TEMPLATE.input.RichTextInput;
	}

	async renderForm(record){
		if (this.input == undefined) {
			let input = await super.renderForm(record);
			new Quill(input.dom[this.columnName], this.getConfig());
		}
		return this.input;
	}

	async renderDialogForm(record){
		let input = await super.renderDialogForm(record);
		new Quill(input.dom[this.columnName], this.getConfig());
		return input;
	}

	handleImage(){
		let quillItem = this;
		let url = this.handlers.image.url;
		let input = document.createElement('input');
		input.type = 'file';
		input.accept = 'image/*';
		input.click();
		input.onchange = async function(){
			let formData = new FormData();
			formData.append('image', this.files[0]);
			let response = await POST(url, formData);
			let range = quillItem.quill.getSelection();
			quillItem.quill.insertEmbed(range.index, 'image', `share/${response.result}`, Quill.sources.USER);
		}
	}

	getConfig(){
		let config = {};
		config.theme = 'snow';
		let additional = [];
		let handlers = {};
		if (this.hasImage == true) additional.push('image');
		if (this.hasVideo == true) additional.push('video');
		if (this.hasLink == true) additional.push('link');
		for(let handler of this.handler){
			let name = handler.name;
			let url = handler.url;
			if(name == 'image'){
				handlers[name] = this.handleImage.bind(this);
				handlers[name].url = url;
			}
		}
		config.modules = {
			toolbar: {
				container: [
					['bold', 'italic', 'underline'],
					[{ 'list': 'bullet' }, { 'list': 'ordered' }],
					['clean'],
					[{ 'align': [] }]
				]
			},
		}
		if (additional.length > 0) config.modules.toolbar.container.push(additional);
		if (Object.keys(handlers).length > 0) config.modules.toolbar.handlers = handlers;
		return config;
	}
}