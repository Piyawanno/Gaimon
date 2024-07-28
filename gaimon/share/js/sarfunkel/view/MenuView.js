class MenuView{
	constructor(page, label, icon){
		this.page = page;
		this.name = label;
		this.label = label;
		this.icon = icon;
		this.pageID = page.pageID;
		this.isSVG = true;
		this.hasAdd = false;
		this.url = this.page.getPageStateURL();
		this.addCallBack = async (page) => {};
	}

	setAsImage(){
		this.isSVG = false;
		return this;
	}

	enableAdd(addCallBack){
		this.hasAdd = true;
		this.addCallBack = addCallBack;
		return this;
	}

	async render(){
		await this.getIcon();
		this.createDom();
		this.initEvent();
		return this.dom;
	}

	initEvent(){
		main.home.dom.container.onclick = function(){
			main.home.dom.subMenuContainer.hide();
		}
		this.dom.dom.link.onclick = async function(e) {
			e.preventDefault();
		}
		this.initMenuEvent();
	}

	initMenuEvent(){
		let object = this;
		this.dom.dom.menu.addEventListener('click', async function(e) {
			e.preventDefault();
			if (object.dom.hasChild) {
				await object.handleWithChild();
			} else {
				await object.handle();
			}
			await RENDER_NAVIGATOR();
		});
	}


	initAddEvent(){
		if(!CHECK_PERMISSION_USER(this.page.extension, this.page.role, ['WRITE'])){
			this.dom.dom.add.remove();
		}else{
			let object = this;
			let page = this.page;
			let dom = this.dom;
			this.dom.dom.add.addEventListener('click', async function(e) {
				if (isMobile()) main.home.dom.menuContainer.classList.add('hidden');
				await object.highlightMenu(false);
				main.selectedSubMenu.push(dom.dom.menu);
				SHOW_LOADING_DIALOG(async function(){
					await page.onPrepareState();
					if(object.addCallBack == undefined) await page.render(ViewType.INSERT);
					else await object.addCallBack(page);
				});
				main.home.dom.subMenuContainer.hide();
				await object.setMostUsed();
			});
		}
	}

	async handleWithChild(){
		this.highlight(true);
		main.selectedMenu.push(this.dom.dom.menu);
		main.home.dom.menuName.html(this.label);
		await APPEND_SUB_MENU(main.subMenu[pageID]);
		main.home.dom.subMenuContainer.show();
	}

	async handle(){
		this.highlight(false);
		main.selectedMenu.push(this.dom.dom.menu);
		if (isMobile()) main.home.dom.menuContainer.classList.add('hidden');
		if(this.page != null){
			await this.page.setPageState();
			SHOW_LOADING_DIALOG(async function(){
				await this.page.onPrepareState();
				await this.page.render();
			});
		}else{
			console.error("Page is not defined.");
		}
		main.home.dom.subMenuContainer.hide();
		await this.setMostUsed();
	}

	async setMostUsed(){
		if(self.page == null) return;
		let raw = localStorage.getItem('mostUsed');
		if(raw == undefined) raw = '{}';
		let mostUsed = JSON.parse(raw);
		let used = mostUsed[this.pageID];
		if(used == undefined){
			used = {};
			used.count = 0;
			used.pageID = this.pageID;
			mostUsed[this.pageID] = used;
		}
		used.title = this.page.title;
		used.extension = this.page.extension;
		used.count += 1;
		localStorage.setItem('mostUsed', JSON.stringify(mostUsed));
	}

	highlight(hasSubMenu){
		if (!hasSubMenu) {
			for (let i in main.selectedSubMenu) {
				main.selectedSubMenu[i].classList.remove('highlightMenu');
			}
			main.selectedSubMenu = [];
		}
		this.dom.dom.menu.classList.add('highlightMenu');
	}

	createDom(){
		this.dom = new DOMObject(TEMPLATE.MenuItem, this);
	}

	async getIcon(){
		if(this.isSVG){
			this.iconObject = new SVGIcon(this.icon);
			await this.iconObject.render();
		}else{
			this.iconObject = new ImageIcon(this.icon);
		}
		this.icon = this.iconObject.icon;
	}
}