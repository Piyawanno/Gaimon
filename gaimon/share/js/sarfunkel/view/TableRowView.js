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
		let row = new DOMObject(TEMPLATE.TableRowView, this);
		this.currentRowList.push(row);
		if(this.hasAvatar){
			row.dom.avatar.appendChild(this.avatar.render(record));
		}
		if(this.hasIndex){
			row.dom.index.innerHTML = i;
		}
		for(let column of this.tableColumn){
			let cell = column.renderCell(record, reference);
			row.html.appendChild(cell.html);
		}
		for(let icon of this.operation){
			let operation = icon.render(record);
			row.html.appendChild(operation.html);
		}
		return row;
	}
}