class ModelMetaData{
	static columnMap = {
		IntegerColumn: IntegerColumn,
		StringColumn: StringColumn,
	}

	constructor(page, modelName, config){
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
	}

	extract(){
		this.extractGroup();
		this.extractInput();
		this.setGroupInput();
		this.sort();
	}

	setGroupInput(){
		for(let group of this.groupList){
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
			let ColumnClass = ModelMetaData.columnMap[raw.columnName];
			if(ColumnClass == undefined) ColumnClass = ColumnMetaData;
			let column = new ColumnClass(raw);
			this.columnMap[name] = column;
			this.columnList.push(column);
			if(column.input != null){
				this.inputMap[name] = column.input;
				this.inputList.push(column.input);
				let group = this.groupMap[column.input.group];
				if(group != undefined){
					column.input.isGrouped = true;
					group.inputList.push(column.input)
				}
			}
		}
	}
}