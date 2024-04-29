class CardItemView{
	constructor(table){
		this.table = table;
		this.hasSelect = table.hasSelect;
		this.hasIndex = table.hasIndex;
		this.hasAvatar = table.hasAvatar;
		this.tableColumn = this.table.tableColumn;
		this.operation = this.table.recordOperation;
	}

	async render(record, reference, i){
		let item = new DOMObject(TEMPLATE.CardDetail, this);
		this.table.currentCardList.push(item);
		if(this.hasAvatar && this.table.avatar){
			let avatar = this.table.avatar.renderCard(record);
			item.dom.avatar.outerHTML = avatar.html.outerHTML;
			item.dom.avatar = avatar.html;
		}
		for(let column of this.table.tableColumn){
			let cell = await column.renderCardRow(record, reference);
			item.dom.content.appendChild(cell.html);
			this.table.initLinkEvent(cell, column, record);
		}
		for(let icon of this.table.recordOperation){
			let operation = await icon.renderCard(item, record);
			item.dom.operation.appendChild(operation.html);
		}
		return item;
	}
}