<div class="login-page">
	<div class="login-card">
		<div class="login-topic flex-column gap-10px" style="padding:10px 0;">
			{{#icon}}
			<div class="center"><img src="{{rootURL}}{{icon}}" style="width:70px;"></div>
			{{/icon}}
			<div class="center" style="font-size:1.75rem;">{{title}} - <span localize>Renew Password</span></div>
		</div>
		<div class="login-box">
			<div style="text-align: center;">
				<div localize>Renew password for</div>
				<span class="user-login-name">{{user.username}}
			</div>
			<div class="login-input-block">
				<div localize>รหัสผ่าน</div>
				<div class="flex">
					<div class="icon">
						<svg style="width:24px;height:24px" viewBox="0 0 24 24">
							<path fill="currentColor" d="M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z" />
						</svg>
					</div>
					<div style="width:calc(100% - 34px);display:flex;"><input class="login-input-text" type="password" placeholder="รหัสผ่าน" rel="password" autocomplete="off" localize></div>
				</div>
			</div>
			<div class="login-input-block">
				<div localize>ยืนยันรหัสผ่าน</div>
				<div class="flex">
					<div class="icon">
						<svg style="width:24px;height:24px" viewBox="0 0 48 48">
							<path fill="currentColor" d="M21.05 33.1 35.2 18.95l-2.3-2.25-11.85 11.85-6-6-2.25 2.25ZM24 44q-4.1 0-7.75-1.575-3.65-1.575-6.375-4.3-2.725-2.725-4.3-6.375Q4 28.1 4 24q0-4.15 1.575-7.8 1.575-3.65 4.3-6.35 2.725-2.7 6.375-4.275Q19.9 4 24 4q4.15 0 7.8 1.575 3.65 1.575 6.35 4.275 2.7 2.7 4.275 6.35Q44 19.85 44 24q0 4.1-1.575 7.75-1.575 3.65-4.275 6.375t-6.35 4.3Q28.15 44 24 44Zm0-3q7.1 0 12.05-4.975Q41 31.05 41 24q0-7.1-4.95-12.05Q31.1 7 24 7q-7.05 0-12.025 4.95Q7 16.9 7 24q0 7.05 4.975 12.025Q16.95 41 24 41Zm0-17Z"/>
						</svg>
					</div>
					<div style="width:calc(100% - 34px);display:flex;"><input class="login-input-text" type="password" placeholder="ยืนยันรหัสผ่าน" rel="passwordConfirm" autocomplete="off" localize></div>
				</div>
				<div class="warning-label hidden" rel="message"></div>
				<div class="login-input-flex">
					<div class="login-checkbox-block">
						<input type="checkbox" rel="showPassword"><label localize rel="showPasswordLabel">แสดงรหัสผ่าน</label>
					</div>
				</div>
			</div>
			<div class="login-button" rel="renew" localize>เปลี่ยนรหัสผ่าน</div>
		</div>
	</div>
</div>