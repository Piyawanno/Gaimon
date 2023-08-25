const AbstractDialog = function(page) {
	let object = this;

	object.page = page;

	this.hide = async function() {
		object.page.main.home.dom.dialog.html('');
	}

	this.renderDialogTabMenu = async function(dialog, menuList, tabMenu) {
		dialog.dom.dialogMenu.html('');
		if(tabMenu == undefined) tabMenu = await object.getDialogTabMenu(menuList);
		for(let i in tabMenu) {
			dialog.dom.dialogMenu.append(tabMenu[i]);
			dialog.dom.dialogMenu[i] = tabMenu[i].dom[i];
		}
		dialog.dom.dialogMenu.classList.remove('hidden');
		return dialog.dom.dialogMenu;
	};

	this.getDialogTabMenu = async function(menuList) {
		const menuDict = {};
		for(const menuItem of menuList){
			const menu = new DOMObject(TEMPLATE.TabMenu, menuItem);
			menuDict[menuItem.value] = menu;
		}
		return menuDict;
	};

	this.appendDialogContent = async function(dialog, tabValue, inputList, data) {
		const dialogContent = new DOMObject(`<div class="abstract_form_input hidden" rel="${tabValue}Content"></div>`);
		const domDict = {};
		const relationDict = {};
		for(const input of inputList) {
			if(input.isReferenceSelect) {
				const response = await GET(input.url, undefined, 'json', true);
				if(response != undefined && response.isSuccess) input.option = response.results;
			} else if(input.isPrerequisiteReferenceSelect) {
				const pre = input.prerequisite.split('.')[1];
				if(relationDict[pre] == undefined) relationDict[pre] = []
				relationDict[pre].push(input.columnName);
			}
			const inputDom = renderInput(input);
			domDict[input.columnName] = inputDom;
			dialogContent.dom[`${tabValue}Content`].append(inputDom);
		}
		for(let i in relationDict) {
			const pre = domDict[i];
			pre.fetched = {};
			pre.html.onchange = async function(event) {
				const tag = event.target;
				if(tag.value == undefined || tag.value == '') return;
				for(let _ in relationDict[i]) {
					for(const postIndex of relationDict[i]) {
						const post = domDict[postIndex];
						if(pre.fetched[postIndex] == undefined) {
							pre.fetched[postIndex] = {};
							const response = await GET(post.data.url + tag.value, undefined, 'json', true);
							if(response != undefined || response.isSuccess) {
								pre.fetched[postIndex][tag.value] = response.results;
							}
						}
						const postSelect = post.dom[postIndex];
						postSelect.innerHTML = '';
						const option = document.createElement('option');
						option.value = -1;
						option.textContent = 'None';
						postSelect.appendChild(option);
						if(parseInt(tag.value) != -1) {
							for(let i in pre.fetched[postIndex][tag.value]) {
								const opt = pre.fetched[postIndex][tag.value][i];
								const option = document.createElement('option');
								option.value = opt.value;
								option.textContent = opt.label;
								postSelect.appendChild(option);
							}
						}
					}
				}
			}
		}
		// for(let i in relationDict) {
		// 	const preIndex = relationDict[i];
		// 	const pre = domDict[preIndex];
		// 	const post = domDict[i];
		// 	pre.onchange = function() {
		// 		if(this.value == undefined) return;
				
		// 	}
		// 	const response = await GET(`input/${input.url}`, undefined, 'json', true);
		// 	if(response != undefined && response.isSuccess) input.option = response.results;
		// }
		dialogContent.setData(data);
		dialog.dom.dialog.append(dialogContent);
		return dialogContent;
	};

	this.appendDialogTable = async function(dialog, tabValue, table) {
		const dialogContent = new DOMObject(`<div class="abstract_form_input hidden" rel="${tabValue}Content"></div>`);
		dialog.dom.dialog.append(dialogContent);
		dialog.dom.dialog[`${tabValue}Content`].append(table);
	};

	this.setActiveDialogTab = async function(dialog, tag) {
		const parent = tag.parentElement;
		for(const tab of parent.children) {
			tab.classList.remove('highlightTab');
			const id = tab.getAttribute('rel');
			dialog.dom.dialog[`${id}Content`].classList.add('hidden');
		}
		tag.classList.add('highlightTab');
		const id = tag.getAttribute('rel');
		dialog.dom.dialog[`${id}Content`].classList.remove('hidden');
	};
}