class TableView{
	constructor(page){
		this.page = page;
		this.meta = page.meta;
		this.protocol = page.protocol;
		this.recordClass = page.recordClass == undefined ? TableRowView : page.recordClass;
		this.avatar = this.meta.avatar;
		this.container = null;
		this.table = null;
		
		this.hasSelect = false;
		this.hasIndex = true;
		this.hasAvatar = true;

		this.viewMode = TableViewMode.TABLE;

		this.currentPage = 1;
		this.totalPage = 1;
		this.limit = 10;

		this.currentRawList = [];
		this.currentRecordList = [];
		this.currentRowList = [];
		this.currentCardList = [];

		this.currentRawMap = {};
		this.currentRecordMap = {};
		this.currentRowMap = {};
		this.currentRowRecordMap = {};
		this.currentRecordRowMap = {};
		this.currentCardMap = {};
		this.currentCardRecordMap = {};
		this.currentRecordCardMap = {};

		this.currentFilter = {};
		this.orderBy = undefined;
		this.isDecreasing = undefined;

		this.pagination = new PaginationView(this);
		this.filter = new TableFilterView(this);
		this.header = new TableHeaderView(this);
		this.row = new TableRowView(this);
		this.card = new CardItemView(this);

		this.tableOperation = [];
		this.recordOperation = [];
		this.setTableOperation();
		this.setRecordOperation();
	}

	setTableOperation(){
		this.setSwitchViewOperation();
		this.setPageLimitOperation();
		this.setAddOperation();
		this.setFilterOperation();
	}

