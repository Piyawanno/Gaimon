const NotificationProtocol = function(main) {
	this.getCurrent = async function() {
		let result = await POST('notification/getCurrent', {}, function(){}, 'json', true);
		if(result == undefined){
			console.log("Error cannot call NotificationProtocol.getCurrent().");
			return [];
		}else if(result.isSuccess){
			return result.notification;
		}else{
			console.log("Error", result.message)
			return [];
		}
	}

	this.count = async function(){
		let result = await POST('notification/count');
		if(result == undefined){
			console.log("Error cannot call NotificationProtocol.count().");
			return -1;
		}else if(result.isSuccess){
			return result.count;
		}else{
			console.log("Error", result.message)
			return -1;
		}
	}

	this.getPage = async function(page, perPage){
		let parameter = {page, perPage};
		let result = await POST('notification/getPage', parameter, function(){}, 'json', true);
		if(result == undefined){
			console.log("Error cannot call NotificationProtocol.getPage.");
			return [];
		}else if(result.isSuccess){
			return result.notification;
		}else{
			console.log("Error", result.message)
			return [];
		}
	}

	this.search = async function(filter){
		let result = await POST('notification/search', filter, function(){}, 'json', true);
		console.log(result); 
		if(result == undefined){
			console.log("Error cannot call NotificationProtocol.getPage.");
			return [];
		}else if(result.isSuccess){
			return result.notification;
		}else{
			console.log("Error", result.message)
			return [];
		}
	}

	this.setAsRead = async function(notificationIDList){
		let result = await POST('notification/setAsRead', {notificationIDList});
		if(result == undefined){
			console.log("Error cannot call NotificationProtocol.setAsRead.");
			return false;
		}else if(result.isSuccess){
			return true;
		}else{
			console.log("Error", result.message)
			return false;
		}
	}

	this.getUnread = async function(startTime) {
		let result = await POST('notification/getUnread', {startTime}, function(){}, 'json', true);
		if(result == undefined){
			console.log("Error cannot call NotificationProtocol.getUnread.");
			return [];
		}else if(result.isSuccess){
			return result.notification;
		}else{
			console.log("Error", result.message)
			return [];
		}
	}
}