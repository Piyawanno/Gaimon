const Handbook = function(main, page){
	AbstractPage.call(this, main);

	const object = this;

	this.init = async function(path){
		page.home.dom.info.classList.remove('hidden');
		page.home.dom.info.onclick = async function(){
			await object.show(path);
		}
	}
	
	this.show = async function(path){
		let dialog = await object.renderBlankDialog();
		dialog.dom.title.remove();
		dialog.dom.form.classList.add('README');
		dialog.dom.dialog_container.style.maxWidth = '95vw';
		dialog.dom.form.innerHTML = await LOAD_FILE(`document/${LANGUAGE}/${path}`);
		dialog.dom.submit.remove();
		dialog.dom.cancel.remove();
		dialog.dom.operation.classList.add('hidden');
		let style = dialog.dom.form.getElementsByTagName('style');
		for(let i in style){
			if(typeof(style[i]) == 'object') style[i].remove();
		}
		await object.appendCloseButton(dialog);
	}

	this.appendCloseButton = async function(dialog){
		let icon = await CREATE_SVG_ICON('Close');
		let button = new DOMObject(`<div class="flex-column center" style="cursor:pointer;" rel="close">${icon.icon}</div>`);
		button.dom.close.onclick = async function(){
			dialog.dom.cancel.onclick();
		}
		dialog.dom.container.style.overflowY = 'auto';
		dialog.dom.container.style.maxHeight = 'calc(100vh - 10vh - 54px)';
		dialog.dom.container.style.padding = '20px';
		dialog.dom.container.style.paddingTop = '0';
		dialog.dom.dialog_container.style.overflowY = 'hidden';
		dialog.dom.dialog_container.style.padding = '0';
		dialog.dom.additionalTopBar.append(button);
		dialog.dom.additionalTopBar.classList.remove('hidden');
	}
}