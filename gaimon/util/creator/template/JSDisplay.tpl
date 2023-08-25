let {modelName}Display = function(){{
	let object = this;

	this.page = {{}};

	this.init = async function(){{
		await this.initEvent();
		if (isMobile()) await object.initMobile();
		else await object.initDesktop();
		await this.render();
		console.log("{modelName}Display is ready.");
	}}

	this.initDesktop = async function(){{
	}}

	this.initMobile = async function(){{
	}}

	this.initEvent = async function(){{
	}}

	this.render = async function(){{
		await this.setTitle();
	}}

	this.setTitle = async function(title){{
		document.title = "{label}";
	}}
}}