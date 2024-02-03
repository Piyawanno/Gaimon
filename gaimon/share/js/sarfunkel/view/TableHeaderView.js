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
		if(!this.header){
			this.header = new DOMObject(TEMPLATE.TableHeadView, this);
			this.initEvent();
		}
		return this.header;
	}

	initEvent(){
		if(this.hasSelect) this.initSelectEvent();
	}

	initSelectEvent(){
		let checkAll = this.header.dom.checkAll;
		let table = this.table;
		checkAll.onchange = async function(event){
			if(checkAll.checked) table.checkAll();
			else table.checkNone();
		}
	}
}