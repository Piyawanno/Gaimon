Date.prototype.weekDayLocale = {}
Date.prototype.weekDayLocale['narrow'] = {
	'th': new Intl.DateTimeFormat('th-TH', {weekday: 'narrow'}), 
	'en': new Intl.DateTimeFormat('en-US', {weekday: 'narrow'})
}
Date.prototype.weekDayLocale['short'] = {
	'th': new Intl.DateTimeFormat('th-TH', {weekday: 'short'}), 
	'en': new Intl.DateTimeFormat('en-US', {weekday: 'short'})
}
Date.prototype.weekDayLocale['long'] = {
	'th': new Intl.DateTimeFormat('th-TH', {weekday: 'long'}), 
	'en': new Intl.DateTimeFormat('en-US', {weekday: 'long'})
}

Date.prototype.getAllWeekDay = function(type) {
	if (type == undefined) type = 'short';
	let weekdays = [];
	let sunday = (new Date()).getSunday();
	weekdays.push(Date.prototype.weekDayLocale[type][LANGUAGE].format(sunday));
	for (let i in [...Array(6).keys()]) {
		sunday.setDate(sunday.getDate() + 1);
		weekdays.push(Date.prototype.weekDayLocale[type][LANGUAGE].format(sunday));
	}
	return weekdays;
}

Date.prototype.getSunday = function() {
	const first = this.getDate() - this.getDay() + 1;
	const last = first + 6;
	const sunday = new Date(this.setDate(last));
	return sunday;
}

Date.prototype.getWeekOfMonth = function() {
	let year = this.getFullYear();
	let month = this.getMonth();
	let firstDay = new Date(year, month, 1);
	let firstIndex = parseInt(firstDay.getDay());
	let j = parseInt(this.getDate() - 1) + firstIndex;
	let week = parseInt(Math.floor(j / 7));
	return week;
}

Date.prototype.resetTime = function() {
	this.setHours(0);
	this.setMinutes(0);
	this.setSeconds(0);
	this.setMilliseconds(0);
}

function dateToDateID(date) {
	let now = new Date();
	let DAY_SECONDS = 60 * 60 * 24 * 1000.0;
	let timezone = (now.getTimezoneOffset() * 60) * 1000.0;
	let datetime = new Date(date);
	return parseInt((datetime.getTime() - timezone) / DAY_SECONDS)
}

function dateIDToDate(dateID) {
	let now = new Date();
	let DAY_SECONDS = 60 * 60 * 24 * 1000.0;
	let timezone = (now.getTimezoneOffset() * 60) * 1000.0;
	let timestamp = (dateID * DAY_SECONDS) + timezone;
	let datetime = new Date(timestamp);
	return datetime;
}