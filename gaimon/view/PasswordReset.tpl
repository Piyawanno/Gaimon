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
	const HASH_STRING = "{{{HASH_STRING}}}";
	document.addEventListener("DOMContentLoaded", function(event) {
		async function startPage() {
			TEMPLATE = await getMustacheTemplate('frontend');
			TEMPLATE.get = GET_TEMPLATE;
			LOCALE = await getLocale(LANGUAGE, LANGUAGE);
			main = new ResetPasswordPage();
			await main.init();
		}
		startPage();
	});
</script>