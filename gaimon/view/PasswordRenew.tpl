<script>
	let main;
	let AUTHEN;
	let TEMPLATE = {};
	let LOCALE = {};
	let LANGUAGE = '{{language}}';
	const rootURI = "{{rootURI}}";
	const TITLE = "{{title}}";
	const LOGO = "{{{icon}}}";
	const FULL_TITLE = "{{{fullTitle}}}";
	document.addEventListener("DOMContentLoaded", function(event) {
		GLOBAL.AUTHEN = new Authentication();
		getMustacheTemplate('frontend', function(template) {
			TEMPLATE = template;
			getLocale(LANGUAGE, LANGUAGE, function(locale) {
				LOCALE = locale;
				main = new PasswordRenewPage();
				if(FULL_TITLE == '') FULL_TITLE = TITLE;
				main.init(FULL_TITLE);
			});
		});
	});
</script>