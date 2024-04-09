class TableHeaderView{
	constructor(table){
		this.table = table;
		this.hasSelect = table.hasSelect;
		this.hasIndex = table.hasIndex;
		this.hasAvatar = table.hasAvatar;
		this.tableColumn = this.table.tableColumn;
		this.operation = this.table.operation;
		this.header = null;
	}

	async render(){
		this.tableColumn = this.table.tableColumn;
		this.hasIndex = this.table.hasIndex;
		this.hasAvatar = this.table.hasAvatar;
		this.recordOperation = this.table.recordOperation;
		if(!this.header){
			this.header = new DOMObject(TEMPLATE.TableHeadView, this);
			this.initEvent();
		}
		for (let operation of this.recordOperation) {
			let tag = this.header.dom[`operation_${operation.label}`];
			if (operation.isEnabled) tag.show();
			else tag.hide();
		}
		return this.header;
	}

	initEvent(){
		if(this.hasSelect) this.initSelectEvent();
		this.initSortEvent();
	}

	initSelectEvent(){
		let checkAll = this.header.dom.checkAll;
		let table = this.table;
		checkAll.onchange = async function(event){
			if(checkAll.checked) table.checkAll();
			else table.checkNone();
		}
	}

	initSortEvent() {
		for (let column of this.tableColumn) {
			let tag = this.header.dom[column.columnName];
			if (tag == undefined) continue;
			this.initSortIconEvent(column);
		}
	}

	initSortIconEvent(column) {
		let object = this;
		let tag = this.header.dom[`${column.columnName}`];
		let header = this.header;
		tag.onclick = async function() {
			let isDecreasing = tag.isDecreasing;
			object.resetSortIcon();
			if (isDecreasing == undefined) tag.isDecreasing = 'ASC';
			else if (isDecreasing == 'ASC') tag.isDecreasing = 'DESC';
			else if (isDecreasing == 'DESC') tag.isDecreasing = undefined;
			object.table.orderBy = undefined;
			object.table.isDecreasing = undefined;
			if (tag.isDecreasing == 'ASC') {
				header.dom[`${column.columnName}_sort`].hide();
				header.dom[`${column.columnName}_sort_asc`].show();
				header.dom[`${column.columnName}_sort_asc`].classList.add('selected');
				object.table.orderBy = column.columnName;
				object.table.isDecreasing = false;
			} else if (tag.isDecreasing == 'DESC') {
				header.dom[`${column.columnName}_sort`].hide();
				header.dom[`${column.columnName}_sort_desc`].show();
				header.dom[`${column.columnName}_sort_desc`].classList.add('selected');
				object.table.orderBy = column.columnName;
				object.table.isDecreasing = true;
			} else {
				header.dom[`${column.columnName}_sort`].show();
				object.table.orderBy = undefined;
				object.table.isDecreasing = undefined;
			}
			await object.table.renderBody(object.table.currentFilter)
		}
	}

	resetSortIcon() {
		for (let column of this.tableColumn) {
			let tag = this.header.dom[column.columnName];
			if (tag == undefined) continue;
			tag.isDecreasing = undefined;
			this.resetSortIconByColumnName(column.columnName);
		}
	}

	resetSortIconByColumnName(columnName) {
		this.header.dom[`${columnName}_sort_asc`].hide();
		this.header.dom[`${columnName}_sort_desc`].hide();
		this.header.dom[`${columnName}_sort`].show();
		this.header.dom[`${columnName}_sort`].classList.remove('selected');
		this.header.dom[`${columnName}_sort_asc`].classList.remove('selected');
		this.header.dom[`${columnName}_sort_desc`].classList.remove('selected');
	}
}