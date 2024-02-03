class VersionParser{
	constructor(version){
		let splitted = version.split(".");
		this.version = [];
		for(let i of splitted){
			this.version.push(parseInt(i));
		}
	}

	static compare(a, b){
		let n = a.version.length <= b.version.length? a.version.length: b.version.length;
		for(let i=0;i<n;i++){
			if(a.version[i] > b.version[i]) return 1;
			else if(a.version[i] > b.version[i]) return -1;
		}
		return 0;
	}
}