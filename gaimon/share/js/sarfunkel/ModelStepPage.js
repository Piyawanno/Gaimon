class ModelStepPage extends ModelPage{
	constructor(main, parent){
		super(main, parent);

		this.stepPageID = undefined;
		this.stepPage = undefined;
		this.defaultNavigationIndex = 3;
	}

	createNavigationViewItem() {
		let navigation = this.navigation;
		let createNavigation = (ID, label, pageID, mode) => {
			navigation.append(new NavigationViewItem(ID, label, pageID, mode));
		};
		createNavigation('extension', this.extension, this.pageID);
		createNavigation('parent', this.stepPage.title, this.stepPage.pageID);
		createNavigation('model', this.title, this.pageID);
		createNavigation('table', 'Table', this.pageID, ViewType.TABLE);
		createNavigation('insert', 'Insert', this.pageID, ViewType.INSERT);
		createNavigation('update', 'Update', this.pageID, ViewType.UPDATE);
		createNavigation('detail', 'Detail', this.pageID, ViewType.DETAIL);
	}

	async onCreate() {
		this.stepPage = this.main.pageIDDict[this.stepPageID];
		await super.onCreate();
		let object = this;
		for (let viewType in this.stepItemMap) {
			if (this.renderMap[viewType] == undefined) continue;
			let renderFunction = this.renderMap[viewType].bind(this);
			let item = this.stepItemMap[viewType];
			this.stepPage.appendStep(item);
			item.render = async function(stepView, data) {
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
				await object.stepPage.onPrepareState();
				object.stepPage.defaultRender(undefined);
			})
			
		}

		this.navigation.itemMap.model.callback = async function() {
			SHOW_LOADING_DIALOG(async function() {
				object.defaultRender(undefined, object.pageID);
			})
		}
	}

	pushState(step, viewType, parameter, pageID) {
		if (pageID == undefined) pageID = this.pageID;
		let url = this.getURL(this.pageID, viewType, parameter, pageID);
		PUSH_SARFUNKEL_STATE(url);
	}

	setToPage(rendered) {
		this.checkTemplate();
		this.page.dom.container.html('');
		this.page.dom.container.appendChild(rendered.html);
	}

	async renderStep(viewType, activeItem) {
		if (activeItem == '') activeItem = this.pageID;
		this.stepPage.renderStep(viewType, activeItem);
	}

	async resetNavigation() {
		this.navigation.set(this.navigation.itemMap.extension, 0);
		this.navigation.set(this.navigation.itemMap.parent, 1);
		this.navigation.set(this.navigation.itemMap.model, 2);
	}
}