<html>
	<head>
		<title>Notification Test</title>
		<script src="{{rootURL}}share/js/utils/GaimonSocket.js"></script>
		<script>
			let websocketURL = "{{websocketURL}}";
			document.addEventListener("DOMContentLoaded", function(event) {
				let object = {};
				object.socket = new GaimonSocket('notification/push', function(event){
					console.log(`Message : ${event.data}`);
				});
				object.socket.connect();
			});
		</script>
	</head>
	<body>
	</body>
</html>