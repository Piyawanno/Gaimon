const PasswordRenewPage = function() {
	const object = this;

	object.renderFunction = undefined;
	object.hasRenderFunction = false;

	this.init = async function(title) {
		await object.render(title);
	}
	
	this.render = async function(title) {
		if (title == undefined) title = `${FULL_TITLE} - Renew Password`;
		object.body = document.querySelector('body');
		object.body.innerHTML = '';
		object.home = new DOMObject(TEMPLATE.PasswordRenew, {
			'title': FULL_TITLE,
			'user' : user,
		});
		object.body.appendChild(object.home.html);
		object.initEvent();
	}

	this.initEvent = function() {
		object.home.dom.showPassword.onclick = function() {
			if (object.home.dom.password.type == 'password') {
				object.home.dom.password.type = 'text';
			} else {
				object.home.dom.password.type = 'password';
			}

			if (object.home.dom.passwordConfirm.type == 'password') {
				object.home.dom.passwordConfirm.type = 'text';
			} else {
				object.home.dom.passwordConfirm.type = 'password';
			}
		}
		
		object.home.dom.password.onkeyup = function(event) {
			if (event.keyCode == 13) {
				if (object.home.dom.password.value.length > 0) {
					object.home.dom.passwordConfirm.focus();
				}
			}
		}

		object.home.dom.passwordConfirm.onkeyup = function(event) {
			if (event.keyCode == 13) {
				if (object.home.dom.passwordConfirm.value.length > 0 && object.home.dom.password.value.length > 0) {
					object.home.dom.renew.click();
				}
			}
		}

		object.home.dom.renew.onclick = async function() {
			let result = await GLOBAL.AUTHEN.renewPassword(
				object.home.dom.password.value,
				object.home.dom.passwordConfirm.value
			);
			if (result.isSuccess) {
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
			} else {
				object.home.dom.message.html(result.message);
				object.home.dom.message.classList.remove('hidden');
			}
		}
	}
}