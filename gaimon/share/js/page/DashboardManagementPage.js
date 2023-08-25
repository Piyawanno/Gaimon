const DashboardManagementPage = function(main, parent){
	AbstractPage.call(this, main, parent);

	let object = this;
	this.title = 'Dashboard';
	this.model = 'Dashboard';
	this.pageNumber = 1;
	this.limit = 10;
	this.filter = {};
	this.config = {hasTableView: false, hasAdd: false, hasFilter: false, hasLimit: false};
	this.isTabVisible = false;

	object.role = ['Dashboard'];

	this.getMenu = async function(isSubMenu){
		object.menu = await CREATE_MENU(object.pageID, 'Dashboard', 'Dashboard', isSubMenu);
		return object.menu;
	}
}