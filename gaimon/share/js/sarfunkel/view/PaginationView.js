class PaginationView{
	constructor(table){
		this.table = table;
		this.pagination = null;
	}

	async render(limit, pageNumber){
		let object = this;
		if(!this.pagination){
			this.pagination = new DOMObject(TEMPLATE.pagination, {limit, pageNumber});
			let dom = this.pagination.dom;
			dom.pageNumber.onkeyup = async (event) => {await object.changePage(event)};
			dom.firstPage.onclick = async (event) => {await object.handleFirstPage(event)};
			dom.backPage.onclick = async (event) => {await object.handleBackPage(event)};
			dom.nextPage.onclick = async (event) => {await object.handleNextPage(event)};
			dom.lastPage.onclick = async (event) => {await object.handleLastPage(event)};
		}
		this.pagination.dom.pageNumber.placeholder = `${pageNumber}/${limit}`;
		return this.pagination;
	}

	async changePage(event){
		if(event.keyCode == 13){
			let page = this.pagination.dom.pageNumber.value;
			if(!page) return;
			if(page < 1 || page > this.totalPage) return;
			await this.table.changePage(page - 1);
		}
	}

	async handleFirstPage(event){
		await this.table.changePage(0);
	}

	async handleBackPage(event){
		if(this.table.currentPage > 0){
			await this.table.changePage(this.table.currentPage - 1);
		}
	}

	async handleNextPage(event){
		if(this.table.currentPage < this.table.totalPage){
			await this.table.changePage(this.table.currentPage + 1);
		}
	}

	async handleLastPage(event){
		await this.table.changePage(this.table.totalPage - 1);
	}
}