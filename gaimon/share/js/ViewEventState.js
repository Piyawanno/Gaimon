let ViewEventState = function(parent, view, config, viewType){
	let object = this;
	
	this.closeFunction;
	this.isSearchForm = false;
	this.isSearchDialog = false;
	this.parent = parent;
	this.view = view;
	this.config = config;
	this.viewType = viewType;
	this.page = parent.page;
	
	if (viewType == 'Form') {
		this.closeFunction = parent.page.cancel;
	} else if (viewType == 'Dialog') {
		config.isSetState = false;
		this.closeFunction = function() {
			parent.page.main.closeDialog();
			// parent.page.main.home.dom.dialog.html('');
		}
	} else if (viewType == 'SearchForm') {
		this.isSearchForm = true;
		config.isSetState = false;
		this.closeFunction = view.clearData;
	} else if (viewType == 'SearchDialog') {
		this.isSearchDialog = true;
		config.isSetState = false;
		this.closeFunction = function(){
			view.dom.form.filter.clearData();
			view.dom.form.filter.filter = {};
			view.dom.form.filter.parameterLabel = {};
			view.dom.form.filter.compare = {};
			parent.page.filter = {};
			SHOW_LOADING_DIALOG(async function(){
				await parent.renderSearchTag(view, view.dom.form.filter);
				await parent.page.getData(parent.page.limit);
				parent.page.main.home.dom.dialog.html('');
			});
		}			
	} else if (viewType == 'ConfirmDialog') {
		config.isSetState = false;
		this.closeFunction = function() {
			main.home.dom.alertDialog.html('');
		}
	} else {
		return;
	}

	this.setViewEvent = function(checkEdit){
		object.setSubmitEvent(object.view);
		object.setCloseEvent(object.view);
		object.setEditEvent(object.view, object.config, checkEdit);
		object.setOperationEvent(object.config);
		object.setShowEvent(object.view, object.config, object.viewType);
	}

	this.setShowEvent = function(view, config, viewType){
		view.show = async function() {
			await object.parent.renderByView(view, config, viewType);
		}
	}

	this.setEditEvent = function(view, config, checkEdit){
		if (view.dom.edit != undefined) {
			if(checkEdit == undefined || checkEdit(config)){
				view.dom.edit.onclick = async function(){
					config.isView = false;
					await object.page.renderView(
						object.page.model, config, 'Form'
					);
				}
			}else{
				view.dom.edit.hide();
			}
		}
	}

	this.setSubmitEvent = function(view){
		let submit = createSubmitEvent(
			object.page,
			view,
			object.isSearchForm,
			object.isSearchDialog
		);
		if (view.dom.submit != undefined) {
			view.dom.submit.onclick = async function(){
				await submit();
			}
		}
		if (view.dom.confirm != undefined) {
			view.dom.confirm.onclick = async function(){
				await submit();
			}
		}
	}

	this.setCloseEvent = function(view){
		if (view.dom.cancel != undefined) {
			view.dom.cancel.onclick = async function(){
				object.closeFunction();
			}
		}

		view.close = object.closeFunction;
		if (view.dom.close != undefined) {
			view.dom.close.onclick = async function(){
				object.page.main.closeDialog();
				// object.page.main.home.dom.dialog.html('');
			}
		}
	}

	this.setOperationEvent = function(config){
		if (config.operation) {
			object.view.dom.operation.html('');
			for (let i in config.operation) {
				let operation = new InputDOMObject(TEMPLATE.Button, config.operation[i]);
				object.view.dom.operation.append(operation, config.operation.ID);
			}
		}
	}
}