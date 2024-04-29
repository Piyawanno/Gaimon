class PaginationView{
	constructor(table){
		this.table = table;
		this.pagination = null;
	}

	async render(limit, pageNumber){
		let object = this;
		if(!this.pagination){
			this.pagination = new DOMObject(TEMPLATE.Pagination, {limit, pageNumber});
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

	refresh() {
		this.pagination.dom.pageNumber.placeholder = `${this.table.currentPage}/${this.table.totalPage}`;
	}

	async changePage(event){
		if(event.keyCode == 13){
			let page = this.pagination.dom.pageNumber.value;
			if(!page) return;
			page = parseInt(page);
			this.pagination.dom.pageNumber.value = '';
			if(page < 1 || page > this.table.totalPage) {
				SHOW_ALERT_DIALOG("The page number is out of range.");
				return;
			}
			await this.table.changePage(parseInt(page));
		}
	}

	async handleFirstPage(event){
		await this.table.changePage(1);
	}

	async handleBackPage(event){
		let pageNumber = this.table.currentPage - 1;
		if (pageNumber <= 0) return;
		await this.table.changePage(pageNumber);
	}

	async handleNextPage(event){
		let pageNumber = this.table.currentPage + 1;
		if (pageNumber > this.table.totalPage) return;
		await this.table.changePage(pageNumber);
	}

	async handleLastPage(event){
		await this.table.changePage(this.table.totalPage);
	}
}