const UtilityProtocol = function(main) {

	this.getJSPageTabExtension = async function() {
		let result = []
		let response = await GET('tab/extension');
		if (response == undefined) return result;
		if (response.isSuccess) return response.result;
	}

	this.getAllCountry = async function(callback) {
		let results = []
		let response = await GET('country/get/all');
		if (response == undefined) { 
			if (callback != undefined) callback(results);
			return results;
		}
		if (response.isSuccess) {
			if (callback != undefined) callback(response.result);
			return response.result;
		}
		return results;
	}

	this.getModelInput = async function(modelName, callback) {
		let response = await GET(`input/${modelName}`);
		if (response == undefined) { 
			if (callback != undefined) callback(response);
			return response;
		}
		if (response.isSuccess) {
			if (callback != undefined) callback(response);
			return response;
		}
		return response;
	}

	this.setAddress = async function(data, callback) {
		let results = []
		let response = await POST('address/set', data);
		if (response == undefined) { 
			if (callback != undefined) callback(results);
			return results;
		}
		if (response.isSuccess) {
			if (callback != undefined) callback(response.result);
			return response.result;
		}
		return results;
	}
}