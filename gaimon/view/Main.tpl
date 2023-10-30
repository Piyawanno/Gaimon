<!DOCTYPE html>
<html lang="th">
	<head>
		<meta charset="utf-8" />
		<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
		<meta name='viewport' content='width=device-width, initial-scale=1.0, shrink-to-fit=no, user-scalable=no' />
		{{#meta}}
		<meta {{{.}}} />
		{{/meta}}
		
		<title>{{title}}</title>
		<script>
			let start = Date.now();
		</script>

		<link rel="shortcut icon" href="{{rootURL}}{{favicon}}" type="image/png" />
		
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
		
		{{#internalJS}}
		<script type="text/javascript" src="{{rootURL}}{{.}}"></script>
		{{/internalJS}}
		
		{{#extensionJS}}
		<script type="text/javascript" src="{{rootURL}}share/{{name}}/js/{{source}}"></script>
		{{/extensionJS}}
		

		{{#absoluteCSS}}
		<link rel="stylesheet" type="text/css" href="{{.}}" />
		{{/absoluteCSS}}

		{{#internalCSS}}
		<link rel="stylesheet" type="text/css" href="{{rootURL}}{{.}}" />
		{{/internalCSS}}

		{{#extensionCSS}}
		<link rel="stylesheet" type="text/css" href="{{rootURL}}share/{{name}}/css/{{source}}" />
		{{/extensionCSS}}
		
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
