const StatusBar = function(main) {
	AbstractPage.call(this, main);

	const object = this;
	this.pageID = 'StatusBar';
	this.main = main;

	this.prepare = async function(){
	}

	this.renderStatusBar = async function(){
		object.domObject = new DOMObject(TEMPLATE.StatusBar);
		object.main.home.dom.statusBar.append(object.domObject);
		return;
		object.setStatus();
		setInterval(function(){
			object.setStatus();
		}, 1000);		
	}

	this.setStatus = async function(){
		object.domObject.dom.status.html(`This is a fake status for test @${new Date}.`);
	}
}