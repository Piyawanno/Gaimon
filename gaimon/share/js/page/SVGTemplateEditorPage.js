const SVGTemplateEditorPage = function(main, parent) {
	AbstractPage.call(this, main, parent);
	
	let object = this;
	this.title = 'Template Editor';
	this.model = '';
	this.pageNumber = 1;
	this.limit = 10;
	this.filter = {};
	
	this.permission = [PermissionType.WRITE];

	this.prepare = async function() {
		this.editor = new SVGTemplateEditor();
	}


	this.getMenu = async function(isSubMenu) {
		object.menu = await CREATE_MENU(object.pageID, 'Template Editor', 'User', isSubMenu, false, true);
		return object.menu;
	}

	this.render = async function(config) {
		object.home = await object.editor.render();
		object.main.home.dom.container.html('');
		object.main.home.dom.container.appendChild(object.home.html);
	}

	this.renderState = async function(state) {
	}

	
}