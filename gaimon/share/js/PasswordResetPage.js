const ResetPasswordPage = function() {
	const object = this;

	this.init = async function(title) {
		await object.render(title);
	}
	
	this.render = async function(title) {
		if (title == undefined) title = `${FULL_TITLE} - Renew Password`;
		object.body = document.querySelector('body');
		object.body.innerHTML = '';
		object.home = new DOMObject(TEMPLATE.PasswordReset, {
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

			if (object.home.dom.confirm_password.type == 'password') {
				object.home.dom.confirm_password.type = 'text';
			} else {
				object.home.dom.confirm_password.type = 'password';
			}
		}
		
		object.home.dom.password.onkeyup = function(event) {
			if (event.keyCode == 13) {
				if (object.home.dom.password.value.length > 0) {
					object.home.dom.confirm_password.focus();
				}
			}
		}

		object.home.dom.confirm_password.onkeyup = function(event) {
			if (event.keyCode == 13) {
				if (object.home.dom.confirm_password.value.length > 0 && object.home.dom.password.value.length > 0) {
					object.home.dom.renew.click();
				}
			}
		}

		object.home.dom.renew.onclick = async function() {
			let result = object.home.getData();
			if(!result.isPass){
				SHOW_ALERT_DIALOG('กรุณากรอกข้อมูลให้ถูกต้อง');
				return;
			}
			let data = {
				password: object.home.dom.password.value,
				hashed: HASH_STRING
			}
			await POST('authentication/reset/password', data);
			SHOW_FINISHED_DIALOG('เปลี่ยนรหัสผ่านเสร็จสิ้น', function(){
				window.location.replace(`${window.origin}`);
			});			
		}
	}
}