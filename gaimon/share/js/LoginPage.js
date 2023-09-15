
const LoginPage = function() {
	const object = this;

	object.renderFunction = undefined;
	object.hasRenderFunction = false;

	this.init = async function(title) {
		await object.render(title);
	}

	this.render = async function(title) {
		if (title == undefined) title = TITLE;
		object.body = document.querySelector('body');
		object.body.innerHTML = '';
		object.home = new DOMObject(TEMPLATE.Login, {
			'title': TITLE,
			'authentication': authentication
		});
		if(authentication.isExternal){
			object.external = new ExternalLoginProtocol();
			object.external.initialize();
		}
		object.home = new DOMObject(TEMPLATE.Login, {'title': title});
		if (object.hasRenderFunction) {
			object.home = await object.renderFunction(title);
		} else {
			object.home = new DOMObject(TEMPLATE.Login, {'title': title, 'icon': LOGO, 'rootURL': rootURL});
		}
		object.body.appendChild(object.home.html);
		// await object.resizeIcon();
		object.initEvent();
	}

	this.renderFunction = async function(title) {

	}
	
	this.resizeIcon = async function(){
		if(object.home.dom.imageContainer == null) return;
		let rect = object.home.dom.imageContainer.getBoundingClientRect();
		let imgRect = object.getImageSize(object.home.dom.image);
		object.resizeToFit(object.home.dom.image, imgRect, rect);
	}

	this.resizeToFit = function(tag, imgRect, rect) {
		if (imgRect.width > imgRect.height) {
			let height = ((rect.width / imgRect.width) * imgRect.height);
			let width = rect.width;
			if (height > rect.height) {
				tag.style.width = ((rect.height / imgRect.height) * imgRect.width) + 'px';
				tag.style.height = rect.height + 'px';
			} else {
				tag.style.height = height + 'px';
				tag.style.width = width + 'px';
			}
		} else {
			let width = ((rect.height / imgRect.height) * imgRect.width);
			let height = rect.height;
			if (width > rect.width) {
				tag.style.height = ((rect.width / imgRect.width) * imgRect.height) + 'px';
				tag.style.width = rect.width + 'px';
			} else {
				tag.style.height = height + 'px';
				tag.style.width = width + 'px';
			}
		}
	}

	this.getImageSize = function(tag) {
		let imgRect = {}
		imgRect.width = tag.naturalWidth;
		imgRect.height = tag.naturalHeight;
		return imgRect
	}

	this.setRenderFunction = function(renderFunction) {
		if (renderFunction == undefined) return;
		object.hasRenderFunction = true
		object.renderFunction = renderFunction;
	}

	this.defaultLogin = async function(username, password) {
		let result = await GLOBAL.AUTHEN.login(username, password);
		if (result.isSuccess) {
			object.startApp();
		} else {
			object.home.dom.message.html(result.message);
			object.home.dom.message.classList.remove('hidden');
		}
	}

	this.startApp = async function() {
		if (window.IS_MOBILE_APP) {
			START_APP();
		} else {
			let query = new URLSearchParams(window.location.search);
			let url = query.get('page');
			if (url == null) {
				window.location.reload();
			} else {
				window.location.replace(`${window.origin}${url.decodeHex()}`);
			}
		}
	}

	this.initEvent = function() {
		if(object.home.dom.showPassword){
			object.home.dom.showPassword.onclick = function() {
				if (object.home.dom.password.type == 'password') {
					object.home.dom.password.type = 'text';
				} else {
					object.home.dom.password.type = 'password';
				}
			}
		}

		object.home.dom.username.onkeyup = function(event) {
			if (event.keyCode == 13) {
				if (object.home.dom.username.value.length > 0) {
					object.home.dom.password.focus();
				}
			}
		}

		object.home.dom.password.onkeyup = function(event) {
			if (event.keyCode == 13) {
				if (object.home.dom.password.value.length > 0 && object.home.dom.username.value.length > 0) {
					object.home.dom.login.click();
				}
			}
		}
		object.home.dom.login.defaultFunction = object.defaultLogin;
		object.home.dom.login.defaultFunction.success = object.startApp;
		if (object.home.dom.login.onclick == undefined) {
			object.home.dom.login.onclick = async function() {
				object.defaultLogin(object.home.dom.username.value, object.home.dom.password.value);
			}
		}

		if (object.home.dom.register) {
			if (!object.hasRenderFunction) {
				object.home.dom.register.onclick = function() {
					if (object.showRegisterDialog != undefined) object.showRegisterDialog();
				}
			}
		}

		if (object.home.dom.forgotPassword) {
			object.home.dom.forgotPassword.onclick = async function(){
				object.showForgotPasswordDialog();
			}
		}
		
		if (object.home.dom.google) {
			object.home.dom.google.onclick = async function() {
				console.log('google');
			}
		}
		
		if (object.home.dom.line) {
			object.home.dom.line.onclick = async function() {
				console.log('line');
			}
		}
		
		if (object.home.dom.facebook) {
			object.home.dom.facebook.onclick = async function() {
				console.log('facebook');
			}
		}

		if (object.home.dom.apple) {
			object.home.dom.apple.onclick = async function() {
				console.log('apple');
			}
		}
	}

	this.showForgotPasswordDialog = async function(){
		let form = new DOMObject(TEMPLATE.ForgotPassword);
		object.home.dom.forgotPasswordDialog.html(form);
		form.dom.email.onkeyup = async function(e){
			if(e.keyCode == 13) form.dom.submit.onclick();
		}
		form.dom.submit.onclick = async function(){
			await object.submitForgotPassword(form);
			
		}
		form.dom.cancel.onclick = async function(){
			object.home.dom.forgotPasswordDialog.html('');
		}
	}

	this.submitForgotPassword = async function(form){
		let result = form.getData();
		if(!result.isPass){
			SHOW_ALERT_DIALOG('กรุณากรอกข้อมูลให้ถูกต้อง');
			return;
		}
		await POST("authentication/forgot/password", {email: result.data.email});
		await SHOW_FINISHED_DIALOG('กรุณาตรวจสอบ e-mail เพื่อเปลี่ยนรหัสผ่าน', function(){
			object.home.dom.forgotPasswordDialog.html('');
		});		
	}
}