class Avatar{
	constructor(config){
		if(typeof config == 'object'){
			this.column = config.column;
			this.url = config.url;
			this.default = config.default;
		}else{
			this.url = config;
			this.default = config;
			this.column = null;
		}
	}

	render(record){
		let URL = this.column == null? this.url: this.getURL(record);
		
	}

	getURL(record){
		let attribute = record[this.column];
		if(attribute == undefined || typeof attribute != 'string' || attribute.length < 4){
			return this.default;
		}else{
			return this.url+attribute;
		}
	}
}