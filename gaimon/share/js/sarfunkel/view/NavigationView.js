class NavigationView{
	constructor(){
		this.itemList = [];
		this.itemMap = {};
		this.navigation = null;
	}

	set(item, index){
		let n = this.itemList.length;
		for(let i=0;i<n-index;i++){
			this.itemList.pop();
		}
		this.itemList.push(item);
		this.itemMap[item.ID] = item;
	}

	append(item){
		this.itemList.push(item);
		this.itemMap[item.ID] = item;
	}

	async render(){
		if(!this.navigation){
			let data = {...this};
			this.navigation = new DOMObject(TEMPLATE.NavigationView, data);
		}
		let container = this.navigation.dom.container;
		container.innerHTML = "";
		/// NOTE This last item is not clickable.
		let n = this.itemList.length;
		for(let i=0;i<n;i++){
			let item = this.itemList[i];
			let isClickable = i < n-1 && i > 0;
			let rendered = await item.render(isClickable);
			container.appendChild(rendered.html);
			if (i != n - 1) {
				let arrow = new DOMObject(TEMPLATE.NavigationViewArrow);
				container.appendChild(arrow.html);
			}
		}
		return this.navigation;
	}
}