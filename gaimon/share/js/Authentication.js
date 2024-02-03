
const Authentication = function() {
	const object = this;

	const AUTHEN_N = 1000;
	const AUTHEN_L = 64;
	const AUTHEN_SALT_LENGTH = 64;

	object.isLoggedIn = false;
	object.renderFunction = undefined;
	object.role = null;

	this.checkLogin = async function(isMobileApp, title) {
		try {
			await IndexedDBConnector.prototype.start("gaimon");
		} catch {
		}
		let token = window.localStorage.getItem('token');
		if (token != undefined) {
			object.isLoggedIn = true;
			object.token = token;
		}
		const response = await POST('authentication/login/check', {}, undefined, 'json', true);
		if (response == undefined && isMobileApp) {
			return {isSuccess: false, message: ''};
		}
		if (!response.isSuccess) {
			window.localStorage.removeItem('token');
			window.localStorage.removeItem('user');
			if (object.renderFunction) {
				await object.render(title);
			} else if (isMobileApp) {
				await object.renderMobileLogin(title);
			} else {
				let url = `${window.location.pathname}${window.location.search}`;
				window.location.replace(`${rootURL}authentication/login?page=${url.encodeHex()}`);
			}
		} else if (response.token) {
			object.token = response.token;
			window.localStorage.setItem('token', response.token);
			if (GLOBAL.DB) {
				await GLOBAL.DB.clear("Token");
				await GLOBAL.DB.insert("Token", {token: response.token});
			}
		}
		return response;
	}

	this.check = async function() {
		try {
			await IndexedDBConnector.prototype.start("gaimon");
		} catch {
		}
		let token = window.localStorage.getItem('token');
		if (token != undefined) {
			object.isLoggedIn = true;
			object.token = token;
		}
		return await POST('authentication/login/check', {}, undefined, 'json', true);
	}

	this.render = async function(title) {
		TEMPLATE = await getMustacheTemplate('frontend');
		TEMPLATE.get = GET_TEMPLATE;
		LOCALE = await getLocale(LANGUAGE, LANGUAGE);
		let page = new LoginPage();
		page.setRenderFunction(object.renderFunction);
		page.init(title);
	}

	this.setRenderFunction = async function(renderFunction) {
		object.renderFunction = renderFunction;
	}

	this.renderMobileLogin = async function(title) {
		TEMPLATE = await getMustacheTemplate('frontend');
		LOCALE = await getLocale(LANGUAGE, LANGUAGE);
		let page = new LoginPage();
		page.init(title);
	}

	this.logout = async function(callback) {
		const response = await GET('authentication/logout/flush', undefined, 'json').catch(error => console.log(error));
		if (callback != undefined) callback(response);
		window.localStorage.removeItem('token');
		return response;
	}

	this.login = async function(username, password, callback) {
		const response = await object.getUserSalt(username);
		if (response.isSuccess) {
			if (response.salt == null || response.salt.length == 0) {
				let result = await POST('authentication/login/checkPermission', {'username': username, 'hashed': password}, undefined, 'json').catch(error => console.log(error));
				if (result.isSuccess && result.token) {
					object.isLoggedIn = true;
					object.token = result.token;
					window.localStorage.setItem('token', object.token);
				}
				if (callback != undefined) callback(result);
				return result;
			} else {
				const data = object.generateLoginData(username, password, response.salt);
				let result = await POST('authentication/login/checkPermission', data, undefined, 'json').catch(error => console.log(error));
				if (result.isSuccess) {
					object.isLoggedIn = true;
					object.token = result.token;
					window.localStorage.setItem('token', object.token);
				}
				if (callback != undefined) callback(result);
				return result;
			}
		} else {
			if (callback != undefined) callback(response);
			return response;
		}
	}

	this.renewPassword = async function(password, passwordConfirm, callback){
		let result = {};
		if(password != passwordConfirm){
			result.isSuccess = false;
			result.message = 'Password and Password Confirmation must be the same.';
			return result;
		}
		const response = await object.getUserSalt(user.username);
		if (response.isSuccess) {
			console.log(password, response.salt)
			const passwordHash = object.hashPassword(password, object.fromHex(response.salt));
			const data = {
				"passwordHash" : object.toHex(passwordHash),
				"code" : code,
			}
			let results = await POST('authentication/check/renewPassword', data, undefined, 'json').catch(error => console.log(error));
			if (results.isSuccess) {
				object.isLoggedIn = true;
				object.token = results.token;
				window.localStorage.setItem('token', object.token);
			}
			if (callback != undefined) callback(results);
			return results;
		}else{
			if (callback != undefined) callback(response);
			return response;
		}
	}

	this.generateLoginData = function(username, password, userSalt) {
		userSalt = object.fromHex(userSalt);
		const saltedPassword = object.hashPassword(password, userSalt);
		let salt = object.generateSalt();
		const array = new Float64Array(1);
		array[0] = Date.now()/1000.0;
		let encodedTime = new Uint8Array(array.buffer);
		const hashed = object.toHex(object.hashSaltedPassword(saltedPassword, salt, encodedTime));
		encodedTime = object.toHex(encodedTime);
		salt = object.toHex(salt);
		return {username, hashed, salt, encodedTime};
	}

	this.register = async function(data, callback) {
		let response = await POST('authentication/login/register', data, 'json').catch(error => console.log(error));
		if (callback != undefined) callback(response);
		return response;
	}

	this.validatePhoneNumber = function(phoneNumber) {
		return phoneNumber.length == 10;
	}

	this.validateEmail = function(email) {
		return email.match(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
	}

	this.validateCitizenID = function(citizenID) {
		if(citizenID.length != 13) return false; 
		for(i=0, sum=0; i < 12; i++) {
			sum += parseFloat(citizenID.charAt(i))*(13-i); 
		}
		if((11-sum%11)%10 != parseFloat(citizenID.charAt(12))) return false;
		return true;
	}

	this.validatePassword = function(password, confirmPassword) {
		let isValid = password.length >= 8 && confirmPassword.length >= 8;
		return isValid && (password == confirmPassword);
	}

	this.getUserSalt = async function(username, callback) {
		let response = await POST('authentication/login/getSalt', {username}, undefined, 'json').catch(error => console.log(error));
		if (callback != undefined) callback(response);
		return response;
	};

	this.generateSalt = function() {
		const saltArray = secureRandom(AUTHEN_SALT_LENGTH);
		const salt = new Uint8Array(AUTHEN_SALT_LENGTH);
		for(let i=0; i<AUTHEN_SALT_LENGTH; i++) {
			salt[i] = saltArray[i];
		}
		return salt;
	};

	this.fromHex = function(hex) {
		const bytes = new Uint8Array(hex.length/2);
		for(let c=0; c<hex.length; c+=2) {
			bytes[c/2] = parseInt(hex.substr(c, 2), 16);
		}
		return bytes;
	};

	this.toHex = function(data) {
		const hex = [];
		for(let i in data) {
			const byte = data[i];
			const v = (byte < 0) ? 256 + byte : byte;
			hex.push(("0" + v.toString(16)).slice(-2));
		}
		return hex.join("");
	};

	this.hashPassword = function(password, salt) {
		return Pbkdf2HmacSha512(string_to_bytes(password), salt, AUTHEN_N, AUTHEN_L);
	};

	this.hashSaltedPassword = function(saltedPassword, salt, encodedTime) {
		const concat = new Uint8Array(salt.length + encodedTime.length);
		for(let i=0; i<salt.length; i++) {
			concat[i] = salt[i];
		}
		for(let i=0; i<encodedTime.length; i++) {
			concat[salt.length+i] = encodedTime[i];
		}
		return Pbkdf2HmacSha512(saltedPassword, concat, AUTHEN_N, AUTHEN_L);
	};

	this.checkPermission = async function(role){
		if(object.role == null){
			object.role = await GET("authentication/get/role");
		}
		if(role == 'guest') return true;
		if(object.role.includes('root')) return true;
		if(object.role.includes(role)) return true;
	}
}