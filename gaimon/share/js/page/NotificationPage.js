const NotificationLevel = {
	'INFO' : 20,
	'WARNING' : 30,
	'ERROR' : 40,
};

const NotificationPage = function(main, parent) {
	AbstractPage.call(this, main, parent);

	const object = this;
	this.title = 'Notification';
	this.model = 'Notification';
	this.pageNumber = 1;
	this.protocol = new NotificationProtocol(main);
	this.filter = null;
	this.fetchedFiltered = null;
	this.count = 20;
	this.limit = 10;
	this.iconMap = {};
	this.isIconInit = false;

	this.initEvent = async function(){
		if(object.home.dom.add) object.home.dom.add.hide();
		object.filterForm = await object.renderSearchForm(object.model);
		object.home.dom.search.onclick = async function(){
			object.home.dom.filter.show();
		}

		object.filterForm.dom.cancel.onclick = async function(){
			object.filter = null;
			await object.getNotification();
			object.home.dom.filter.hide();
		}

		object.filterForm.dom.submit.onclick = async function(){
			let result = object.filterForm.getData();
			object.filter = result.data;
			object.fetchedFiltered = null;
			let notifyTime = result.data.notifyTime;
			if(notifyTime != '' && notifyTime != null){
				await object.getNotification();
				object.home.dom.filter.hide();
			}else{
				SHOW_ALERT_DIALOG('Please, select notify date.');
			}
		}
	}

	this.createIconMap = async function(){
		object.iconMap[NotificationLevel.INFO] = await CREATE_SVG_ICON('Info');
		object.iconMap[NotificationLevel.WARNING] = await CREATE_SVG_ICON('Warning');
		object.iconMap[NotificationLevel.ERROR] = await CREATE_SVG_ICON('Error');
		console.log(object.iconMap);
	}
	
	this.render = async function() {
		AbstractPage.prototype.render.call(this);
		if(!object.isIconInit){
			await object.createIconMap();
			object.isIconInit = true;
		}
		await object.getNotification();
	}

	this.getNotification = async function(){
		let result = object.formatData(await object.fetchData());
		result.hasEdit = false;
		result.hasDelete = false;
		await object.renderTable(object.model, result);
		await object.initEvent();
	}

	this.formatData = function(data){
		let result = [];
		console.log(data);
		for(let i of data){
			result.push({
				'notifyTime' : i.formattedDate,
				'level' : object.iconMap[i.level].icon,
				'info' : i.info.message,
			});
		}
		return {'data': result};
	}

	this.fetchData = async function(){
		let limit = parseInt(object.home.dom.limit.value);
		if(object.filter == null){
			return await object.protocol.getPage(object.pageNumber-1, limit);
		}else{
			if(object.fetchedFiltered == null){
				object.fetchedFiltered = await object.protocol.search(object.filter);
			}
			let start = (object.pageNumber-1)*limit;
			let end = start+limit;
			if(end > object.fetchedFiltered.length) end = object.fetchedFiltered.length;
			let result = [];
			for(let i=start; i<end;i++){
				result.push(object.fetchedFiltered[i]);
			}
			return result;
		}
	}
}