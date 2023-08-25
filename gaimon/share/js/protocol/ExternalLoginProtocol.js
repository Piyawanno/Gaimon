let ExternalLoginProtocol = function(){
	let object = this;
	
	this.initialize = function(){
		object.initializeGoogle();
	}

	this.initializeGoogle = function(){
		window.onload = function () {
			google.accounts.id.initialize({
				client_id: authentication.google.googleID,
				callback: object.loginGoogle
			});
			google.accounts.id.renderButton(
				document.getElementById("buttonDiv"),
				{
					theme: "outline",
					size: "large"
				}
			);
			google.accounts.id.prompt();
		  }
	}

	this.loginFacebook = async function(name, facebookID, accessToken, tokenExpireTime, callback) {
		let data = {
			name: name,
			facebookID: facebookID,
			accessToken: accessToken,
			tokenExpireTime: tokenExpireTime
		};
		await POST('login/facebook', data, function(response) {
			if (response.isSuccess) {
				if (callback != undefined) callback(response.result);
			}
		}, 'json');
	}   

	this.loginGoogle = async function(token, callback) {
		let data = {
			token: token
		}
		await POST('login/google', data, function(response) {
			if (response.isSuccess) {
				if (callback != undefined) callback(response.result);
			}
		}, 'json');
	}

	this.handleGoogleLogin = function(googleUser) {
		let profile = googleUser.getBasicProfile();
		console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
		console.log('Name: ' + profile.getName());
		console.log('Image URL: ' + profile.getImageUrl());
		console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.
		let tokenID = googleUser.getAuthResponse().id_token;
		console.log(tokenID)
		object.loginGoogle(tokenID, function(response) {
		});
	}
}