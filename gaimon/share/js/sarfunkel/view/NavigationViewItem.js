class NavigationViewItem{
	constructor(ID, label, pageID, viewType, data){
		this.ID = ID;
		this.label = label;
		this.pageID = pageID;
		this.viewType = viewType;
		this.data = data;
		this.item = undefined;
		this.callback = undefined;
	}

	async render(isClickable){
		if(this.item == undefined){
			let data = {...this};
			data['isClickable'] = isClickable;
			this.item = new DOMObject(TEMPLATE.NavigationViewItem, data);
		}
		let object = this;
		if (isClickable) this.item.html.classList.add('item');
		else this.item.html.classList.remove('item');
		this.item.html.onclick = async function() {
			if (!isClickable && object.callback) object.callback()
		}
		return this.item;
	}
}