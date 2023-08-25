<script>
	let main;
	let LANGUAGE = 'en';
	document.addEventListener("DOMContentLoaded", function(event) {{
		async function startPage() {{
			GLOBAL.AUTHEN = new Authentication();
			TEMPLATE = await getMustacheTemplate('backend');
			TEMPLATE.get = GET_TEMPLATE;
			main = new {modelName}Display();
			await main.init();
		}}
		startPage();
	}});
</script>