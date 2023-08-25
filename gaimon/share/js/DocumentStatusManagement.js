const DocumentStatus = {
	'DRAFT': 10,
	'INTERNAL_IN_CONSIDERATION': 20,
	'INTERNAL_APPROVED': 21,
	'INTERNAL_REJECTED': 22,
	'CUSTOMER_IN_CONSIDERATION': 30,
	'CUSTOMER_APPROVED': 31,
	'CUSTOMER_NOT_APPROVED': 32,
	'CUSTOMER_PARTIALLY_APPROVED': 34,
	'CLOSE': 40,
	'HOLD': 41,
	'CANCEL': 42,
	'PARTIALLY_CANCEL': 43,
};

const DocumentStatusManagement = function(main){
	const object = this;
	this.main = main;

	this.getOperation = async function(config = {}){
		// let operation = [{
		// 	label: 'Document status', ID: 'documentStatus', icon: ''
		// }];
		let operation = [];
		if(config.hasAction == undefined) config.hasAction = true;
		if(config.hasAction) operation.push({label: 'Action', ID: 'action', icon: 'DocumentStatus'});
		if(config.hasPrint) operation.push({label: 'Print', ID: 'print', icon: 'Printer'});
		return operation;
	}

	this.initOperationEvent = async function(table, page){
		let role = GLOBAL.USER.role;
		for(let i in table.records){
			let record = table.records[i];
			await object.setStatus(record);
			if(record.record.documentStatus == DocumentStatus.DRAFT){
				await object.initDraftEvent(record, page);
			}else if(record.record.documentStatus == DocumentStatus.INTERNAL_IN_CONSIDERATION){
				await object.initInternalInConsiderationEvent(record, page);
			}else if(record.record.documentStatus == DocumentStatus.INTERNAL_APPROVED){
				await object.initInternalApproveEvent(record, page);
			}else if(record.record.documentStatus == DocumentStatus.INTERNAL_REJECTED){
				await object.initInternalRejectEvent(record, page);
			}else if(record.record.documentStatus == DocumentStatus.CUSTOMER_IN_CONSIDERATION){
				await object.initCustomerInConsiderationEvent(record, page);
			}else if(record.record.documentStatus == DocumentStatus.CUSTOMER_APPROVED){
				await object.initCustomerApproveEvent(record, page);
			}else if(record.record.documentStatus == DocumentStatus.CUSTOMER_NOT_APPROVED){
				await object.initCustomerNotApproveEvent(record, page);
			}else if(record.record.documentStatus == DocumentStatus.CUSTOMER_PARTIALLY_APPROVED){
				await object.initCustomePartiallyApproveEvent(record, page);
			}else if(record.record.documentStatus == DocumentStatus.CLOSE){
				await object.initCloseEvent(record, page);
			}else if(record.record.documentStatus == DocumentStatus.HOLD){
				await object.initHoldEvent(record, page);
			}else if(record.record.documentStatus == DocumentStatus.CANCEL){
				await object.initCancelEvent(record, page);
			}else{
				if(record.dom.print != undefined){
					record.dom.print.onclick = async function(){
						page.print({data: record.record});
					}
				}
				if(record.dom.action != undefined) record.dom.action.remove();
			}
		}
	}

	this.setStatus = async function(record){
		let data = record.record;
		if(data.documentStatus == undefined) return;
		if(data.documentStatus == DocumentStatus.DRAFT){
			record.dom.documentStatus.html('DRAFT');
			record.dom.documentStatus.style.color = 'BLACK';
			record.dom.documentStatus.style.cursor = 'default';
		}else if(data.documentStatus == DocumentStatus.INTERNAL_IN_CONSIDERATION){
			record.dom.documentStatus.html('INTERNAL IN CONSIDERATION');
			record.dom.documentStatus.style.color = 'ORANGE';
			record.dom.documentStatus.style.cursor = 'default';
		}else if(data.documentStatus == DocumentStatus.INTERNAL_APPROVED){
			// record.dom.documentStatus.html('INTERNAL APPROVED');
			record.dom.documentStatus.html('IA');
			record.dom.documentStatus.style.color = 'GREEN';
			record.dom.documentStatus.style.cursor = 'default';
		}else if(data.documentStatus == DocumentStatus.INTERNAL_REJECTED){
			record.dom.documentStatus.html('INTERNAL REJECTED');
			record.dom.documentStatus.style.color = 'RED';
			record.dom.documentStatus.style.cursor = 'default';
		}else if(data.documentStatus == DocumentStatus.CUSTOMER_IN_CONSIDERATION){
			record.dom.documentStatus.html('CUSTOMER IN CONSIDERATION');
			record.dom.documentStatus.style.color = 'ORANGE';
			record.dom.documentStatus.style.cursor = 'default';
		}else if(data.documentStatus == DocumentStatus.CUSTOMER_APPROVED){
			// record.dom.documentStatus.html('CUSTOMER APPROVED');
			record.dom.documentStatus.html('CA');
			record.dom.documentStatus.style.color = 'GREEN';
			record.dom.documentStatus.style.cursor = 'default';
		}else if(data.documentStatus == DocumentStatus.CUSTOMER_NOT_APPROVED){
			record.dom.documentStatus.html('CUSTOMER NOT APPROVED');
			record.dom.documentStatus.style.color = 'RED';
			record.dom.documentStatus.style.cursor = 'default';
		}else if(data.documentStatus == DocumentStatus.CUSTOMER_PARTIALLY_APPROVED){
			record.dom.documentStatus.html('CUSTOMER PARTIALLY APPROVED');
			record.dom.documentStatus.style.color = 'RED';
			record.dom.documentStatus.style.cursor = 'default';
		}else if(data.documentStatus == DocumentStatus.CLOSE){
			record.dom.documentStatus.html('CLOSE');
			record.dom.documentStatus.style.color = 'GRAY';
			record.dom.documentStatus.style.cursor = 'default';
		}else if(data.documentStatus == DocumentStatus.HOLD){
			record.dom.documentStatus.html('HOLD');
			record.dom.documentStatus.style.color = 'ORANGE';
			record.dom.documentStatus.style.cursor = 'default';
		}else if(data.documentStatus == DocumentStatus.CANCEL){
			record.dom.documentStatus.html('CANCEL');
			record.dom.documentStatus.style.color = 'RED';
			record.dom.documentStatus.style.cursor = 'default';
		}
	}

	this.appendDecisionButton = async function(form, page, isForm = true){
		let documentStatus = form.rawData.documentStatus;
		if(isForm){
			await object.appendApproveButton(form, page, isForm);
			await object.appendDraftButton(form, page);
		}else{
			if(documentStatus == DocumentStatus.INTERNAL_IN_CONSIDERATION){
				await object.appendCancelButton(form, page, isForm);
				await object.appendHoldButton(form, page, isForm);
				await object.appenCloseButton(form, page, isForm);
				await object.appendRejectButton(form, page, isForm);
				await object.appendApproveButton(form, page, isForm);
				await object.appendLabel(form, 'Internal :');
			}else if(documentStatus == DocumentStatus.CUSTOMER_IN_CONSIDERATION){
				await object.appendCancelButton(form, page, isForm);
				await object.appendHoldButton(form, page, isForm);
				await object.appenCloseButton(form, page, isForm);
				await object.appendPartiallyApproveButton(form, page, isForm);
				await object.appendNotApproveButton(form, page, isForm);
				await object.appendApproveButton(form, page, isForm);
				await object.appendLabel(form, 'Customer :');
			}
		}
	}

	this.appendRejectButton = async function(form, page, isForm){
		let options = {
			cssClass: 'reject_button', 
			ID: 'reject',
			label: 'Reject'
		};
		let documentStatus = form.rawData.documentStatus;
		let button = new DOMObject(TEMPLATE.Button, options);
		form.dom.operation.prepend(button);
		button.dom.reject.onclick = async function(){
			form.documentStatusEnum = DocumentStatus.INTERNAL_REJECTED;
			page.submit(form, isForm);
		}
	}

	this.appendApproveButton = async function(form, page, isForm){
		let options = {
			cssClass: 'approve_button', 
			ID: 'approve',
			label: 'Approve'
		}
		let documentStatus = form.rawData.documentStatus;
		let button = new DOMObject(TEMPLATE.Button, options);
		form.dom.operation.prepend(button);
		button.dom.approve.onclick = async function(){
			if(documentStatus == DocumentStatus.INTERNAL_IN_CONSIDERATION || documentStatus == DocumentStatus.CUSTOMER_PARTIALLY_APPROVED){
				form.documentStatusEnum = DocumentStatus.INTERNAL_APPROVED;
			}else if(documentStatus == DocumentStatus.CUSTOMER_IN_CONSIDERATION){
				form.documentStatusEnum = DocumentStatus.CUSTOMER_APPROVED;
			}else if(documentStatus == DocumentStatus.DRAFT){
				form.documentStatusEnum = DocumentStatus.INTERNAL_APPROVED;
			}
			if(documentStatus == undefined) form.documentStatusEnum = DocumentStatus.INTERNAL_APPROVED;
			page.submit(form, isForm);
		}
	}
	
	this.appendNotApproveButton = async function(form, page, isForm){
		let options = {
			cssClass: 'reject_button', 
			ID: 'notApprove',
			label: 'Not Approve'
		};
		let documentStatus = form.rawData.documentStatus;
		let button = new DOMObject(TEMPLATE.Button, options);
		form.dom.operation.prepend(button);
		button.dom.notApprove.onclick = async function(){
			form.documentStatusEnum = DocumentStatus.CUSTOMER_NOT_APPROVED;
			page.submit(form, isForm);
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
			form.documentStatusEnum = DocumentStatus.DRAFT;
			page.submit(form);
		}
	}

	this.appenCloseButton = async function(form, page, isForm){
		let options = {
			cssClass: 'cancel_button',
			ID: 'close',
			label: 'Close'
		}
		let button = new DOMObject(TEMPLATE.Button, options);
		form.dom.otherOperation.prepend(button);
		button.dom.close.onclick = async function(){
			form.documentStatusEnum = DocumentStatus.CLOSE;
			page.submit(form, isForm);
		}
	}
	
	this.appendHoldButton = async function(form, page, isForm){
		let options = {
			cssClass: 'hold_button',
			ID: 'hold',
			label: 'Hold'
		}
		let button = new DOMObject(TEMPLATE.Button, options);
		form.dom.otherOperation.prepend(button);
		button.dom.hold.onclick = async function(){
			form.documentStatusEnum = DocumentStatus.HOLD;
			page.submit(form, isForm);
		}
	}

	this.appendCancelButton = async function(form, page, isForm){
		let options = {
			cssClass: 'reject_button',
			ID: 'cancel',
			label: 'Cancel'
		}
		let button = new DOMObject(TEMPLATE.Button, options);
		form.dom.otherOperation.prepend(button);
		button.dom.cancel.onclick = async function(){
			form.documentStatusEnum = DocumentStatus.CANCEL;
			page.submit(form, isForm);
		}
	}

	this.appendPartiallyCancelButton = async function(form, page, isForm){
		let options = {
			cssClass: 'partially_cancel_button',
			ID: 'partiallyCancel',
			label: 'Partially Cancel'
		}
		let button = new DOMObject(TEMPLATE.Button, options);
		form.dom.otherOperation.prepend(button);
		button.dom.partiallyCancel.onclick = async function(){
			form.documentStatusEnum = DocumentStatus.PARTIALLY_CANCEL;
			page.submit(form, isForm);
		}
	}

	this.appendPartiallyApproveButton = async function(form, page, isForm){
		let options = {
			cssClass: 'partially_cancel_button',
			ID: 'partiallyApprove',
			label: 'Partially Approve'
		}
		let button = new DOMObject(TEMPLATE.Button, options);
		form.dom.operation.prepend(button);
		button.dom.partiallyApprove.onclick = async function(){
			form.documentStatusEnum = DocumentStatus.CUSTOMER_PARTIALLY_APPROVED;
			page.setPartiallyApprove(form);
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
		let operation = new DOMObject(TEMPLATE.DocumentStatusOperation);
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
		if(record.dom.action != undefined){
			record.dom.action.onclick = async function(){
				page.renderForm(page.model, {data: record.record});
			}
		}
		if(record.dom.print != undefined) record.dom.print.remove();
	}

	this.initInternalInConsiderationEvent = async function(record, page){
		if(record.dom.action != undefined){
			record.dom.action.onclick = async function(){
				page.renderDialog(page.model, {data: record.record, title: page.title});
			}
		}
		if(record.dom.print != undefined) record.dom.print.remove();
	}

	this.initInternalApproveEvent = async function(record, page){
		let domObject = new DOMObject((await CREATE_SVG_ICON('DocumentSender')).icon);
		record.dom.action.html('');
		record.dom.action.append(domObject);
		if(record.dom.action != undefined){
			record.dom.action.onclick = async function(){
				page.updateDocumentStatus(record.record.id, DocumentStatus.CUSTOMER_IN_CONSIDERATION);
			}
		}
		if(record.dom.print != undefined){
			record.dom.print.onclick = async function(){
				page.print({data: record.record});
			}
		}
	}
	
	this.initInternalRejectEvent = async function(record, page){
		if(record.dom.action != undefined) record.dom.action.remove();
		if(record.dom.print != undefined) record.dom.print.remove();
	}

	this.initCustomerInConsiderationEvent = async function(record, page){
		if(record.dom.action != undefined){
			record.dom.action.onclick = async function(){
				page.renderDialog(page.model, {data: record.record, title: page.title});
			}
		}
		if(record.dom.print != undefined){
			record.dom.print.onclick = async function(){
				page.print({data: record.record});
			}
		}
	}

	this.initCustomerApproveEvent = async function(record, page){
		if(record.dom.print != undefined){
			record.dom.print.onclick = async function(){
				page.print({data: record.record});
			}
		}
		if(record.dom.action != undefined) record.dom.action.remove();
	}

	this.initCustomerNotApproveEvent = async function(record, page){
		if(record.dom.print != undefined){
			record.dom.print.onclick = async function(){
				page.print({data: record.record});
			}
		}
		if(record.dom.action != undefined) record.dom.action.remove();
	}

	this.initCustomePartiallyApproveEvent = async function(record, page){
		if(record.dom.action != undefined) record.dom.action.remove();
		if(record.dom.print != undefined) record.dom.print.remove();
	}

	this.initCloseEvent = async function(record, page){
		if(record.dom.action != undefined) record.dom.action.remove();
		if(record.dom.print != undefined) record.dom.print.remove();
	}

	this.initHoldEvent = async function(record, page){
		if(record.dom.action != undefined) record.dom.action.remove();
		if(record.dom.print != undefined) record.dom.print.remove();
	}

	this.initCancelEvent = async function(record, page){
		if(record.dom.action != undefined) record.dom.action.remove();
		if(record.dom.print != undefined) record.dom.print.remove();
	}
}