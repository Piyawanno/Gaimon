const TemplateCreatorProtocol = function(main) {

	this.get = async function(data){
		let response = await POST('template/creator/get', data);
		if (response == undefined) return false;
		if (response.result != undefined) return response.result;
		return response.result;
	}

	this.getDefaultTemplate = async function(model){
		let response = await GET(`template/creator/get/default/${model}`);
		if (response == undefined) return false;
		if (response.result != undefined) return response.result;
		return response;
	}

	this.insert = async function(data){
		let response = await POST('template/creator/insert', data);
		if (response == undefined) return false;
		if (response.result != undefined) return response.result;
		return response.isSuccess;
	}

	this.setDefaultTemplate = async function(data){
		let response = await POST(`template/creator/set/default`, data);
		if (response == undefined) return false;
		if (response.result != undefined) return response.result;
		return response.isSuccess;
	}

	this.delete = async function(data){
		let response = await POST(`template/creator/delete`, data);
		if (response == undefined) return false;
		if (response.result != undefined) return response.result;
		return response.isSuccess;
	}

	this.update = async function(data){
		let response = await POST('template/creator/update', data);
		if (response == undefined) return false;
		if (response.result != undefined) return response.result;
		return response.isSuccess;
	}
}