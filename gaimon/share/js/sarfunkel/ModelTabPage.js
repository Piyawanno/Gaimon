class ModelTabPage extends ModelPage{
	constructor(main, parent){
		super(main, parent);

		this.tabPageID = undefined;
		this.tabPage = undefined;
		this.defaultNavigationIndex = 3;
	}

	createNavigationViewItem() {
		let navigation = this.navigation;
		let createNavigation = (ID, label, pageID, mode) => {
			navigation.append(new NavigationViewItem(ID, label, pageID, mode));
		};
		createNavigation('extension', this.extension, this.pageID);
		createNavigation('parent', this.tabPage.title, this.tabPage.pageID);
		createNavigation('model', this.title, this.pageID);
		createNavigation('table', 'Table', this.pageID, ViewType.TABLE);
		createNavigation('insert', 'Insert', this.pageID, ViewType.INSERT);
		createNavigation('update', 'Update', this.pageID, ViewType.UPDATE);
		createNavigation('detail', 'Detail', this.pageID, ViewType.DETAIL);
	}

	async onCreate() {
		this.tabPage = this.main.pageIDDict[this.tabPageID];
		await super.onCreate();
		let object = this;
		for (let viewType in this.tabItemMap) {
			if (this.renderMap[viewType] == undefined) continue;
			let renderFunction = this.renderMap[viewType].bind(this);
			let item = this.tabItemMap[viewType];
			this.tabPage.appendTab(item);
			item.renderFunction = async function(tabView, data) {
				SHOW_LOADING_DIALOG(async function() {
					await object.onPrepareState();
					await renderFunction(data, item.ID);
				});
			}
		}
	}

	async onPrepareState(){
		await super.onPrepareState();
		let object = this;
		this.navigation.itemMap.parent.callback = async function() {
			SHOW_LOADING_DIALOG(async function() {
				await object.tabPage.onPrepareState();
				object.tabPage.defaultRender(undefined);
			})
			
		}

		this.navigation.itemMap.model.callback = async function() {
			SHOW_LOADING_DIALOG(async function() {
				object.defaultRender(undefined, object.pageID);
			})
		}
	}

	pushState(tab, viewType, parameter, pageID) {
		if (pageID == undefined) pageID = this.pageID;
		let url = this.getURL(this.pageID, viewType, parameter, pageID);
		PUSH_SARFUNKEL_STATE(url);
	}

	setToPage(rendered) {
		this.checkTemplate();
		this.page.dom.container.html('');
		this.page.dom.container.appendChild(rendered.html);
	}

	async renderTab(viewType, activeItem) {
		if (activeItem == '') activeItem = this.pageID;
		this.tabPage.renderTab(viewType, activeItem);
	}

	async resetNavigation() {
		this.navigation.set(this.navigation.itemMap.extension, 0);
		this.navigation.set(this.navigation.itemMap.parent, 1);
		this.navigation.set(this.navigation.itemMap.model, 2);
	}
}