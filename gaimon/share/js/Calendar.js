const Calendar = function() {
	const object = this;
	object.template = {};
	object.isInit = false
	object.calendarType = 3;
	object.currentDate;
	object.monthlyLocale = {
		'th': new Intl.DateTimeFormat('th-TH', {year: 'numeric', month: 'long'}), 
		'en': new Intl.DateTimeFormat('en-US', {year: 'numeric', month: 'long'})
	}
	object.dailyLocale = {
		'th': new Intl.DateTimeFormat('th-TH', {year: 'numeric', month: 'long', day: 'numeric'}), 
		'en': new Intl.DateTimeFormat('en-US', {year: 'numeric', month: 'long', day: 'numeric'})
	}
	object.scheduleLocale = {
		'th': new Intl.DateTimeFormat('th-TH', {month: 'short', weekday: 'short'}), 
		'en': new Intl.DateTimeFormat('en-US', {month: 'short', weekday: 'short'})
	}
	object.weekdayLocale = {
		'th': new Intl.DateTimeFormat('th-TH', {weekday: 'short'}), 
		'en': new Intl.DateTimeFormat('en-US', {weekday: 'short'})
	}
	object.yearLocale = {
		'th': new Intl.DateTimeFormat('th-TH', {year: 'numeric'}), 
		'en': new Intl.DateTimeFormat('en-US', {year: 'numeric'})
	}
	object.monthLocale = {
		'th': new Intl.DateTimeFormat('th-TH', {month: 'short'}), 
		'en': new Intl.DateTimeFormat('en-US', {month: 'short'})
	}
	object.timeLocale = {
		'th': new Intl.DateTimeFormat('th-TH', {timeStyle: 'short'}), 
		'en': new Intl.DateTimeFormat('en-US', {timeStyle: 'short', hourCycle: 'h12'}) 
	}

	object.selectedYear;
	object.selectedMonth;
	object.selectedDate;
	object.selectedWeek;
	object.selectedTime;
	object.event = [];
	object.eventLoaderFuntion = [];
	object.sources = {};
	object.CALENDAR_VIEW = {
		ALL: 1,
		CALENDAR_ONLY: 2,
		SCHEDULE_ONLY: 3
	}
	object.calendarView = object.CALENDAR_VIEW.ALL;

	this.render = async function(calendarView) {
		if (calendarView == undefined) calendarView = object.CALENDAR_VIEW.ALL;
		object.calendarView = calendarView;
		object.currentDate = new Date();
		object.setSelectedDate(object.currentDate);
		
		if (!object.isInit) {
			let startTime = new Date();
			startTime.setFullYear(object.selectedYear);
			startTime.setMonth(object.selectedMonth);
			startTime.setDate(1);
			startTime.resetTime();
			await object.loadEvent(startTime.getTime() / 1000.0)
			await object.loadTemplate();
			object.calendar = new DOMObject(object.template.calendar);
			await object.initEvent();
			if (object.calendarView == object.CALENDAR_VIEW.ALL) {
				await object.renderMonthly(object.currentDate.getMonth(), object.currentDate.getFullYear());
			} else if (object.calendarView == object.CALENDAR_VIEW.CALENDAR_ONLY) {
				object.calendar.dom.schedule.remove()
				await object.renderMonthly(object.currentDate.getMonth(), object.currentDate.getFullYear());
			} else if (object.calendarView == object.CALENDAR_VIEW.SCHEDULE_ONLY) {
				object.calendar.dom.week.remove();
				object.calendar.dom.month.remove();
				object.calendarType = 4;
				object.calendar.dom.calendarType.value = 4;
				await object.renderSchedule(object.currentDate.getDate(), object.currentDate.getMonth(), object.currentDate.getFullYear());
			}
			object.isInit = true;
		} else {
			object.refresh();
		}
		return object.calendar;
	}

	this.refresh = async function() {
		let startTime = new Date();
		startTime.setFullYear(object.selectedYear);
		startTime.setMonth(object.selectedMonth);
		startTime.setDate(1);
		startTime.resetTime();
		await object.loadEvent(startTime.getTime() / 1000.0)
		object.calendar.renderLocalize();
		object.calendar.dom.calendarType.onchange();
	}

	this.loadEvent = async function(startTime) {
		let events = [];
		for (let sourceName in object.sources) {
			let source = object.sources[sourceName];
			let event = await source.loaderFuntion(startTime);
			for (let item of event) {
				item.sourceName = sourceName;
			}
			events.push(...event);
		}
		object.event = events;
	}

	this.removeSource = async function() {
		delete object.sources[sourceName]
	}

	this.appendSource = async function(sourceName, loaderFuntion, eventHanlderFuntion) {
		object.sources[sourceName] = {loaderFuntion, eventHanlderFuntion}
	}
	

	this.setSelectedDate = async function(date) {
		object.selectedYear = date.getFullYear();
		object.selectedMonth = date.getMonth();
		object.selectedDate = date.getDate();
		object.selectedWeek = date.getWeekOfMonth();
		object.selectedTime = new Date()
		object.selectedTime.setDate(object.selectedDate);
		object.selectedTime.setMonth(object.selectedMonth);
		object.selectedTime.setFullYear(object.selectedYear);
		object.selectedTime.resetTime();
	}

	this.loadTemplate = async function() {
		object.template.calendar = await TEMPLATE.get('Calendar');
		object.template.monthly = await TEMPLATE.get('CalendarMonthly');
		object.template.monthlyEvent = await TEMPLATE.get('CalendarMonthlyEvent');
		object.template.weekly = await TEMPLATE.get('CalendarWeekly');
		object.template.weeklyEvent = await TEMPLATE.get('CalendarWeeklyEvent');
		object.template.daily = await TEMPLATE.get('CalendarDaily');

		object.template.schedule = await TEMPLATE.get('CalendarSchedule');
		object.template.scheduleRow = await TEMPLATE.get('CalendarScheduleRow');
		object.template.scheduleEvent = await TEMPLATE.get('CalendarScheduleEvent');
	}

	this.onToday = async function() {
		if (object.calendarType == 1) {
			let date = new Date();
			object.setSelectedDate(date);
			await object.renderDaily(object.selectedDate, object.selectedMonth, object.selectedYear);
		} else if (object.calendarType == 2) {
			let date = new Date();
			object.setSelectedDate(date);
			await object.renderWeekly(object.selectedWeek, object.selectedMonth, object.selectedYear);
		} else if (object.calendarType == 3) {
			let date = new Date();
			object.setSelectedDate(date);
			await object.renderMonthly(object.selectedMonth, object.selectedYear);
		} else if (object.calendarType == 4) {
			let date = new Date();
			object.setSelectedDate(date);
			await object.renderSchedule(object.selectedDate, object.selectedMonth, object.selectedYear);
		}
	}

	this.changeCalendarTypeHandler = async function(calendarType) {
		object.calendarType = parseInt(calendarType);
		if (object.calendarType == 1) {
			await object.renderDaily(object.selectedDate, object.selectedMonth, object.selectedYear);
		} else if (object.calendarType == 2) {
			await object.renderWeekly(object.selectedWeek, object.selectedMonth, object.selectedYear);
		} else if (object.calendarType == 3) {
			await object.renderMonthly(object.selectedMonth, object.selectedYear);
		} else if (object.calendarType == 4) {
			await object.renderSchedule(object.selectedDate, object.selectedMonth, object.selectedYear);
		}
	}

	this.onNext = async function() {
		if (object.calendarType == 1) {
			let date = new Date();
			date.setFullYear(object.selectedYear);
			date.setMonth(object.selectedMonth);
			date.setDate(object.selectedDate + 1);

			object.setSelectedDate(date);
			await object.renderDaily(object.selectedDate, object.selectedMonth, object.selectedYear);
		} else if (object.calendarType == 2) {
			let date = new Date();
			let currentMonth = object.selectedMonth;
			date.setFullYear(object.selectedYear);
			date.setMonth(object.selectedMonth);
			date.setDate(object.selectedDate + 7);

			if (date.getMonth() != currentMonth) date.setDate(1);
			object.setSelectedDate(date);
			await object.renderWeekly(object.selectedWeek, object.selectedMonth, object.selectedYear);
		} else if (object.calendarType == 3) {
			let date = new Date();
			date.setFullYear(object.selectedYear);
			date.setMonth(object.selectedMonth + 1);
			date.setDate(1);

			object.setSelectedDate(date);
			await object.renderMonthly(date.getMonth(), date.getFullYear());
		} else if (object.calendarType == 4) {
			let date = new Date();
			date.setFullYear(object.selectedYear);
			date.setMonth(object.selectedMonth);
			date.setDate(object.selectedDate + 1);

			object.setSelectedDate(date);
			await object.renderSchedule(object.selectedDate, object.selectedMonth, object.selectedYear);
		}
	}

	this.onBack = async function() {
		if (object.calendarType == 1) {
			let date = new Date();
			date.setFullYear(object.selectedYear);
			date.setMonth(object.selectedMonth);
			date.setDate(object.selectedDate - 1);

			object.setSelectedDate(date);
			await object.renderDaily(object.selectedDate, object.selectedMonth, object.selectedYear);
		} else if (object.calendarType == 2) {
			let date = new Date();
			let currentMonth = object.selectedMonth;
			date.setFullYear(object.selectedYear);
			date.setMonth(object.selectedMonth);
			date.setDate(object.selectedDate - 7);

			if (date.getMonth() != currentMonth) {
				date = new Date(date.getFullYear(), date.getMonth() + 1, 0);
			}
			object.setSelectedDate(date);
			await object.renderWeekly(object.selectedWeek, object.selectedMonth, object.selectedYear);
		} else if (object.calendarType == 3) {
			let date = new Date();
			date.setFullYear(object.selectedYear);
			date.setMonth(object.selectedMonth - 1);
			date.setDate(1);
			
			object.setSelectedDate(date);
			await object.renderMonthly(date.getMonth(), date.getFullYear());
		} else if (object.calendarType == 4) {
			let date = new Date();
			date.setFullYear(object.selectedYear);
			date.setMonth(object.selectedMonth);
			date.setDate(object.selectedDate - 1);

			object.setSelectedDate(date);
			await object.renderSchedule(object.selectedDate, object.selectedMonth, object.selectedYear);
		}
	}

	this.initEvent = async function() {
		object.calendar.dom.today.onclick = object.onToday;
		object.calendar.dom.next.onclick = object.onNext;
		object.calendar.dom.back.onclick = object.onBack;

		object.calendar.dom.calendarType.onchange = async function() {
			await object.changeCalendarTypeHandler(parseInt(this.value));
		}
	}

	this.getMonthlyText = function(month, year) {
		let current = new Date();
		current.setDate(1);
		current.setMonth(month);
		current.setFullYear(year);
		
		return object.monthlyLocale[LANGUAGE].format(current);
	}

	this.getAllWeekDay = function() {
		let weekdays = [];
		let sunday = (new Date()).getSunday();
		weekdays.push(object.weekdayLocale[LANGUAGE].format(sunday));
		for (let i in [...Array(6).keys()]) {
			sunday.setDate(sunday.getDate() + 1);
			weekdays.push(object.weekdayLocale[LANGUAGE].format(sunday));
		}
		return weekdays;
	}

	this.getMonthDetail = function(month, year) {
        let firstDay = new Date(year, month, 1);
        let lastDay = new Date(year, month + 1, 0);
        let dayNumber = lastDay.getDate();
        let weekNumber = firstDay.getDay() + dayNumber;
        let result = {
            firstDay: firstDay,
            lastDay: lastDay,
            weekNumber: Math.ceil(weekNumber/7)
        }
		let days = [];
		for (let i in [...Array(result.weekNumber).keys()]) {
			let week = [];
			for (let j in [...Array(7).keys()]) {
				week.push({isDisable: true, isToday: false, number: 0})
			}
			days.push(week);
		}
		let current = new Date();
		let hasToday = false;
		if (current.getMonth() == month && current.getFullYear() == year) hasToday = true;
		let firstIndex = parseInt(firstDay.getDay());
		for (let i in [...Array(parseInt(result.lastDay.getDate())).keys()]) {
			let j = parseInt(i) + firstIndex;
			let index = parseInt(j) % 7;
			let week = parseInt(Math.floor(j / 7));
			days[week][index].isDisable = false;
			days[week][index].number = parseInt(i) + 1;
		}
		if (hasToday) {
			let j = parseInt(current.getDate() - 1) + firstIndex;
			let index = parseInt(j) % 7;
			let week = parseInt(Math.floor(j / 7));
			days[week][index].isToday = true;
		}
		result.days = days;
        return result;
    }

	this.renderMonthly = async function(month, year) {
		let weekdays = object.getAllWeekDay();
		let detail = object.getMonthDetail(month, year)
		object.monthly = new DOMObject(object.template.monthly, {weekdays, days: detail.days, month: month, year: year});
		object.calendar.dom.current.html(object.getMonthlyText(month, year));

		object.calendar.dom.calendar.html(object.monthly);

		for(let i in object.event) {
			await object.appendMonthlyEvent(object.event[i]);
		}
		await object.initMonthlyEvent(month, year);
	}

	this.initMonthlyEvent = async function(month, year) {
		let tags = object.monthly.html.getElementsByClassName('monthlyCellDateText');
		for (let tag of tags) {
			tag.onclick = async function() {
				object.calendar.dom.calendarType.value = 1;
				object.calendarType = 1;
				let date = new Date();
				date.setFullYear(year);
				date.setMonth(month);
				date.setDate(parseInt(tag.innerHTML));

				object.setSelectedDate(date);
				await object.renderDaily(object.selectedDate, object.selectedMonth, object.selectedYear);
			}
		}
	}

	this.appendEvent = async function(event) {
		object.event.push(event);
		if (object.calendarType == 1) {
			await object.appendDailyEvent(event);
		} else if (object.calendarType == 2) {
			await object.appendWeeklyEvent(event);
		} else if (object.calendarType == 3) {
			await object.appendMonthlyEvent(event);
		}
	}

	this.clearEvent = async function() {
		if (object.monthly) {
			let tags = object.monthly.html.getElementsByClassName('eventCell');
			for (let item of tags) {
				let rel = item.getAttribute('rel');
				let tag = object.monthly.dom[rel];
				tag.event = [];
				tag.html('');
			}
		}
	}

	this.appendMonthlyEvent = async function(event) {
		let startTime = new Date(event.startTime * 1000);
		let date = startTime.getDate();
		let month = startTime.getMonth();
		let year = startTime.getFullYear();
		if (object.monthly.dom[`event_${year}_${month}_${date}`]) {
			event.time = object.timeLocale[LANGUAGE].format(startTime).toLowerCase()
			if (event.monthlyTag == undefined) {
				event.monthlyTag = new DOMObject(object.template.monthlyEvent, event);
				await object.initEventTag(event.monthlyTag.html, event);
			}
			let cell = object.monthly.dom[`event_${year}_${month}_${date}`];
			if (cell.event == undefined) cell.event = []
			cell.event.push(event)
			cell.event.sort((a,b) => a.startTime - b.startTime);
			cell.html('');
			for (let i in cell.event) {
				cell.append(cell.event[i].monthlyTag);
			}
		}
	}

	this.initEventTag = async function(tag, data) {
		tag.onclick = async function() {
			if (object.sources[data.sourceName] == undefined) return;
			let source = object.sources[data.sourceName];
			if (source.eventHanlderFuntion == undefined) return;
			await source.eventHanlderFuntion(data);
		}
	}

	this.getHourList = function() {
		let date = new Date();
		date.setHours(0);
		date.setMinutes(0);
		date.setSeconds(0);
		date.setMilliseconds(0);
		let result = [];
		for (let i in [...Array(24).keys()]) {
			date.setHours(parseInt(i) + 1);
			result.push(object.timeLocale[LANGUAGE].format(date));
		}
		return result;
	}

	this.renderWeekly = async function(week, month, year) {
		let weekdays = object.getAllWeekDay();
		let detail = object.getMonthDetail(month, year);
		let hour = object.getHourList();
		let hours = [];
		for (let i in hour) {
			hours.push({index: parseInt(i), hour: hour[i]});
		}
		let hasToday = false;
		for (let i in detail.days[week]) {
			if (detail.days[week][i].isToday) {
				hasToday = true;
				break;
			}
		}
		object.weekly = new DOMObject(object.template.weekly, {weekdays, days: detail.days[week], month: month, year: year, hour: hours});
		object.calendar.dom.current.html(object.getMonthlyText(month, year));

		object.calendar.dom.calendar.html('');
		object.calendar.dom.calendar.append(object.weekly);

		for(let i in object.event) {
			await object.appendWeeklyEvent(object.event[i]);
		}

		if (hasToday) {
			let current = new Date();
			let cell = object.weekly.dom[`event_${current.getFullYear()}_${current.getMonth()}_${current.getDate()}_${current.getHours()}`];
			if (cell) cell.scrollIntoView({behavior: 'smooth'});
		}

		await object.initWeeklyEvent(month, year);
	}

	this.initWeeklyEvent = async function(month, year) {
		let tags = object.weekly.html.getElementsByClassName('weeklyCellDateText');
		for (let tag of tags) {
			tag.onclick = async function() {
				object.calendar.dom.calendarType.value = 1;
				object.calendarType = 1;
				let date = new Date();
				date.setFullYear(year);
				date.setMonth(month);
				date.setDate(parseInt(tag.innerHTML));

				object.setSelectedDate(date);
				await object.renderDaily(object.selectedDate, object.selectedMonth, object.selectedYear);
			}
		}
	}

	this.appendWeeklyEvent = async function(event) {
		let startTime = new Date(event.startTime * 1000);
		let date = startTime.getDate();
		let month = startTime.getMonth();
		let year = startTime.getFullYear();
		let hour = startTime.getHours();
		if (object.weekly.dom[`event_${year}_${month}_${date}_${hour}`]) {
			if (event.endTime == null) event.endTime = event.startTime + (60.0 * 60.0);
			let endTime = new Date(event.endTime * 1000);
			let deltaHour = (event.endTime - event.startTime) / (60.0 * 60.0);
			let minute = startTime.getMinutes();
			let top = 48.0 * (parseInt(minute) / 60.0);
			event.time = object.timeLocale[LANGUAGE].formatRange(startTime, endTime).toLowerCase()
			if (event.weeklyTag == undefined) {
				event.weeklyTag = new DOMObject(object.template.weeklyEvent, event);
				await object.initEventTag(event.weeklyTag.html, event);
			}

			let cell = object.weekly.dom[`event_${year}_${month}_${date}_${hour}`];
			if (cell.event == undefined) cell.event = []
			cell.event.push(event)
			cell.event.sort((a,b) => a.startTime - b.startTime);
			cell.html('');
			event.weeklyTag.html.style.top = top + 'px';
			event.weeklyTag.html.style.height = (deltaHour * 48) + 'px';
			for (let i in cell.event) {
				cell.append(cell.event[i].weeklyTag);
			}
		}
	}

	this.getDailyText = function(date, month, year) {
		let current = new Date();
		current.setDate(date);
		current.setMonth(month);
		current.setFullYear(year);
		
		return object.dailyLocale[LANGUAGE].format(current);
	}

	this.renderDaily = async function(date, month, year) {
		let hour = object.getHourList();
		let hours = [];
		for (let i in hour) {
			hours.push({index: parseInt(i), hour: hour[i]});
		}
		let current = new Date();
		let selected = new Date();
		selected.setDate(date);
		selected.setMonth(month);
		selected.setFullYear(year);
		selected.setHours(0, 0, 0, 0);
		current.setHours(0, 0, 0, 0);
		let isToday = false;
		if (current.getTime() == selected.getTime()) isToday = true;
		let day = object.weekdayLocale[LANGUAGE].format(selected)
		object.daily = new DOMObject(object.template.daily, {day: day, date: date, month: month, year: year, hour: hours, isToday: isToday});
		object.calendar.dom.current.html(object.getDailyText(date, month, year));

		object.calendar.dom.calendar.html('');
		object.calendar.dom.calendar.append(object.daily);

		for(let i in object.event) {
			await object.appendDailyEvent(object.event[i]);
		}

		if (isToday) {
			let current = new Date();
			let cell = object.daily.dom[`event_${current.getFullYear()}_${current.getMonth()}_${current.getDate()}_${current.getHours()}`];
			if (cell) cell.scrollIntoView({behavior: 'smooth'});
		}
	}

	this.appendDailyEvent = async function(event) {
		let startTime = new Date(event.startTime * 1000);
		let date = startTime.getDate();
		let month = startTime.getMonth();
		let year = startTime.getFullYear();
		let hour = startTime.getHours();
		if (object.daily.dom[`event_${year}_${month}_${date}_${hour}`]) {
			if (event.endTime == null) event.endTime = event.startTime + (60.0 * 60.0);
			let endTime = new Date(event.endTime * 1000);
			let deltaHour = (event.endTime - event.startTime) / (60.0 * 60.0);
			let minute = startTime.getMinutes();
			let top = 48.0 * (parseInt(minute) / 60.0);
			event.time = object.timeLocale[LANGUAGE].formatRange(startTime, endTime).toLowerCase()
			if (event.weeklyTag == undefined) {
				event.weeklyTag = new DOMObject(object.template.weeklyEvent, event);
				await object.initEventTag(event.weeklyTag.html, event);
			}

			let cell = object.daily.dom[`event_${year}_${month}_${date}_${hour}`];
			if (cell.event == undefined) cell.event = []
			cell.event.push(event)
			cell.event.sort((a,b) => a.startTime - b.startTime);
			cell.html('');
			event.weeklyTag.html.style.top = top + 'px';
			event.weeklyTag.html.style.height = (deltaHour * 48) + 'px';
			for (let i in cell.event) {
				cell.append(cell.event[i].weeklyTag);
			}
		}
	}

	this.renderSchedule = async function(date, month, year) {
		object.schedule = new DOMObject(object.template.schedule);
		let selected = new Date();
		selected.setDate(date);
		selected.setMonth(month);
		selected.setFullYear(year);
		selected.resetTime();
		let selectedTime = parseInt(selected.getTime() / 1000.0);
		object.calendar.dom.current.html(object.getDailyText(date, month, year));

		object.calendar.dom.calendar.html('');
		object.calendar.dom.calendar.append(object.schedule);

		let event = {};
		let eventDateList = []

		for(let i in object.event) {
			let startTime = new Date(object.event[i].startTime * 1000);
			startTime.resetTime();
			let key = parseInt(startTime.getTime() / 1000.0);
			if (event[key] == undefined) {
				event[key] = [];
				eventDateList.push(key);
			}
			event[key].push(object.event[i]);
		}

		if (event[selectedTime] == undefined) {
			eventDateList.push(selectedTime);
		}

		eventDateList.sort((a,b) => a - b);

		for (let i in eventDateList) {
			let key = eventDateList[i];
			if (key < selectedTime) continue;
			if (event[key] == undefined) {
				let current = new Date(key * 1000.0);
				await object.appendScheduleDateRow(current.getDate(), current.getMonth(), current.getFullYear());
			}
			for (let j in event[key]) {
				await object.appendScheduleEvent(event[key][j]);
			}
		}
	}

	this.appendScheduleDateRow = async function(date, month, year) {
		let current = new Date();
		let selected = new Date();
		selected.setDate(date);
		selected.setMonth(month);
		selected.setFullYear(year);
		selected.resetTime();
		current.resetTime();
		let key = parseInt(selected.getTime() / 1000.0);
		let isToday = false;
		if (current.getTime() == selected.getTime()) isToday = true;
		let weekdayText = object.weekdayLocale[LANGUAGE].format(selected).toUpperCase()
		let monthText = object.monthLocale[LANGUAGE].format(selected).toUpperCase()
		let dateText = [monthText, weekdayText].join(', ');
		if (object.schedule.dateRow == undefined) object.schedule.dateRow = {};
		if (object.schedule.dateRow[key] == undefined) {
			let row = new DOMObject(object.template.scheduleRow, {dateText: dateText, date: date, month: month, year: year, isToday: isToday});
			object.schedule.dom.container.append(row);
			object.schedule.dateRow[key] = row;
			await object.initScheduleEventTag(row, date, month, year);

		}
		return object.schedule.dateRow[key];
	}

	this.initScheduleEventTag = async function(tag, date, month, year) {
		tag.dom.date.onclick = async function() {
			object.calendar.dom.calendarType.value = 1;
			object.calendarType = 1;
			let current = new Date();
			current.setFullYear(year);
			current.setMonth(month);
			current.setDate(date);

			object.setSelectedDate(current);
			await object.renderDaily(object.selectedDate, object.selectedMonth, object.selectedYear);
		}
	}

	this.appendScheduleEvent = async function(event) {
		let startTime = new Date(event.startTime * 1000.0);
		if (event.endTime == null) event.endTime = event.startTime + (60.0 * 60.0);
		let endTime = new Date(event.endTime * 1000.0);
		let row = await object.appendScheduleDateRow(startTime.getDate(), startTime.getMonth(), startTime.getFullYear());
		event.time = object.timeLocale[LANGUAGE].formatRange(startTime, endTime).toLowerCase()
		if (event.scheduleTag == undefined) {
			event.scheduleTag = new DOMObject(object.template.scheduleEvent, event);
			await object.initEventTag(event.scheduleTag.html, event);
		}
		let cell = row.dom.content;
		if (cell.event == undefined) cell.event = []
		cell.event.push(event)
		cell.event.sort((a,b) => a.startTime - b.startTime);
		cell.html('');
		for (let i in cell.event) {
			cell.append(cell.event[i].scheduleTag);
		}
	}
}