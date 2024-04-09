class TableFormView{
	constructor(page){
		this.page = page;
		this.meta = page.meta;
		this.protocol = page.protocol;
		this.recordClass = page.recordClass == undefined ? TableFormRowView : page.recordClass;
		this.avatar = this.meta.avatar;
		this.container = null;
		this.table = null;
		
		this.hasSelect = false;
		this.hasIndex = true;
		this.hasAvatar = true;

		this.viewMode = TableFormViewMode.TABLE;

		this.currentPage = 1;
		this.totalPage = 1;
		this.limit = 10;

		this.currentRawList = [];
		this.currentRecordList = [];
		this.currentRowList = [];

		this.currentRawMap = {};
		this.currentRecordMap = {};
		this.currentRowMap = {};
		this.currentRowRecordMap = {};
		this.currentRecordRowMap = {};

		this.pagination = new PaginationView(this);
		this.filter = new TableFilterView(this);
		this.header = new TableFormHeaderView(this);
		this.row = new TableFormRowView(this);

		this.tableOperation = [];
		this.recordOperation = [];
		this.setTableOperation();
		this.setRecordOperation();
	}

	setTableOperation(){
		this.setPageLimitOperation();
		this.setAddOperation();
	}

	setPageLimitOperation(){
		let object = this;
		this.limitOperation = new TableOperation(
			TEMPLATE.TableLimitOperation, '2.0'
		)
		this.tableOperation.push(this.limitOperation);
		let limitOperation = this.limitOperation.render();
		limitOperation.dom.operation.onchange = async function() {
			object.limit = parseInt(this.value);
			await object.render();
		}
	}

	setAddOperation() {
		let object = this;
		let addButton = Mustache.render(TEMPLATE.Button, {
			SVG: ICON.AddCircle, isSVG: true, icon: ICON.AddCircle, 
			label: 'Add', ID: 'operation', cssClass: 'add_button'
		});
		this.addOperation = new TableOperation(
			addButton, '4.0',
			async (event) => {
				object.createRow();
			},
			async () => {
				if (object.page.getInsertURL == undefined) return;
				return object.page.getInsertURL();
			},
		);
		this.tableOperation.push(this.addOperation);
		let addOperation = this.addOperation.render();
		addOperation.html.onclick = async function() {
			object.createRow();
		}
	}
	
	setRecordOperation(){
		let object = this;
		
		this.deleteOperation = new TableRecordOperation(
			'Delete', 'Delete', '2.0',
			async (event, record, row) => {
				SHOW_CONFIRM_DELETE_DIALOG("Do you want to delete this data?", async function() {
					object.deleteRow(row);
				});
			}
		)
		this.recordOperation.push(this.deleteOperation);
	}

	async render(title, filter){
		this.currentFilter = filter;
		if(this.container == null){
			this.getTableColumn();
			let data = {...this};
			data.title = title;
			this.container = new DOMObject(TEMPLATE.TableFormContainer, data);
			this.table = new DOMObject(TEMPLATE.TableFormView, data);
			let header = await this.header.render();
			this.table.dom.thead.appendChild(header.html);
			let pagination = await this.pagination.render();
			this.container.dom.pagination.appendChild(pagination.html);
			this.container.dom.table.appendChild(this.table.html);
		}
		if (this.operation == undefined) this.operation = [];
		this.operation.sort((a, b) => VersionParser.compare(a.order, b.order));
		await this.renderBody(filter);
		await this.renderTableOperation();
		return this.container;
	}

	async changePage(page){
		this.currentPage = page;
		await this.renderBody(this.currentFilter);
	}

	async handleDelete(ID){
		await this.protocol.delete(ID);
		await this.renderBody(this.currentFilter);
	}

	async renderBody(filter){
		await this.createRecordList(filter);
		if(this.viewMode == TableFormViewMode.TABLE){
			await this.renderRowList();
		}
	}

	async renderTableOperation() {
		for (let tableOperation of this.tableOperation) {
			this.container.dom.operationContainer.appendChild(tableOperation.operation.html);
		}
	}

	async renderRowList(){
		this.currentRowList = [];
		this.table.dom.tbody.innerHTML = '';
		let i = ((this.currentPage - 1) * this.limit) + 1;
		let excludeList = this.meta.excludeInputViewMap[ViewType.TABLE_FORM];
		excludeList = excludeList != undefined ? excludeList : [];
		for(let record of this.currentRecordList){
			let row = await this.row.render(record, this.currentReferencedData, i);
			this.appendRow(row);
			this.mapRowRecord(row, record);
			if (excludeList.indexOf(this.row.columnName) != -1) continue;
			this.table.dom.tbody.appendChild(row.html);
			i += 1;
		}
	}

	async renderCardList(){
	}

	async fetchAll(filter) {
		let data = await this.protocol.getAll(filter, this.limit, this.currentPage);
		return data;
	}

	async createRecordList(filter){
		if (filter == undefined) filter = {};
		let data = await this.fetchAll(filter);
		let count = undefined;
		if(!data){
			console.error('No data can be fetched.');
			return;
		}
		if (data.count != undefined && data.data != undefined) {
			data = data.data;
			count = data.count;
		}
		this.pagination.refresh();
		this.currentRawList = data;
		this.currentRecordList = [];
		this.currentRecordMap = {};
		let recordClass = this.recordClass;
		let createFunction = !recordClass? (i) => new recordClass(i): (i) => i;
		for(let i of data){
			this.appendRecord(createFunction(i));
		}
	}

	clearRecord() {
		for (let record in this.currentRecordList) {
			deleteRecord(record);
		}
	}

	deleteRow(row) {
		let id = Object.id(row);
		console.log(id);
		if (this.currentRowMap[id] != undefined) {
			delete this.currentRowMap[id];
			this.currentRowList = this.currentRowList.filter((item) => Object.id(item) != id);
			row.html?.remove();
		}
		if (this.currentRowRecordMap[id] == undefined) {
			let record = this.currentRowRecordMap[id];
			deleteRecord(record);
			delete this.currentRowRecordMap[id];
		}
	}
	
	deleteRecord(record) {
		let id = Object.id(record);
		if (this.currentRecordMap[id] != undefined) {
			delete this.currentRecordMap[id];
			this.currentRecordList = this.currentRecordList.filter((item) => Object.id(item) != id);
		}
		if (this.currentRecordRowMap[id] == undefined) {
			let row = this.currentRecordRowMap[id];
			deleteRow(row);
			delete this.currentRecordRowMap[id];
		}
	}

	appendRow(row) {
		let id = Object.id(row);
		if (this.currentRowMap[id] == undefined) {
			this.currentRowMap[id] = row;
			this.currentRowList.push(row);
		}
	}

	appendRecord(record) {
		let id = Object.id(record);
		if (this.currentRecordMap[id] == undefined) {
			this.currentRecordMap[id] = record;
			this.currentRecordList.push(record);
		}
	}

	mapRowRecord(row, record) {
		let id = Object.id(row);
		if (this.currentRowRecordMap[id] == undefined) {
			this.currentRowRecordMap[id] = record;
		}
		let recordID = Object.id(record);
		if (this.currentRecordRowMap[recordID] == undefined) {
			this.currentRecordRowMap[recordID] = row;
		}
	}

	async createRow() {
		let recordClass = this.recordClass;
		let createFunction = !recordClass? (i) => new recordClass(i): (i) => i;
		let record = createFunction(this);
		this.appendRecord(record);
		let i = ((this.currentPage - 1) * this.limit) + 1;
		let row = await this.row.render(record, this.currentReferencedData, i);
		this.appendRow(row);
		this.mapRowRecord(row, record);
		this.table.dom.tbody.appendChild(row.html);
		i += 1;
	}

	appendOperation(operation){
		this.operation.push(operation);
		this.operation.sort((a, b) => VersionParser.compare(a.order, b.order));
	}

	getTableColumn(){
		this.tableColumn = [];
		let excludeList = this.meta.excludeInputViewMap[ViewType.TABLE_FORM];
		excludeList = excludeList != undefined ? excludeList : [];
		for(let input of this.meta.inputList){
			if (excludeList.indexOf(input.columnName) != -1) continue;
			this.tableColumn.push(input.column.input);
		}
	}

	checkAll(){
		if(!this.hasSelect) return;
		for(let i of this.currentRowList){
			i.dom.check.checked = true;
		}
	}

	checkNone(){
		if(!this.hasSelect) return;
		for(let i of this.currentRowList){
			i.dom.check.checked = false;
		}
	}

	getFormValue(table, data, file, message) {
		let isPass = true;
		let fetched = {};
		let excludeList = this.page.excludeInputViewMap[ViewType.TABLE_FORM];
		if (excludeList == undefined) excludeList = [];
		for (let row of this.currentRowList) {
			let item = {};
			let ID = Object.id(row);
			if (fetched[ID] != undefined) continue;
			for(let column of this.tableColumn){
				if (excludeList.indexOf(column.columnName) != -1) continue;
				isPass = column.getFormValue(table, row.columns[column.columnName], item, file, message) && isPass;
			}
			fetched[ID] = ID;
			data.push(item);
		}
		return isPass;
	}
}