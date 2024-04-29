class SubMenuView extends MenuView{
	initMenuEvent(){
		let object = this;
		let page = this.page;
		this.dom.dom.menuButton.addEventListener('click', async function(event) {
			event.preventDefault();
			if (isMobile()) main.home.dom.menuContainer.classList.add('hidden');
			await object.highlight(false);
			main.selectedSubMenu.push(object.dom.dom.menu);
			if(page != null){
				await page.setPageState();
				SHOW_LOADING_DIALOG(async function(){
					await page.onPrepareState();
					await page.render();
				});
			}else{
				console.error("Page is not defined.");
			}
			main.home.dom.subMenuContainer.hide();
			/// TODO : Revise
			await RENDER_NAVIGATOR();
			await object.setMostUsed();
		});
		if(this.hasAdd) this.initAddEvent();
	}

	createDom(){
		this.dom = new DOMObject(TEMPLATE.SubMenuItem, this);
	}
}