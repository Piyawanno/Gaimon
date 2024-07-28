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

	parseParameter(parameter) {
		let params = [];
		for (let key in parameter) {
			params.push(`${key}=${parameter[key]}`);
		}
		if (params.length == 0) return "";
		return `?${params.join('&')}`;
	}

	async callPost(route, request){
		let result = await POST(`${this.baseRoute}/${route}`, request);
		return this.handleResult(result);
	}

	async callGET(route, parameter){
		let result = await GET(`${this.baseRoute}/${route}${this.parseParameter(parameter)}`);
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

	async getByReference(data) {
		return await this.callPost(`get/by/reference`, {data});
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

	async getAll(filter, limit=10, pageNumber=1, orderBy='id', isDecreasing=true){
		let parameter = {limit, pageNumber, orderBy, isDecreasing};
		parameter.data = filter;
		return await this.callPost('get/all', parameter);
	}

	async delete(id){
		return await this.callPost('drop', {id});
	}
}