	setSwitchViewOperation(){
		let object = this;
		this.switchViewOperation = new TableOperation(
			TEMPLATE.TableSwitchView, '1.0',
			async (event) => {}
		);
		this.tableOperation.push(this.switchViewOperation);

		let switchView = this.switchViewOperation.render();
		switchView.dom.cardView.onclick = async (event) => {
			switchView.dom.cardView.classList.add('highlight');
			switchView.dom.tableView.classList.remove('highlight');
			await object.switchToCardView();
		}
		switchView.dom.tableView.onclick = async (event) => {
			switchView.dom.tableView.classList.add('highlight');
			switchView.dom.cardView.classList.remove('highlight');
			await object.switchToTableView();
		}

		if (this.viewMode == TableViewMode.TABLE) {
			switchView.dom.tableView.classList.add('highlight');
			switchView.dom.cardView.classList.remove('highlight');
		} else if (this.viewMode == TableViewMode.CARD) {
			switchView.dom.tableView.classList.add('highlight');
			switchView.dom.cardView.classList.remove('highlight');
		}
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

	setFilterOperation() {
		let object = this;
		let filterButton = Mustache.render(TEMPLATE.Button, {
			SVG: ICON.Filter, isSVG: true, icon: ICON.Filter, 
			ID: 'operation', cssClass: 'filter_button'
		});
		this.filterOperation = new TableOperation(
			filterButton, '3.0',
			async (event) => {object.page.renderInsert()},
			async () => {
				if (object.page.getInsertURL) return object.page.getInsertURL();
				return;
			},
		);
		this.tableOperation.push(this.filterOperation);
		let filterOperation = this.filterOperation.render();
		filterOperation.html.onclick = async function() {
			let rendered = await object.filter.render();
			object.container.dom.filter.innerHTML = "";
			object.container.dom.filter.appendChild(rendered.html);
			object.container.dom.filter.toggle();
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
			async (event) => {object.page.renderInsert()},
			async () => {
				if (object.page.getInsertURL) return object.page.getInsertURL();
				return;
			},
		);
		this.tableOperation.push(this.addOperation);
		let addOperation = this.addOperation.render();
		addOperation.html.onclick = async function() {
			object.page.renderInsert();
		}
	}
	
	setRecordOperation(){
		let object = this;
		
		this.editOperation = new TableRecordOperation(
			'Edit', 'Edit', '1.0',
			async (event, record) => {await object.page.renderUpdate(record.id)},
			async (id) => {
				if (object.page.getUpdateURL) return object.page.getUpdateURL(id)
				return;
			}
		);
		this.editOperation.classList = ["edit_mobile_button"];
		this.appendRecordOperation(this.editOperation);
		
		this.deleteOperation = new TableRecordOperation(
			'Delete', 'Delete', '2.0',
			async (event, record) => {
				SHOW_CONFIRM_DELETE_DIALOG("Do you want to delete this data?", async function() {
					await object.handleDelete(record.id);
				});
			}
		)
		this.deleteOperation.classList = ["delete_mobile_button"];
		this.appendRecordOperation(this.deleteOperation);
	}

	async render(title, filter){
		this.currentFilter = filter;
		if(this.container == null){
			this.page.onPrepareTable();
			this.getTableColumn();
			this.container = new DOMObject(TEMPLATE.TableContainer, {title});
			this.table = new DOMObject(TEMPLATE.TableView);
			let header = await this.header.render();
			this.table.dom.thead.appendChild(header.html);
			let pagination = await this.pagination.render();
			this.container.dom.pagination.appendChild(pagination.html);
			this.container.dom.table.appendChild(this.table.html);
		}
		this.tableOperation.sort((a, b) => VersionParser.compare(a.order, b.order));
		await this.header.render();
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
		await this.getRelatedData();
		if(this.viewMode == TableViewMode.TABLE){
			await this.renderRowList();
		}else if(this.viewMode == TableViewMode.CARD){
			await this.renderCardList();
		}
	}

	async renderTableOperation() {
		for (let tableOperation of this.tableOperation) {
			this.container.dom.operationContainer.appendChild(tableOperation.operation.html);
		}
	}

	async renderRowList(){
		this.currentRowList = [];
		this.table.dom.tableContainer.innerHTML = '';
		this.table.dom.tableContainer.appendChild(this.table.dom.table);
		this.table.dom.tbody.innerHTML = '';
		this.table.dom.tableContainer.classList.remove('abstract_card_container');
		let i = ((this.currentPage - 1) * this.limit) + 1;
		for(let record of this.currentRecordList){
			let row = await this.row.render(record, this.currentReferencedData, i);
			this.appendRow(row);
			this.mapRowRecord(row, record);
			this.table.dom.tbody.appendChild(row.html);
			i += 1;
		}
	}

	deleteRow(row) {
		let id = Object.id(row);
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

	deleteCard(card) {
		let id = Object.id(card);
		if (this.currentCardMap[id] != undefined) {
			delete this.currentCardMap[id];
			this.currentCardList = this.currentCardList.filter((item) => Object.id(item) != id);
			card.html?.remove();
		}
		if (this.currentCardRecordMap[id] == undefined) {
			let record = this.currentCardRecordMap[id];
			deleteRecord(record);
			delete this.currentCardRecordMap[id];
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
		if (this.currentRecordCardMap[id] == undefined) {
			let card = this.currentRecordCardMap[id];
			deleteCard(card);
			delete this.currentRecordCardMap[id];
		}
	}

	appendRow(row) {
		let id = Object.id(row);
		if (this.currentRowMap[id] == undefined) {
			this.currentRowMap[id] = row;
			this.currentRowList.push(row);
		}
	}

	appendCard(card) {
		let id = Object.id(card);
		if (this.currentCardMap[id] == undefined) {
			this.currentCardMap[id] = card;
			this.currentCardList.push(card);
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

	mapCardRecord(card, record) {
		let id = Object.id(card);
		if (this.currentCardRecordMap[id] == undefined) {
			this.currentCardRecordMap[id] = record;
		}
		let recordID = Object.id(record);
		if (this.currentRecordCardMap[recordID] == undefined) {
			this.currentRecordCardMap[recordID] = card;
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

	async createCard() {
		let recordClass = this.recordClass;
		let createFunction = !recordClass? (i) => new recordClass(i): (i) => i;
		let record = createFunction(this);
		this.appendRecord(record);
		let i = ((this.currentPage - 1) * this.limit) + 1;
		let row = await this.card.render(record, this.currentReferencedData, i);
		this.appendCard(row);
		this.mapCardRecord(row, record);
		this.table.dom.tbody.appendChild(row.html);
		i += 1;
	}

	async initLinkEvent(cell, column, record) {
		if (!column.isLink) return;
		let object = this;
		cell.html.onclick = async function() {
			if (column.column.foreignColumn == undefined && column.column.foreignModelName == undefined) {
				object.page.renderDetail(record.id);
			}
		}
	}

	async switchToTableView() {
		this.viewMode = TableViewMode.TABLE;
		await this.renderBody(this.currentFilter);
	}

	async switchToCardView() {
		this.viewMode = TableViewMode.CARD;
		await this.renderBody(this.currentFilter);
	}

	async renderCardList(){
		this.currentCardList = [];
		this.table.dom.tableContainer.innerHTML = '';
		this.table.dom.tableContainer.classList.add('abstract_card_container');
		let i = ((this.currentPage - 1) * this.limit) + 1;
		for(let record of this.currentRecordList){
			let item = await this.card.render(record, this.currentReferencedData, i);
			this.appendCard(item);
			this.mapCardRecord(item, record);
			this.table.dom.tableContainer.appendChild(item.html);
			i += 1;
		}
	}

	async getRelatedData(){
		let IDColumnMap = {};
		for(let i of this.tableColumn){
			if (IDColumnMap[i.columnName] == undefined) IDColumnMap[i.columnName] = [];
			if(!i.isReferenced) continue;
			for(let raw of this.currentRawList){
				IDColumnMap[i.columnName].push(raw[i.columnName]);
			}
		}
		this.currentReferencedData = {}
		for(let i of this.tableColumn){
			if(i.isReferenced){
				if (i.isTagReferenced) {
				} else if(i.tableURL != null){
					this.currentReferencedData[i.columnName] = {}
					let response = await POST(i.tableURL, {'IDList': IDColumnMap[i.columnName]});
					if (response.isSuccess) {
						this.currentReferencedData[i.columnName] = response.result;
					}
				}else{
					this.currentReferencedData[i.columnName] = {};
					if (i.url == undefined) continue;
					let response = await GET(i.url);
					if (!response.isSuccess) continue;
					let option = response.result;
					if (option == null) continue;
					for(let j of option){
						this.currentReferencedData[i.columnName][j.value] = j;
					}
				}
			}
		}
	}

	async fetchAll(filter) {
		let data = await this.protocol.getAll(filter, this.limit, this.currentPage, this.orderBy, this.isDecreasing);
		return data;
	}

	async createRecordList(filter){
		if (filter == undefined) filter = {};
		let data = await this.fetchAll(filter);
		if(!data){
			console.error('No data can be fetched.');
			return;
		}
		if (data.count != undefined && data.data != undefined) {
			this.totalPage = data.count;
			data = data.data;
		}
		this.pagination.refresh();
		this.currentRawList = data;
		this.currentRecordList = [];
		let recordClass = this.recordClass;
		let createRecord = !recordClass? (i) => new recordClass(i): (i) => i;
		for(let i of data){
			this.currentRecordList.push(createRecord(i));
		}
	}

	appendRawData(raw) {
		let recordClass = this.recordClass;
		let createRecord = !recordClass? (i) => new recordClass(i): (i) => i;
		this.currentRawList.push(raw);
		this.currentRecordList.push(createRecord(raw));
	}

	appendOperation(operation){
		this.tableOperation.push(operation);
		this.tableOperation.sort((a, b) => VersionParser.compare(a.order, b.order));
	}

	appendRecordOperation(operation){
		this.recordOperation.push(operation);
		this.recordOperation.sort((a, b) => VersionParser.compare(a.order, b.order));
	}

	getTableColumn(){
		this.tableColumn = [];
		let excludeList = this.meta.excludeInputViewMap[ViewType.TABLE_FORM];
		excludeList = excludeList != undefined ? excludeList : [];
		for(let input of this.meta.inputList){
			if (excludeList.indexOf(input.columnName) != -1) continue;
			if(input.column.isTable) this.tableColumn.push(input.column.input);
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
		for(let record of this.currentRecordList) {
			data.push(record);
		}
		if (this.formData != undefined && !this.formData.isEmpty()) {
			let iterator = this.formData.keys();
			while (true) {
				let result = iterator.next();
				if (result.value != 'data') {
					let items = this.formData.getAll(result.value);
					for (let item of items) {
						file.append(result.value, item);
					}
				}
				if (result.done) break;
			}
		}
		return isPass;
	}
}