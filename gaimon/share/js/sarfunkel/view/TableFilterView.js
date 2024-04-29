class TableFilterView{
	constructor(table){
		this.table = table;
		this.page = table.page;
		this.meta = table.page.meta;

		this.filter = null;
		this.title = "Search";
		this.button = [];
	}

	async render(title){
		if (title == undefined) title = this.title;
		if(this.filter == null){
			this.appendButton();
			this.template = TEMPLATE.TableFilterView;
			this.filter = new DOMObject(this.template, {title});
			await this.setInput(this.record);
			await this.setButton();
			this.page.onCreateTableFilter(this);
			// this.setInputEvent();
		}else{
			this.filter.dom.title.innerHTML = title;
		}
		this.onRender();
		return this.filter;
	}

	onRender(){
		for(let input of this.meta.filterInputList){
			input.isPass = true;
			input.onRender(input.filterInput);
		}
	}

	appendButton() {
		this.setSearchButton();
		this.setClearButton();
	}

	setSearchButton(){
		let object = this;
		this.submitButton = new IconButton(
			"Search",
			ICON.Search,
			'1.0',
			async () => {await object.search();},
			["submit_button"],
		);
		this.button.push(this.submitButton);
	}

	setClearButton(){
		let object = this;
		this.clearButton = new IconButton(
			"Clear",
			ICON.Clear,
			'2.0',
			async () => {await object.clear();},
			["cancel_button"],
		);
		this.button.push(this.clearButton);
	}

	async setInput(record){
		let container = this.filter.dom.form;
		for(let input of this.meta.filterInputList){
			if(!input.isGrouped){
				let rendered = await input.renderTableFilter(record);
				if (rendered.html == null) continue;
				container.appendChild(rendered.html);
			}
		}
		for(let group of this.meta.groupList){
			let rendered = await group.renderTableFilter(record);
			container.appendChild(rendered.html);
		}
	}

	async setButton(){
		this.button.sort((a, b) => VersionParser.compare(a.order, b.order));
		for(let i of this.button){
			let rendered = await i.render();
			this.filter.dom.operation.appendChild(rendered.html);
		}
	}

	async search() {
		let filter = {};
		for(let input of this.meta.filterInputList) {
			let result = input.filterInput.getData();
			filter[input.columnName] = result.data[input.columnName];
		}
		this.table.currentFilter = filter;
		this.table.renderBody(filter);
	}

	async clear() {
		for(let input of this.meta.filterInputList){
			input.isPass = true;
			input.filterInput.clearData();
		}
	}
}