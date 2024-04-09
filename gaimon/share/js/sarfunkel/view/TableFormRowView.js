class TableFormRowView{
	constructor(table){
		Object.id(this);
		this.table = table;
		this.hasSelect = table.hasSelect;
		this.hasIndex = table.hasIndex;
		this.tableColumn = this.table.tableColumn;
		this.operation = this.table.recordOperation;
	}

	async render(record, reference, i){
		this.hasIndex = this.table.hasIndex;
		let row = new DOMObject(TEMPLATE.TableFormRowView, this);
		Object.id(row);
		this.table.currentRowList.push(row);
		if(this.hasIndex){
			row.dom.index.innerHTML = i;
		}
		row.columns = {};
		for(let column of this.table.tableColumn){
			if (column.renderFormCell != undefined) {
				let cell = await column.renderFormCell(record, reference);
				row.columns[column.columnName] = cell;
				row.html.appendChild(cell.html);
			} else {
				row.html.appendChild(document.createElement('td'));
			}
			
		}
		
		for(let icon of this.table.recordOperation){
			let operation = await icon.render(row, record);
			row.html.appendChild(operation.html);
		}
		return row;
	}
}