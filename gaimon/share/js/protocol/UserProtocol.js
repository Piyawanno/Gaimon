const UserProtocol = function(main) {

	this.getUserByID = async function(data){
		let response = await POST('user/get/by/id', data);
		if (response == undefined) return false;
		if (response.result != undefined) return response.result;
		return [];
	}

	this.getUserGlobalByID = async function(data){
		let response = await POST('user/global/get/by/id', data);
		if (response == undefined) return false;
		if (response.result != undefined) return response.result;
		return [];
	}

	this.getAllUser = async function(data, callback) {
		let results = []
		let response = await POST('user/get/all', data);
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

	this.dropUser = async function(id, callback) {
		let data = {id}
		let response = await POST('user/drop', data);
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

	this.getAllUserGroup = async function(data, callback) {
		let results = []
		let response = await POST('user/group/get/all', data);
		if (response == undefined) { 
			if (callback != undefined) callback(results);
			return results;
		}
		if (response.isSuccess) {
			if (callback != undefined) callback(response.results);
			return response.results;
		}
		return results;
	}

	this.addUserGroup = async function(data, callback) {
		let results = {}
		let response = await POST('user/group/add', data);
		if (response == undefined) { 
			if (callback != undefined) callback(results);
			return results;
		}
		if (response.isSuccess) {
			if (callback != undefined) callback(response);
			return response;
		}
		return results;
	}

	this.dropUserGroup = async function(id, callback) {
		let data = {id}
		let response = await POST('user/group/drop', data);
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

	this.getPermissionModule = async function(callback){
		let results = {}
		let response = await GET(`user/permission/module/get`);
		if (response == undefined) { 
			if (callback != undefined) callback(results);
			return results;
		}
		if (response.isSuccess) {
			if (callback != undefined) callback(response);
			return response;
		}
		return results;
	}

	this.updateAvatar = async function(data){		
		let result = [];
		let response = await POST(`user/avatar/update`, data);
		if (response == undefined) return result;
		if (response.isSuccess) return response.result;
		return result;
	}

	this.updatePassword = async function(data){
		let result = [];
		let response = await POST(`user/password/update`, data);
		if (response == undefined) return result;
		if (response.isSuccess) return response.result;
		return result;
	}

	this.insertUserGroup = async function(data){
		let result = [];
		let response = await POST(`user/group/insert`, data);
		if (response == undefined) return result;
		if (response.isSuccess) return response.result;
		return result;
	}

	this.updateUserGroup = async function(data){
		let result = [];
		let response = await POST(`user/group/update`, data);
		if (response == undefined) return result;
		if (response.isSuccess) return response.result;
		return result;
	}

	this.insert = async function(data){
		return await POST(`user/insert`, data);
	}

	this.update = async function(data){
		return await POST(`user/update`, data);
	}

	this.updateUserRole = async function(data){
		let result = [];
		let response = await POST(`user/role/update`, data);
		if (response == undefined) return result;
		if (response.isSuccess) return response.result;
		return result;
	}

	this.isEmailExist = async function(email){
		let result = [];
		let response = await POST(`user/email/isexist`, {email});
		if (response == undefined) return result;
		if (response.isSuccess) return response.result;
		return result;
	}

	this.getUserDisplayNameByIDList = async function(idList){
		let result = [];
		let response = await POST(`user/displayname/by/id/list/get`, {idList});
		if (response == undefined) return result;
		if (response.isSuccess) return response.result;
		return result;
	}
}