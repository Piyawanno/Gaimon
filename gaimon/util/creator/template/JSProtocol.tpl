const {modelName}Protocol = function(main) {{
	this.get{modelName} = async function(data) {{
		let result = [];
		let response = await POST('{route}/get/all', data);
		if (response == undefined) return result;
		if (response.isSuccess) return response.result;
		return [];
	}}

	this.get{modelName}Option = async function(data) {{
		let result = [];
		let response = await POST('{route}/get/option', data);
		if (response == undefined) return result;
		if (response.isSuccess) return response.result;
		return [];
	}}

	this.insert{modelName} = async function(data) {{
		let response = await POST('{route}/insert', data);
		if (response == undefined) return False;
		return response.isSuccess;
	}}

	this.update{modelName} = async function(data) {{
		let response = await POST('{route}/update', data);
		if (response == undefined) return False;
		return response.isSuccess;
	}}

	this.drop{modelName} = async function(data) {{
		let response = await POST('{route}/drop', data);
		if (response == undefined) return False;
		return response.isSuccess;
	}}
}}