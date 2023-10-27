const AbstractTableForm = function(page) {
	let object = this;

	object.page = page;

	this.prepareTableInput = async function(input, isView) {
		for(let i in input){
			input[i].inputPerLine = 1;
			if (input[i].config == undefined) input[i].config = {};
			input[i].config.isView = isView;
			let rawInput = renderInput(input[i]);
			if (rawInput.dom.labelDIV != undefined) rawInput.dom.labelDIV.remove();
			input[i].input = rawInput.html.outerHTML;
		}
	}

	this.deleteRecord = async function(table, view, config) {
		SHOW_CONFIRM_DIALOG('Do you want to delete this data?', async function(){
			let records = [];
			for (let i in table.records) {
				if (table.records[i].uid != view.uid) records.push(table.records[i]);
			}
			table.records = records;
			view.html.remove();
			if (view.onDelete != undefined && config.data != undefined) await view.onDelete(config.data);
			// if (view.onDelete != undefined) await view.onDelete(config.data);
		});
	}

	this.getRecord = async function(modelName, config, input, table) {
		config.isUpdate = false;
		if (config.data != undefined) config.isUpdate = true;
		if (input == undefined) input = await object.page.getCompleteInputData(modelName);
		let {exceptURL, autoCompleteMap, fileMatrixMap, imageMap, inputs} = await object.page.util.prepareInput(modelName, input);
		await object.prepareTableInput(input, config.isView)
		// let options = {'tbody': input};
		config.tbody = input;
		let view = new DOMObject(TEMPLATE.TableFormBody, config);
		view.modelName = modelName;
		view.uid =`${randomString(10)}_${Date.now()}`;
		await object.page.tableView.renderOperation(view, TEMPLATE.TableOperationRecord, config);
		if (view.dom.delete != undefined) {
			view.dom.delete.onclick = async function() {
				object.deleteRecord(table, view, config);
			}
		}
		await object.page.util.setAutoCompleteMap(view, autoCompleteMap);
		await object.page.util.setFileMatrixMap(view, fileMatrixMap);
		await object.page.util.setImageMap(view, imageMap);
		await object.page.util.setPrerequisiteInput(modelName, exceptURL, view, config.data);

		let columnLinkMap = {};
		if (config.data) {
			columnLinkMap = AbstractInputUtil.prototype.getLinkColumn(input, config.data)
		}

		if (config.isUpdate) {
			view.id = config.data.id;
			view.record = config.data;
			view.setData(config.data);
			for (let i in view.__autocomplete__) {
				await view.fetchValueAutocomplete(view.__autocomplete__[i], config.data[i], config.data, view.dom[`${i}_view`], i);
			}
			for (let columnName in columnLinkMap) {
				if (config.isView && columnLinkMap[columnName]) {
					view.dom[`${columnName}_view`].classList.add('hotLink');
					view.dom[`${columnName}_view`].onclick = async function() {
						AbstractInputUtil.prototype.triggerLinkEvent(object.page, columnLinkMap[columnName]);
					}
				}
			}
			
			// view
		}
		
		if(config.hasDelete){
			view.dom.delete.onclick = async function(){
				SHOW_CONFIRM_DIALOG('Do you want to delete this data?', async function(){
					let data = config.data;	
					let index = table.records.indexOf(view);
					if (index > -1) table.records.splice(index, 1);
					view.html.remove();
					if(config.deleteFunction != undefined){
						config.deleteFunction(data.id);
					} else {
						if (table.onDeleteRecord != undefined) await table.onDeleteRecord(view);
						else if (view.onDelete != undefined) await view.onDelete(data);
					}
				});
			}
		}
		if(config.isView) view.readonly();
		return view;
	}
	
}