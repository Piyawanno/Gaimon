<script>
	let main;
	let LANGUAGE = 'en';
	async function startPage() {
		GLOBAL.AUTHEN = new Authentication();
		GLOBAL.AUTHEN.checkLogin();
		TEMPLATE = await getMustacheTemplate('backend');
		TEMPLATE.get = GET_TEMPLATE;
		LOCALE = await getLocale(LANGUAGE, LANGUAGE);
		main = new BackendMain();
		await main.init();
		let elapsed = Date.now() - start;
		console.log(`>>> Page initialize : loaded in ${elapsed}ms`);
	}
	START_PAGE_AFTER_LOAD(startPage);
</script>