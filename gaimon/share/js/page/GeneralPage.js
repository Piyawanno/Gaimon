const GeneralPage = function(main, parent) {
	AbstractPage.call(this, main, parent);
	
	let object = this;
	this.title = 'General';
	this.config = {
		hasFilter: false
	};
	this.pageNumber = 1;
	this.limit = 10;
	this.tab = 'general';

	this.getMenu = async function(isSubMenu) {
		object.menu = await CREATE_MENU(object.pageID, 'General', 'More', isSubMenu);
		return object.menu;
	}
}