const Notification = function(main) {
	const object = this;

	this.isWebSocket = main.isWebSocket;
	this.main = main;
	this.isInitLoop = false;
	this.startInterval = 5_000;
	this.maxInterval = 10*60*1_000;
	this.intervalFactor = 1.5;
	this.currentInterval = 10_000;
	this.maxCurrent = 5;
	this.protocol = new NotificationProtocol(main);
	this.countElement = null;
	this.unreadList = [];
	this.currentList = [];
	this.currentMap = {};
	this.lastFetched = -1;
	this.iconMap = {};

	this.startLoop = async function(){
		if(!object.isInitLoop){
			object.isInitLoop = true;
			object.initEvent();
			object.initListContainer();
			object.fetchCurrent();
			if(object.isWebSocket){
				await object.connectSocket();
			}else{
				object.checkNotification();
			}
			object.createIconMap();
		}
	}

	this.initEvent = function(){
		document.addEventListener("visibilitychange", (event) => {
			if (document.visibilityState == "visible") {
				object.currentInterval = object.startInterval;
				console.log("Change to this tab set to notification min interval : ", object.currentInterval);
			} else {
				object.currentInterval = object.maxInterval;
				console.log("Change from this tab set to notification max interval : ", object.currentInterval);
			}
		});
	}

	this.initListContainer = async function(){
		object.listDOM = new DOMObject(TEMPLATE.NotificationList);
		object.listDOM.dom.button.onclick = async function(){
			await object.main.page.notificationPage.setPageState();
			await object.main.page.notificationPage.render();
		}
	}

	this.initIconEvent = function(icon){
		object.countElement = icon.notificationCount;
		object.renderCount();
	}

	this.connectSocket = function(){
		object.main.websocketRegister.appendRegister(
			'/notification',
			null,
			null,
			function(result){
				try{
					object.unreadList.push(result);
					object.renderCount();
					object.renderList();
				}catch(error){
					console.log(error);
				}
			}, function(){
				object.checkNotification();
			}
		);
		object.fetchUnread();
	}

	this.checkNotification = function(){
		console.log(">>> Start Notification Polling");
		object.fetchUnread().then(function(){
			setTimeout(object.checkNotification, object.currentInterval);
		})
	}

	this.fetchCurrent = async function(){
		await object.protocol.getCurrent().then(function(notification){
			object.currentList = notification;
			
			object.createCurrentMap();
			object.renderList();
		});
	}

	
	this.fetchUnread = async function(){
		let notification = await object.protocol.getUnread(object.lastFetched);
		object.lastFetched = Math.floor(Date.now() / 1000);
		if(notification.length > 0){
			object.currentInterval = object.startInterval;
			notification = object.checkRepeat(notification);
			object.renderCount(notification);
			object.renderList();
		}else{
			if(object.currentInterval < object.maxInterval){
				object.currentInterval = object.currentInterval*object.intervalFactor;
			}
		}
	}

	this.checkRepeat = function(notifications){
		result = [];
		if(notifications != undefined){
			for(let i in notifications){
				let notification = notifications[i];
				if ( object.currentMap[notification.ID]){

				}else{
					result.push(notification);
				}
			}
		}
		return result;
	}

	this.renderCount = function(notification){
		if(notification != undefined){
			object.unreadList = object.unreadList.concat(notification);
		}
		let length = object.unreadList.length;
		if(length > 0){
			object.countElement.textContent = length;
			object.countElement.show();
		}else{
			object.countElement.textContent = "0";
			object.countElement.hide();
		}
	}

	this.renderList = async function(){
		let notificationList = object.mergeNotification();
		object.listDOM.dom.listContainer.html('');
		for(let notification of notificationList){
			notification.icon = object.iconMap[notification.level].icon;
			const domObject = new DOMObject(TEMPLATE.NotificationListItem, {notification});
			if(notification.type == 12){
				domObject.dom.notificationItem.onclick = async function(){
					console.log(notification);
					let callback = getNotificationEventType(notification.info.eventType);
					if (callback) callback(notification.info);
				}
			}
			object.listDOM.dom.listContainer.append(domObject);
		}
	}

	this.createIconMap = async function(){
		object.iconMap[NotificationLevel.INFO] = await CREATE_SVG_ICON('Info');
		object.iconMap[NotificationLevel.WARNING] = await CREATE_SVG_ICON('Warning');
		object.iconMap[NotificationLevel.ERROR] = await CREATE_SVG_ICON('Error');
	}

	this.setAsRead = function(){
		let unreadID = [];
		for(let unread of object.unreadList){
			unreadID.push(unread.ID);
		}

		if(unreadID.length > 0){
			object.protocol.setAsRead(unreadID);
		}

		let notificationList = object.mergeNotification();
		object.unreadList = [];
		object.currentList = notificationList.slice(0, object.maxCurrent);
		object.createCurrentMap();
	}

	this.mergeNotification = function(){
		let notificationList = [];
		for(let i of object.currentList){
			notificationList.push(i);
		}
		for(let i of object.unreadList){
			if(!(i.ID in object.currentMap)){
				notificationList.push(i);
			}
		}
		notificationList.sort(function(a, b){return b.time - a.time});
		return notificationList;
	}

	this.createCurrentMap = function(){
		object.currentMap = {};
		for(let i of object.currentList){
			object.currentMap[i.ID] = i;
		}
	}

	this.showList = function(){
		object.setAsRead();
		object.renderCount();
		object.listDOM.dom.container.toggle();
		object.setPositionNotificationList();
		object.main.home.dom.notificationList.html('');
		object.main.home.dom.notificationList.append(object.listDOM);
	}

	this.setPositionNotificationList = function(){
		let right = object.main.personalBar.home.dom.notification.getBoundingClientRect().right;
		object.main.home.dom.notificationList.style.right = `calc(100vw - ${right}px - 12px)`;
	}
}