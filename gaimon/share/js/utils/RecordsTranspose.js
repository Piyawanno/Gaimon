async function toListOfRecord(data) {
	let result = [];
	let length = 0;
	for(let key in data){
		length = data[key].length;
	}
	for(let i =0; i < length;i++){
		let model = {};
		for(let key in data){
			model[key] = data[key][i];
		}
		
		result.push(model)
	}
	return result;
}

async function fromListOfRecord(data) {
	let result = {};
	for(let key in data[0]){
		result[key] = [];
	}
	for(let i =0; i < data.length;i++){
		let model = data[i];
		for(let key in model){
			result[key].push(model[key]);
		}
	}
	return result;
}