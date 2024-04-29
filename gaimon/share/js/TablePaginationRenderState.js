let TablePaginationRenderState = function(parent, limit, count, component){
	let object = this;

	if (limit == undefined || isNaN(parseInt(limit))){
		limit = parent.page.limit;
	}
	this.parent = parent;
	this.page = parent.page;
	this.limit = parseInt(limit);
	this.count = count;
	this.component = component;

	this.render = async function(){
		await object.getOption();
		await object.getComponent();
		let pagination = new DOMObject(TEMPLATE.Pagination, object.options);
		object.initEvent(pagination);
		return pagination;
	}

	this.getOption = async function(){
		object.options = {
			pageNumber: await object.page.getPageNumber(),
			limit: object.count
		}
	}

	this.getComponent = async function(){
		if (object.component.getPageNumber){
			object.options.pageNumber = await object.component.getPageNumber();
		}
	}

	this.initEvent = function(pagination){
		object.initFirstPageEvent(pagination);
		object.initBackPageEvent(pagination);
		object.initPageNumberEvent(pagination);
		object.initNextPageEvent(pagination);
		object.initLastPageEvent(pagination);
	}

	this.initFirstPageEvent = function(pagination){
		let component = object.component;
		pagination.dom.firstPage.onclick = async function(){
			if (component && component.limit && typeof component.limit == 'object'){
				object.limit = parseInt(component.limit.value);
			}
			SHOW_LOADING_DIALOG(async function(){
				if (component && component.setPageNumber) component.setPageNumber(1);
				else await object.page.setPageNumber(1);
				if (component && component.renderFunction) component.renderFunction(object.limit);
				else await object.page.getData(object.limit);
			});			
		}
	}

	this.initBackPageEvent = function(pagination){
		let component = object.component;
		pagination.dom.backPage.onclick = async function(){
			let pageNumber;
			if (component && component.getPageNumber) pageNumber = component.getPageNumber();
			else pageNumber = await object.page.getPageNumber();
			pageNumber = pageNumber - 1;
			if(pageNumber < 1) pageNumber = 1;
			if (component && component.limit && typeof component.limit == 'object'){
				object.limit = parseInt(component.limit.value);
			}
			SHOW_LOADING_DIALOG(async function(){
				// await object.page.setPageNumber(pageNumber);
				// await object.page.getData(limit);
				if (component && component.setPageNumber) component.setPageNumber(pageNumber);
				else await object.page.setPageNumber(pageNumber);
				if (component && component.renderFunction) component.renderFunction(object.limit);
				else await object.page.getData(object.limit);
			});
		}
	}

	this.initPageNumberEvent = function(pagination){
		let component = object.component;
		pagination.dom.pageNumber.onkeyup = async function(event){
			if(event.keyCode == 13){
				let pageNumber = parseInt(this.value);
				if(pageNumber < 1) pageNumber = 1;
				if(pageNumber > count) pageNumber = count;
				if (component && component.limit && typeof component.limit == 'object'){
					object.limit = parseInt(component.limit.value);
				}
				SHOW_LOADING_DIALOG(async function(){
					// await object.page.setPageNumber(pageNumber);
					// await object.page.getData(limit);
					if (component && component.setPageNumber) component.setPageNumber(pageNumber);
					else await object.page.setPageNumber(pageNumber);
					if (component && component.renderFunction) component.renderFunction(object.limit);
					else await object.page.getData(object.limit);
				});
			}
		}
	}

	this.initNextPageEvent = function(pagination){
		let component = object.component;
		
		pagination.dom.nextPage.onclick = async function(){
			let pageNumber;
			if (component && component.getPageNumber) pageNumber = component.getPageNumber();
			else pageNumber = await object.page.getPageNumber();
			pageNumber = pageNumber + 1;
			if (component && component.getCount) count = component.getCount();
			if(pageNumber > count) pageNumber = count;
			if (component && component.limit && typeof component.limit == 'object'){
				object.limit = parseInt(component.limit.value);
			}
			SHOW_LOADING_DIALOG(async function(){
				// await object.page.setPageNumber(pageNumber);
				// await object.page.getData(limit);
				if (component && component.setPageNumber) component.setPageNumber(pageNumber);
				else await object.page.setPageNumber(pageNumber);
				if (component && component.renderFunction) component.renderFunction(object.limit);
				else await object.page.getData(object.limit);
			});
		}
	}

	this.initLastPageEvent = function(pagination){
		let component = object.component;
		pagination.dom.lastPage.onclick = async function(){
			if (component && component.limit && typeof component.limit == 'object'){
				object.limit = parseInt(component.limit.value);
			}
			SHOW_LOADING_DIALOG(async function(){
				// await object.page.setPageNumber(count);
				// await object.page.getData(limit);
				if (component && component.setPageNumber) component.setPageNumber(count);
				else await object.page.setPageNumber(count);
				if (component && component.renderFunction) component.renderFunction(object.limit);
				else await object.page.getData(object.limit);
			});
		}
	}
}