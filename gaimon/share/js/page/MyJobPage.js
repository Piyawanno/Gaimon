const MyJobPage = function(main, parent) {
	AbstractPage.call(this, main, parent);

	let object = this;

	this.title = "My job";
	this.model = "PersonalSchedule";
	this.tab = 'schedule';
	this.pageNumber = 1;
	this.limit = 10;
	this.filter = {};
	this.pageNumberDict = {};
	this.config = {hasAdd: false, hasFilter: false, hasLimit: false};
	this.calendar = new Calendar();
	this.schedule = new Calendar();

	this.prepare = async function() {
	}

	this.getMenu = async function(isSubMenu) {
		object.menu = await CREATE_MENU(object.pageID, 'Schedule', 'Schedule', isSubMenu);
		return object.menu;
	}

	this.render = async function() {
		AbstractPage.prototype.render.call(this);
		object.tabMenu = await object.appendTabMenu();
		await object.tabMenu[object.tab].click();
	}

	this.renderState = async function(state) {
		if (state.state == 'search') await object.renderSearchForm(object.model, {isSetState: false});
		if (state.state == 'form') await object.rendeView(object.model, {isSetState: false, data: state.data, isView: state.isView});
	}

	this.renderLocalize = async function() {
		
	}

	this.appendTabMenu = async function(){
		let menu = [
			{'value': 'schedule', 'label': 'Schedule'},
			{'value': 'calendar', 'label': 'Calendar'}
		]
		let tabMenu = await object.renderTabMenu(menu);
		let classList = tabMenu.getElementsByClassName('abstract_tab_menu');
		tabMenu.schedule.onclick = async function() {
			object.home.dom.title.html('Schedule');
			object.tab = 'schedule';
			object.pageState = object.tab;
			object.pageNumberDict[object.pageState] = 1
			await object.setHighlightTab(classList, this);
			await object.renderSchedule();
		}
		tabMenu.calendar.onclick = async function() {
			object.home.dom.title.html('Calendar');
			object.tab = 'calendar';
			object.pageState = object.tab;
			object.pageNumberDict[object.pageState] = 1
			await object.setHighlightTab(classList, this);
			await object.renderCalendar();
		}
		return tabMenu;
	}

	this.renderSchedule = async function() {
		await object.schedule.appendSource('PersonalSchedule', object.loadSchedule, object.showEventDialog)

		let calendar = await object.schedule.render(object.schedule.CALENDAR_VIEW.SCHEDULE_ONLY);
		object.home.dom.table.html('');
		object.home.dom.table.append(calendar);
	}

	this.renderCalendar = async function() {
		await object.calendar.appendSource('PersonalSchedule', object.loadSchedule, object.showEventDialog)

		let calendar = await object.calendar.render(object.calendar.CALENDAR_VIEW.CALENDAR_ONLY);
		object.home.dom.table.html('');
		object.home.dom.table.append(calendar);
	}

	this.loadSchedule = async function(startTime) {
		let event = [];
		event.push(...await object.main.protocol.schedule.getPersonalSchedule(startTime));
		return event;
	}

	this.updateSchedule = async function(data) {
		return object.main.protocol.schedule.updatePersonalSchedule(data);
	}

	this.showEventDialog = async function(data) {
		let config = {isSetState: false, data:data, title: data.subject};
		config.operation = [
			{label: "Operate", ID: "operate", cssClass: "approve_button"},
			{label: "Submit", ID: "submit", cssClass: "submit_button"},
			{label: "Cancel", ID: "cancel", cssClass: "cancel_button"}
		]
		let dialog = await object.renderDialog(object.model, config);
		dialog.dom.operation.operate.onclick = async function() {
			let callback = getScheduleEventType(data.eventType);
			if (callback) callback(data.referenceID);
		}
		dialog.dom.operation.cancel.onclick = async function() {
			dialog.close();
		}
		dialog.dom.operation.submit.onclick = async function() {
			let result = dialog.getData();
			if (result.data.isNotify) {
				if (result.data.notificationUnit == -1) {
					dialog.dom.notificationUnit.classList.add('error');
					result.isPass = false;
				} else dialog.dom.notificationUnit.classList.remove('error');
				if (result.data.notificationTime == 0) {
					dialog.dom.notificationTime.classList.add('error');
					result.isPass = false;
				} else dialog.dom.notificationTime.classList.remove('error');
				if (!result.isPass) return;
			} else {
				dialog.dom.notificationUnit.classList.remove('error');
				dialog.dom.notificationTime.classList.remove('error');
			}
			result.data.id = data.id;
			let isSuccess = await object.updateSchedule(result.data);
			if (isSuccess) {
				await object.calendar.refresh();
				await dialog.dom.cancel.click();
			}
		}
		dialog.dom.startTime.disable();
	}
}