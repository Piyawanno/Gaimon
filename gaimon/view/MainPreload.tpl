<!DOCTYPE html>
<html lang="th">
	<head>
		<meta charset="utf-8" />
		<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
		<meta name='viewport' content='width=device-width, initial-scale=1.0, shrink-to-fit=no' />
		<meta property="og:title" content="{{metaTitle}}" />
		<meta property="og:description" content="{{metaDescription}}" />
		<meta property="og:type" content="article" />
		<meta property="og:url" content="{{metaURL}}" />
		<meta property="og:image" content="{{metaImage}}"/>
		{{#meta}}
		<meta {{.}} />
		{{/meta}}
		
		<title>{{title}}</title>
		<script>
			let start = Date.now();
		</script>

		<link rel="icon" href="{{rootURL}}{{favicon}}" type="image/png"/>
		
		{{#hasAppIcon}}
		<link rel="apple-touch-icon" sizes="{{appIcon.size}}" href="{{rootURL}}{{appIcon.path}}" type="{{appIcon.mime}}" />
		{{/hasAppIcon}}
		{{^hasAppIcon}}
		<link rel="apple-touch-icon" sizes="128x128" href="{{rootURL}}share/icon/apple-touch-icon.png" type="image/png" />
		{{/hasAppIcon}}
		
		{{#hasManifest}}
		<link rel="manifest" href="{{manifest}}">
		{{/hasManifest}}
		
		<script>
			window.GLOBAL = {};
			window.TEMPLATE = {};
			window.ICON = {};
			window.LOCALE = {};
			{{#jsVar}}
			let {{key}} = {{{value}}};
			{{/jsVar}}
		</script>

		{{#gTagID}}
		<script async src="https://www.googletagmanager.com/gtag/js?id={{gTagID}}"></script>
		<script>
			window.dataLayer = window.dataLayer || [];
			function gtag(){dataLayer.push(arguments);}
			gtag('js', new Date());
			gtag('config', '{{gTagID}}');
		</script>
		{{/gTagID}}
		
		{{#absoluteJS}}
		<script type="text/javascript" src="{{.}}"></script>
		{{/absoluteJS}}

		{{#absoluteCSS}}
		<link rel="stylesheet" type="text/css" href="{{.}}" />
		{{/absoluteCSS}}

		<script type="text/javascript">
			{{{preload}}}
			let preloadJS = [
				{{#internalJS}}
				'{{.}}',
				{{/internalJS}}
				{{#extensionJS}}
				'share/{{name}}/js/{{source}}',
				{{/extensionJS}}
			];
			let preloadCSS = [
				{{#internalCSS}}
				'{{.}}',
				{{/internalCSS}}
				{{#extensionCSS}}
				'share/{{name}}/css/{{source}}',
				{{/extensionCSS}}
			];
		</script>
		{{#header}}
		{{.}}
		{{/header}}
		<script id="preloadJS"></script>
		<style id="preloadCSS"></style>
	</head>
	
	<body>
		{{{body}}}
	</body>
</html>
