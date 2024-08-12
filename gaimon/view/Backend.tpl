<script>
	let main;
	let LANGUAGE = 'en';
	async function startPage() {
		GLOBAL.AUTHEN = new Authentication();
		// GLOBAL.AUTHEN.checkLogin(IS_MOBILE_APP);
		TEMPLATE = await getMustacheTemplate('backend');
		TEMPLATE.get = GET_TEMPLATE;
		let language = localStorage.getItem('LANGUAGE');
		if (language == null) LANGUAGE = 'en';
		else LANGUAGE = language;
		LOCALE = await getLocale(LANGUAGE, LANGUAGE);
		main = new BackendMain();
		
		await main.init();
		let elapsed = Date.now() - start;
		console.log(`>>> Page initialize : loaded in ${elapsed}ms`);
	}
	START_PAGE_AFTER_LOAD(startPage);
</script>