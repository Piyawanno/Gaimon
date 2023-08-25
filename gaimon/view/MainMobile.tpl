<html>
	<head>
		<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
		<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
		<meta name='viewport' content='width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0, shrink-to-fit=no' />
		{{#meta}}
			<meta {{.}} />
		{{/meta}}
		
		<title>{{title}}</title>

		<link rel="shortcut icon" href="{{rootURL}}share/icon/favicon.png" type="image/png" />
		<link rel="apple-touch-icon" sizes="128x128" href="{{rootURL}}share/icon/apple-touch-icon.png" type="image/png"/ >
		{{#css}}
			<link rel="stylesheet" type="text/css" href="{{rootURL}}share/css/{{.}}" />
		{{/css}}
		<script>
			{{#jsVar}}
				var {{key}} = {{value}};
			{{/jsVar}}
		</script>
		{{#js}}
			<script type="text/javascript" src="{{rootURL}}share/js/{{.}}"></script>
		{{/js}}
		<script>
			
		</script>
		{{#header}}
			{{.}}
		{{/header}}
	</head>
	
	<body>
		{{body}}
	</body>
</html>
