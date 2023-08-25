const MyAccount = function(main){
	AbstractPage.call(this, main);

	const object = this;
	this.main = main;

	this.initIconEvent = function(){
		object.renderAccount();
	}

	this.renderAccount = function(){
		object.myAccountDOM = new DOMObject(TEMPLATE.MyAccount, GLOBAL.USER);
		object.main.home.dom.myAccount.append(object.myAccountDOM);
		object.initEvent();
	}

	this.initEvent = async function(){
		object.myAccountDOM.dom.user.onclick = async function(){
			let user = JSON.parse(JSON.stringify(GLOBAL.USER));
			await main.page.user.renderForm('User', {data: user, isSetState: true});
			// await RENDER_NAVIGATOR();
			object.myAccountDOM.dom.myAccount.hide();
		}
		object.myAccountDOM.dom.signOut.onclick = async function(){
			GLOBAL.AUTHEN.logout()
			location.reload();
		}
	}

	this.show = function(){
		object.myAccountDOM.dom.myAccount.toggle();
	}
}