<div class="login-page">
	<div class="login-card">
		<div class="login-topic flex-column gap-10px" style="padding:20px 0;">
			{{#icon}}
			<div class="flex center" rel="imageContainer" style="min-width:350px;min-height:200px;max-width:350px;max-height:290px;margin:auto;">
				<img rel="image" src="{{rootURL}}{{icon}}" style="max-width:290px;max-height:290px;">
			</div>
			{{/icon}}
			<!-- <div class="center" style="font-size:1.75rem;">{{title}}</div> -->
		</div>
		<div class="login-box">
			<div class="login-input-block">
				<div >Username</div>
				<div class="flex">
					<div class="icon">
						<svg style="width:24px;height:24px" viewBox="0 0 24 24">
							<path fill="currentColor" d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" />
						</svg>
					</div>
					<div style="width:calc(100% - 34px);display:flex;"><input class="login-input-text" type="text" placeholder="Username" rel="username" autocomplete="off" localize></div>
				</div>
			</div>
			<div class="login-input-block">
				<div >Password</div>
				<div class="flex">
					<div class="icon">
						<svg style="width:24px;height:24px" viewBox="0 0 24 24">
							<path fill="currentColor" d="M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z" />
						</svg>
					</div>
					<div style="width:calc(100% - 34px);display:flex;"><input class="login-input-text" type="password" placeholder="Password" rel="password" autocomplete="off" localize></div>
				</div>
				<div class="warning-label hidden" rel="message"></div>
			</div>
			<div class="login-input-block">
				<div class="flex gap-10px">
					<div><input type="checkbox" rel="showPassword"></div>
					<label rel="showPasswordLabel" localize>Show password</label>
				</div>
			</div>
			<div class="login-button" rel="login" localize>Log In</div>
			<!-- <div class="login-register" rel="register" localize>Sign Up</div> -->
			{{# authentication.isExternal }}
			<div class="login-divider">Or</div>
			<div class="login-social" rel="social">
				{{# authentication.google.enable }}
				<div id="g_id_onload"
					data-client_id="{{ authentication.google.googleID }}"
					data-login_uri="{{ rootURL }}"
					data-auto_prompt="false">
				</div>
				<div class="g_id_signin"
					data-type="standard"
					data-size="large"
					data-theme="outline"
					data-text="sign_in_with"
					data-shape="rectangular"
					data-logo_alignment="left">
				</div>
				{{/ authentication.google.enable }}

				{{# authentication.line.enable }}
				<div class="login-social-button" rel="line">
					<img src="/share/icon/line.png">
				</div>
				{{/ authentication.line.enable }}

				{{# authentication.facebook.enable }}
				<div class="login-social-button" rel="facebook">
					<img src="/share/icon/facebook.png">
				</div>
				{{/ authentication.facebook.enable }}
				
				{{# authentication.apple.enable }}
				<div class="login-social-button" rel="apple">
					<img src="/share/icon/apple.png">
				</div>
				{{/ authentication.apple.enable }}
			</div>
			{{/ authentication.isExternal }}
		</div>
	</div>
	<div rel="forgotPasswordDialog"></div>
	<div class="alertDialog" rel="alertDialog"></div>
</div>