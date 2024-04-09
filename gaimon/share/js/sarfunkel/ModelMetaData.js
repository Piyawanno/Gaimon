class ModelMetaData{
	constructor(page, modelName, config={input:[], inputGroup:[]}){
		this.page = page;
		this.modelName = modelName;
		this.config = config;
		this.avatar = new Avatar(config.avatar);
		this.groupList = [];
		this.groupMap = {};
		this.columnList = [];
		this.columnMap = {};
		this.inputList = [];
		this.inputMap = {};
		this.prerequisite = {};
		this.filterInputList = [];
	}

	extract(){
		this.excludeInputViewMap = this.page.excludeInputViewMap;
		this.extractGroup();
		this.extractInput();
		this.setGroupInput();
		this.sort();
		
	}

	setGroupInput(){
		for(let group of this.groupList){
			group.meta = this;
			group.setInput();
		}
	}

	sort(){
		this.groupList.sort((a, b) => {VersionParser.compare(a.order, b.order)});
		this.inputList.sort((a, b) => {VersionParser.compare(a.order, b.order)});
		for(let group of this.groupList){
			group.sort();
		}
	}

	appendInput(input) {
		this.config.input.push(input);
	}

	extractGroup(){
		for(let config of this.config.inputGroup){
			let group = new FormGroupView(config);
			this.groupList.push(group);
			this.groupMap[group.id] = group;
		}
	}

	extractInput(){
		for(let raw of this.config.input){
			let name = raw.columnName;
			let column = null;
			try{
				column = eval(`new ${raw.columnType}(raw)`);
			}catch(error){
				console.error(error);
				column = new ColumnMetaData(raw);
			}
			this.columnMap[name] = column;
			this.columnList.push(column);
			if(column.input != null){
				column.input.meta = this;
				this.inputMap[name] = column.input;
				this.inputList.push(column.input);
				if (raw.isSearch) this.filterInputList.push(column.input);
				let group = this.groupMap[column.input.group];
				if(group != undefined){
					column.input.isGrouped = true;
					group.inputList.push(column.input);
				}
			}
		}
		for (let input of this.inputList) {
			let prerequisite = input.config.prerequisite;
			if (prerequisite == null) continue;
			let splitted = prerequisite.split('.');
			if (splitted[0] != this.modelName) continue;
			input.config.prerequisiteColumn = splitted[1];
		}
	}
}