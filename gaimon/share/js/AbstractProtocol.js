const AbstractProtocol = function(main, restURL){
    let object = this;
    object.main = main;
    object.restURL = restURL;

    this.getAll = async function(data) {
        if (object.restURL == undefined) throw console.error("restURL is not exists.");
		let result = []
		let response = await POST(`${object.restURL}/get/all`, data);
		if (response == undefined) return result;
		if (response.isSuccess) return response.result;
		return result;
	}

	this.getByID = async function(ID) {
        if (object.restURL == undefined) throw console.error("restURL is not exists.");
		let result = []
		let response = await GET(`${object.restURL}/get/by/id/${ID}`);
		if (response == undefined) return result;
		if (response.isSuccess) return response.result;
		return result;
	}

	this.getByReference = async function(data) {
		let result = []
		let response = await POST(`${object.restURL}/get/by/reference`, {data});
		if (response == undefined) return result;
		if (response.isSuccess) return response.result;
		return result;
	}

	this.getOption = async function(data) {
        if (object.restURL == undefined) throw console.error("restURL is not exists.");
		let result = []
		let response = await GET(`${object.restURL}/get/option`, data);
		if (response == undefined) return result;
		if (response.isSuccess) return response.result;
		return result;
	}

	this.insert = async function(data) {
        if (object.restURL == undefined) throw console.error("restURL is not exists.");
		let result;
		let response = await POST(`${object.restURL}/insert`, data);
		if (response == undefined) return result;
		if (response.isSuccess) return response.result;
		return result;
	}

	this.update = async function(data) {
        if (object.restURL == undefined) throw console.error("restURL is not exists.");
		let result;
		let response = await POST(`${object.restURL}/update`, data);
		if (response == undefined) return result;
		if (response.isSuccess) return response.result;
		return result;
	}

	this.drop = async function(id) {
        if (object.restURL == undefined) throw console.error("restURL is not exists.");
		let result;
		let response = await POST(`${object.restURL}/drop`, {id});
		if (response == undefined) return result;
		if (response.isSuccess) return response.result;
		return result;
	}
}