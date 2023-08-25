const UnitProtocol = function(main) {
	this.getAllUnitCategory = async function(data, callback) {
		let result = []
		let response = await POST('utility/unit/category/get/all', data);
		if (response == undefined) { 
			if (callback != undefined) callback(result);
			return result;
		}
		if (response.isSuccess) {
			if (callback != undefined) callback(response.result);
			return response.result;
		}
		return result;
	}

	this.getUnitCategoryOption = async function(callback) {
		let result = []
		let response = await GET('utility/unit/category/option/get');
		if (response == undefined) { 
			if (callback != undefined) callback(result);
			return result;
		}
		if (response.isSuccess) {
			if (callback != undefined) callback(response.result);
			return response.result;
		}
		return result;
	}

	this.setUnitCategory = async function(data, callback) {
		let result = {}
		let response = await POST('utility/unit/category/set', data);
		if (response == undefined) { 
			if (callback != undefined) callback(result);
			return result;
		}
		if (response.isSuccess) {
			if (callback != undefined) callback(response.result);
			return response.result;
		}
		return result;
	}

	this.dropUnitCategory = async function(id, callback) {
		let data = {id}
		let response = await POST('utility/unit/category/drop', data);
		if (response == undefined) { 
			if (callback != undefined) callback();
			return;
		}
		if (response.isSuccess) {
			if (callback != undefined) callback();
			return;
		}
		return;
	}



	this.getAllUnit = async function(data, callback) {
		let result = []
		let response = await POST('utility/unit/get/all', data);
		if (response == undefined) { 
			if (callback != undefined) callback(result);
			return result;
		}
		if (response.isSuccess) {
			if (callback != undefined) callback(response.result);
			return response.result;
		}
		return result;
	}

	this.getUnitOption = async function(callback) {
		let result = []
		let response = await GET('utility/unit/option/get');
		if (response == undefined) { 
			if (callback != undefined) callback(result);
			return result;
		}
		if (response.isSuccess) {
			if (callback != undefined) callback(response.result);
			return response.result;
		}
		return result;
	}

	this.setUnit = async function(data, callback) {
		let result = {}
		let response = await POST('utility/unit/set', data);
		if (response == undefined) { 
			if (callback != undefined) callback(result);
			return result;
		}
		if (response.isSuccess) {
			if (callback != undefined) callback(response.result);
			return response.result;
		}
		return result;
	}

	this.dropUnit = async function(id, callback) {
		let data = {id}
		let response = await POST('utility/unit/drop', data);
		if (response == undefined) { 
			if (callback != undefined) callback();
			return;
		}
		if (response.isSuccess) {
			if (callback != undefined) callback();
			return;
		}
		return;
	}

	this.getUnitByCategoryID = async function(ID, callback) {
		let result = {}
		let response = await POST('utility/unit/get/by/category/id', {ID});
		if (response == undefined) { 
			if (callback != undefined) callback(result);
			return result;
		}
		if (response.isSuccess) {
			if (callback != undefined) callback(response.result);
			return response.result;
		}
		return result;
	}

	this.getUnitCategoryTable = async function(callback) {
		let result = {}
		let response = await GET('utility/unit/category/table');
		if (response == undefined) { 
			if (callback != undefined) callback(result);
			return result;
		}
		if (response.isSuccess) {
			if (callback != undefined) callback(response.result);
			return response.result;
		}
		return result;
	}

	this.getUnitOptionByCategory = async function(unitCategotyID){
		let result = []
		let response = await GET(`utility/unit/level/by/category/option/get/${unitCategotyID}`);
		if (response == undefined) return result;
		if (response.isSuccess) return response.result;
		return result;
	}
}