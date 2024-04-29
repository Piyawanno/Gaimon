class TableRowView{
	constructor(table){
		this.table = table;
		this.hasSelect = table.hasSelect;
		this.hasIndex = table.hasIndex;
		this.hasAvatar = table.hasAvatar;
		this.tableColumn = this.table.tableColumn;
		this.operation = this.table.recordOperation;
	}

	async render(record, reference, i){
		this.hasIndex = this.table.hasIndex;
		this.hasAvatar = this.table.hasAvatar;
		let row = new DOMObject(TEMPLATE.TableRowView, this);
		Object.id(row);
		this.table.currentRowList.push(row);
		if(this.hasAvatar && this.table.avatar){
			let avatar = this.table.avatar.render(record);
			row.dom.avatar.outerHTML = avatar.html.outerHTML;
			row.dom.avatar = avatar.html;
		}
		if(this.hasIndex){
			row.dom.index.innerHTML = i;
		}
		for(let column of this.table.tableColumn){
			let cell = await column.renderCell(record, reference);
			row.html.appendChild(cell.html);
			this.table.initLinkEvent(cell, column, record);
		}
		for(let icon of this.table.recordOperation){
			let operation = await icon.render(row, record);
			row.html.appendChild(operation.html);
		}
		return row;
	}
}