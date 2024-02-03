class TableView{
	constructor(page){
		this.page = page;
		this.meta = page.meta;
		this.protocol = page.protocol;
		this.recordClass = page.recordClass;
		this.avatar = this.meta.avatar;
		this.container = null;
		this.table = null;
		
		this.hasSelect = false;
		this.hasIndex = true;
		this.hasAvatar = true;

		this.viewMode = TableViewMode.TABLE;

		this.currentPage = 0;
		this.totalPage = 1;
		this.limit = 10;

		this.currentRawList = [];
		this.currentRecordList = [];
		this.currentRowList = [];

		this.pagination = new PaginationView(this);
		this.filter = new TableFilterView(this);
		this.header = new TableHeaderView(this);
		this.row = new TableRowView(this);

		this.tableOperation = [];
		this.recordOperation = [];
		this.setTableOperation();
		this.setRecordOperation();
	}

	setTableOperation(){
		this.setSwitchViewOperation();
		this.setPageLimitOperation();
	}

	setPageLimitOperation(){
		
	}

	setSwitchViewOperation(){
		let object = this;
		this.switchViewOperation = new TableOperation(
			TEMPLATE.TableSwitchView, '1.0',
			async (event) => {}
		);
		let switchView = this.switchViewOperation.render();
		switchView.dom.cardView.onclick = async (event) => {
			switchView.dom.cardView.classList.add('highlight');
			switchView.dom.tableView.classList.remove('highlight');
			await object.switchToCardView();
		}

		this.tableOperation.push(this.switchViewOperation);
	}
	
	setRecordOperation(){
		let object = this;
		
		this.editOperation = new TableRecordOperation(
			'Edit', 'Edit', '1.0',
			async (event, record) => {await object.page.renderUpdate(record.id)}
		);
		this.recordOperation.push(this.editOperation);
		
		this.deleteOperation = new TableRecordOperation(
			'Delete', 'Delete', '2.0',
			async (event, record) => {await object.handleDelete(record.id)}
		)
		this.recordOperation.push(this.deleteOperation);
	}

	async render(title, filter){
		this.currentFilter = filter;
		if(this.container == null){
			this.getTableColumn();
			this.container = new DOMObject(TEMPLATE.TableContainer, {title});
			this.table = new DOMObject(TEMPLATE.TableView);
			let header = await this.header.render();
			this.table.dom.thead.appendChild(header.html);
			let pagination = await this.pagination.render();
			this.container.dom.pagination.appendChild(pagination.html);
		}
		this.operation.sort((a, b) => VersionParser.compare(a.order, b.order));
		await this.renderBody(filter);
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
		}else if(this.viewMode == TableViewMode.TABLE){
			await this.renderCardList();
		}
	}

	async renderRowList(){
		this.currentRowList = [];
		this.table.dom.tbody.innerHTML = '';
		let i = 1;
		for(let record of this.currentRecordList){
			let row = await this.row.render(record, this.currentReferencedData, i);
			this.table.dom.tbody.appendChild(row);
			i += 1;
		}
	}

	async renderCardList(){
	}

	async getRelatedData(){
		let IDList = [];
		for(let i of this.currentRawList){
			IDList.push(i.id);
		}
		this.currentReferencedData = {}
		for(let i of this.tableColumn){
			if(i.isReferenced){
				if(!i.tableURL){
					this.currentReferencedData[i.columnName] = await POST(i.tableURL, {IDList});
				}else{
					this.currentReferencedData[i.columnName] = {};
					let option = await this.protocol.getOption();
					for(let j of option){
						this.currentReferencedData[i.columnName][j.value] = j;
					}
				}
			}
		}
	}

	async createRecordList(filter){
		let data = await this.protocol.getALl(filter, this.limit, this.currentPage);
		if(!data){
			console.error('No data can be fetched.');
			return;
		}
		this.currentRowList = data;
		this.currentRecordList = [];
		let recordClass = this.recordClass;
		let createRecord = !recordClass? (i) => new recordClass(i): (i) => i;
		for(let i of data){
			this.currentRecordList.push(createRecord(i));
		}
	}

	appendOperation(operation){
		this.operation.push(operation);
		this.operation.sort((a, b) => VersionParser.compare(a.order, b.order));
	}

	getTableColumn(){
		this.tableColumn = [];
		for(let input of this.meta.inputList){
			if(input.isTable) this.tableColumn.puhs(input);
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
}