const DocumentSimpleStatus = {
	'DRAFT': 10,
	'RELEASE': 20
};

const DocumentSimpleStatusManagement = function(main){
	const object = this;
	this.main = main;

	this.getOperation = async function(config = {}){
		let operation = [{
			label: 'document status', ID: 'documentStatus', icon: ''
		}];
		if(config.hasAction) operation.push({label: 'action', ID: 'action', icon: 'DocumentStatus'});
		return operation;
	}

	this.initOperationEvent = async function(table, page){
		let role = GLOBAL.USER.role;
		for(let i in table.records){
			let record = table.records[i];
			await object.setStatus(record);
			if(record.record.documentStatus == DocumentSimpleStatus.DRAFT){
				await object.initDraftEvent(record, page);
			}
		}
	}

	this.setStatus = async function(record){
		let data = record.record;
		if(data.documentStatus == undefined) return;
		if(data.documentStatus == DocumentSimpleStatus.DRAFT){
			record.dom.documentStatus.html('DRAFT');
			record.dom.documentStatus.style.color = '#000';
			record.dom.documentStatus.style.cursor = 'default';
		}else if(data.documentStatus == DocumentSimpleStatus.RELEASE){
			record.dom.documentStatus.html('RELEASE');
			record.dom.documentStatus.style.color = '#078C52';
			record.dom.documentStatus.style.cursor = 'default';
		}
	}

	this.appendDecisionButton = async function(form, page, isForm = true){
		let documentStatus = form.rawData.documentStatus;
		if(isForm){
			await object.appendReleaseButton(form, page);
			await object.appendDraftButton(form, page);			
		}
	}

	this.appendReleaseButton = async function(form, page, isForm){
		let options = {
			cssClass: 'approve_button', 
			ID: 'release',
			label: 'Release'
		}
		let button = new DOMObject(TEMPLATE.Button, options);
		form.dom.operation.prepend(button);
		button.dom.release.onclick = async function(){
			form.documentStatusEnum = DocumentSimpleStatus.RELEASE;
			page.submit(form);
		}
	}

	this.appendDraftButton = async function(form, page){
		let options = {
			cssClass: 'draft_button',
			ID: 'draft',
			label: 'Draft'
		}
		let button = new DOMObject(TEMPLATE.Button, options);
		form.dom.operation.prepend(button);
		button.dom.draft.onclick = async function(){
			form.documentStatusEnum = DocumentSimpleStatus.DRAFT;
			page.submit(form);
		}
	}

	this.appendLabel = async function(form, label){
		let operation = new DOMObject(`<div class="flex-column-center text-align-right width-90px bold">${label}</div>`);
		form.dom.operation.prepend(operation);
		let otherOperation = new DOMObject(`<div class="flex-column-center text-align-right width-90px bold">Other :</div>`);
		form.dom.otherOperation.prepend(otherOperation);
	}

	this.setDecision = async function(config, page){
		let form = config.dialog;
		let operation = new DOMObject(TEMPLATE.DocumentSimpleStatusOperation);
		form.dom.dialog_container.classList.add('document_status');
		form.dom.operation.remove();
		form.dom.form.html('');
		form.dom.form.append(operation);
		form.dom.operation = operation.dom.operation;
		form.dom.otherOperation = operation.dom.otherOperation;

		form.rawData.documentStatus = config.data.documentStatus;
		await object.appendDecisionButton(form, page, false);
	}

	this.setDocument = async function(document, config, data){
		let form = config.dialog;
		form.documentData = data;
		form.dom.form.append(document);
	}

	this.initDraftEvent = async function(record, page){
		record.dom.action.onclick = async function(){
			page.renderForm(page.model, {data: record.record});
		}
		if(record.dom.print != undefined) record.dom.print.remove();
	}
}