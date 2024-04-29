class FormGroupView{
	constructor(config){
		this.label = config.label;
		this.id = config.id;
		this.order = new VersionParser(config.order);
		this.inputList = [];
		this.group = null;
		this.groupFilter = null;
		this.groupDetail = null;
		this.template = null;
		this.filterTemplate = null;
		this.detailTemplate = null;
		this.currentInputMap = {};
		this.inputMapper = {};
	}

	async renderForm(record, reference){
		this.checkGroup();
		await this.setInput(record, reference);
		return this.group;
	}

	async renderDialogForm(record, reference) {
		this.checkGroup();
		await this.setInput(record, reference);
		return this.group;
	}

	async renderTableFilter() {
		if(this.groupFilter == null){
			this.filterTemplate = TEMPLATE.FormGroupView;
			this.groupFilter = new DOMObject(this.filterTemplate, this);
			await this.setTableFilterInput();
		}
		return this.groupFilter;
	}

	async renderDetail(record, reference) {
		this.checkGroupDetail();
		await this.setDetailInput(record, reference);
		return this.groupDetail;
	}

	async checkGroupDetail() {
		if(this.groupDetail == null){
			this.detailTemplate = TEMPLATE.FormGroupView;
			this.groupDetail = new DOMObject(this.detailTemplate, this);
		}
		return this.groupDetail;
	}

	sort(){
		this.inputList.sort((a, b) => VersionParser.compare(a.order, b.order));
	}

	checkGroup() {
		if(this.group == null){
			this.template = TEMPLATE.FormGroupView;
			this.group = new DOMObject(this.template, this);
		}
	}

	async setInput(record, reference){
		await this.checkGroup();
		let group = this.group.dom.group;
		let excludeList = this.meta.excludeInputViewMap[ViewType.FORM];
		excludeList = excludeList != undefined ? excludeList : [];
		for(let input of this.inputList){
			if (!input.config.isForm) continue;
			input.formGroupView = this;
			let isRendered = input.input != undefined;
			if (excludeList.indexOf(input.columnName) != -1) continue;
			let rendered = await input.renderForm(record, reference);
			this.currentInputMap[input.columnName] = {input: input, dom: rendered};
			this.inputMapper[input.columnName] = rendered;
			if (rendered.html == null) continue;
			if (!isRendered) group.appendChild(rendered.html);
		}
		return this.group;
	}

	async setDetailInput(record, reference){
		this.checkGroupDetail();
		let group = this.groupDetail.dom.group;
		for(let input of this.inputList){
			if (!input.config.isForm) continue;
			let rendered = await input.renderDetail(record, reference);
			group.appendChild(rendered.html);
		}
		return this.groupDetail;
	}

	async setTableFilterInput(){
		await this.renderTableFilter();
		let group = this.groupFilter.dom.group;
		for(let input of this.inputList){
			if (!input.config.isSearch) continue;
			let rendered = await input.renderTableFilter();
			group.appendChild(rendered.html);
		}
		return this.group;
	}
}