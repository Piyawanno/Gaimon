const AUTHEN_N = 1000;
const AUTHEN_L = 64;
const AUTHEN_VALID_TIME = 1800000; // [ms]
const AUTHEN_SALT_LENGTH = 32;

let Authentication = function(authen){
	var object = this;
	this.authen = authen;
	this.lastGenerate = 0;
	this.generated = null;
	this.char = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

	this.generate = function(){
		const now = new Date().getTime();
		if(object.generated == null || (now - object.lastGenerate > AUTHEN_VALID_TIME)){
			var generated = {};
			const l = object.char.length;
			generated.salt = secureRandom(AUTHEN_SALT_LENGTH).map((i) => {return object.char[i%l]}).join("");
			generated.time = now;
			generated.token = object.authen.token;
			const salt = `${generated.salt}--${(now.toString())}`
			generated.hashed = object.hash(object.hashed, salt);
			object.generated = generated;
			object.lastGenerate = now;
		}
		return object.generated;
	}

	this.toHex = function(data){
		var hex = [];
		for(var i in data){
			let byte = data[i];
			let v = (byte < 0) ? 256 + byte : byte;
			hex.push(("0" + v.toString(16)).slice(-2));
		}
		return hex.join("");
	}

	this.hash = function(password, salt){
		return object.toHex(Pbkdf2HmacSha512(
			string_to_bytes(password),
			string_to_bytes(salt),
			AUTHEN_N,
			AUTHEN_L,
		));
	}

	this.hashed = this.hash(authen.password, authen.salt);
}