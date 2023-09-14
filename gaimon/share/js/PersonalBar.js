const PersonalBar = function(main) {
	AbstractPage.call(this, main);

	const object = this;
	this.pageID = 'PersonalBar';
	this.main = main;
	this.notification = new Notification(main);
	this.myAccount = new MyAccount(main);
	this.isRendered = false;

	this.prepare = async function(){
	}

	this.renderPersonalBar = async function(){
		object.notification.startLoop();
		object.home = new DOMObject(TEMPLATE.PersonalBar);		
		if(isMobile()) object.main.home.dom.topBarMenu.append(object.home);
		else object.main.home.dom.personalBar.append(object.home);
		await object.appendPersonalIcon(object.home);
		object.notification.initIconEvent(object.home.dom.personalIcon);
		object.myAccount.initIconEvent(object.home.dom.myAccount);
	}

	this.initEvent = async function(){
		let dom = object.home.dom;

		dom.notification.onclick = async function(){
			object.notification.showList();
		}

		dom.myAccount.onclick = async function(){
			object.myAccount.show();
			object.myAccount.myAccountDOM.renderLocalize();
		}
	}

	this.appendPersonalIcon = async function(personalBar){
		let dom = object.home.dom;
		let icons = [{
			ID: 'notification',
			icon: 'Notification',
			cssClass: 'notification',
		},{
			ID: 'myAccount',
			icon: 'Avatar',
		}];
		
		let locale = new DOMObject(TEMPLATE.Locale, {rootURL});
		object.localeButton = locale;
		object.initLocaleButton(locale);
		dom.personalIcon.append(locale);

		for(let i in icons){
			icons[i].svg = (await CREATE_SVG_ICON(icons[i].icon)).icon;
			let icon = new DOMObject(TEMPLATE.PersonalIcon, icons[i]);
			dom.personalIcon.append(icon);
			dom[`${icons[i].ID}`] = icon.html;
		}
		object.initEvent();
	}

	this.renderByLocale = async function(locale) {
		let isKeepOriginal = false;
		if (LANGUAGE == 'en') isKeepOriginal = true
		LOCALE = await getLocale(locale, LANGUAGE);
		LANGUAGE = locale;
		object.renderLocalize(main.home.dom.menuBar, isKeepOriginal);
		object.renderLocalize(object.home.html, isKeepOriginal)
		object.renderLocalize(main.home.dom.container, isKeepOriginal);
	}

	this.setLanguage = async function(locale) {
		await object.renderByLocale(locale);
		let tag = object.localeButton;
		if (LANGUAGE == 'th') tag.dom.localeFlag.src = `${rootURL}share/icon/Flag-Thailand.jpg`;
		else if (LANGUAGE == 'en') tag.dom.localeFlag.src = `${rootURL}share/icon/Flag-England.jpg`;
		else if (LANGUAGE == 'cn') tag.dom.localeFlag.src = `${rootURL}share/icon/Flag-China.jpg`;
	}

	this.renderLocalize = function(html, isKeepOriginal) {
		let elements = html.getElementsByTagName("*");
		for (let tag of elements) {
			if (tag.getAttribute('localize') == undefined) continue;
			if (tag.getAttribute('localize').length == 0 && isKeepOriginal) {
				tag.setAttribute('localize', object.home.getLocalizeByTag(tag));
			}
			object.home.setLocalizeByTag(tag);
		}
	}

	this.initLocaleButton = function(tag) {
		tag.dom.locale_th.onclick = async function(event) {
			tag.dom.floatLocale.hide();
			localStorage.setItem('LANGUAGE', 'th');
			location.reload();
		}
		tag.dom.locale_en.onclick = async function(event) {
			tag.dom.floatLocale.hide();
			localStorage.setItem('LANGUAGE', 'en');
			location.reload();
		}
		tag.dom.locale_cn.onclick = async function(event) {
			tag.dom.floatLocale.hide();
			localStorage.setItem('LANGUAGE', 'cn');
			location.reload();
		}
		tag.dom.locale.onmouseover = function(event) {
			let rect = this.getBoundingClientRect();
			tag.dom.floatLocale.style.top = `${rect.bottom}px`;
			tag.dom.floatLocale.style.left = `${rect.left-10}px`;
			tag.dom.floatLocale.show();
		}
		tag.dom.floatLocale.onmouseover = function(event) {
			tag.dom.floatLocale.show();
		}
		tag.dom.floatLocale.onmouseleave = function(event) {
			tag.dom.floatLocale.hide();
		}
		tag.dom.locale.onmouseleave = function(event) {
			tag.dom.floatLocale.hide();
		}

		if (LANGUAGE == 'th') tag.dom.localeFlag.src = `${rootURL}share/icon/Flag-Thailand.jpg`;
		else if (LANGUAGE == 'en') tag.dom.localeFlag.src = `${rootURL}share/icon/Flag-England.jpg`;
		else if (LANGUAGE == 'cn') tag.dom.localeFlag.src = `${rootURL}share/icon/Flag-China.jpg`;
	}
}