class BaseProtocol{
	constructor(baseRoute){
		this.baseRoute = baseRoute;
	}

	handleResult(result){
		if(result.isSuccess){
			return result.result;
		}else{
			console.error(result.message);
			return null;
		}
	}

	async callPost(route, request){
		let result = await POST(`${this.baseRoute}/${route}`, request);
		return this.handleResult(result);
	}

	async callGET(route, request){
		let result = await GET(`${this.baseRoute}/${route}`, request);
		return this.handleResult(result);
	}

	async insert(data){
		return await this.callPost('insert', data)
	}

	async update(data){
		return await this.callPost('update', data)
	}

	async getByID(ID){
		return await this.callGET(`get/by/id/${ID}`);
	}

	async getOption(){
		return await this.callGET('get/option');
	}

	async getAutocomplete(data) {
		return await this.callPost('autocomplete/get', data)
	}

	async getAutocompleteByReference(data) {
		return await this.callPost('autocomplete/get/by/reference', data)
	}

	async getAll(filter, limit, pageNumber, orderBy='id', isDecreasing=false){
		let parameter = {limit, pageNumber, orderBy, isDecreasing};
		parameter.data = filter;
		return await this.callPost('get/all', parameter);
	}

	async delete(id){
		return await this.callPost('drop', {id});
	}
}