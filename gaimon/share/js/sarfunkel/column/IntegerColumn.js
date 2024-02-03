class IntegerColumn extends ColumnMetaData{
	constructor(config){
		super(config);
		this.min = config.min;
		this.max = config.max;
	}
}