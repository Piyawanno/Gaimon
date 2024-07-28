class InputConfigCreator{
	/**
	 * 
	 * @param {string} columnName 
	 * @param {string} columnType 
	 * @param {string} label 
	 * @param {string} order 
	 * @param {object} group 
	 * @param {boolean} isTable 
	 * @param {boolean} isMobile 
	 * @param {boolean} isSearch 
	 * @param {boolean} isRequired 
	 * @param {boolean} isEditable 
	 * @param {boolean} isForm 
	 * @param {boolean} isTableForm 
	 * @param {boolean} isSearchTable 
	 * @param {boolean} isAdvanceForm 
	 * @param {object} attachedGroup 
	 * @param {boolean} isLink 
	 * @param {string} linkColumn 
	 * @param {object} help 
	 * @param {string} documentPath 
	 * @param {object} config
	 * @param {Array} sideIcon 
	 * @param {boolean} isEnabled 
	 * @param {boolean} isSpreadSheet 
	 * @param {boolean} isCopyable 
	 * @param {number} inputPerLine 
	 * @param {string} typeName 
	 * @returns {object}
	 */
	static create(
		columnName,
		columnType,
		label,
		order=null,
		group=null,
		isTable=false,
		isMobile=false,
		isSearch=false,
		isRequired=false,
		isEditable=true,
		isForm=true,
		isTableForm=false,
		isSearchTable=false,
		isAdvanceForm=false,
		attachedGroup=null,
		isLink=false,
		linkColumn='',
		help=null,
		documentPath=null,
		config=null,
		sideIcon=[],
		isEnabled=true,
		isSpreadSheet=true,
		isCopyable=false,
		inputPerLine=null,
		typeName=null,
		foreignColumn=null,
		foreignModelName=null
	) {
		let data = {};
		data.label = label;
		data.order = order;
		data.group = group;
		data.isTable = isTable;
		data.isMobile = isMobile;
		data.isSearch = isSearch;
		data.isRequired = isRequired;
		data.isEditable = isEditable;
		data.isForm = isForm;
		data.isTableForm = isTableForm;
		data.isSearchTable = isSearchTable;
		data.isAdvanceForm = isAdvanceForm;
		data.attachedGroup = attachedGroup;
		data.isLink = isLink;
		data.linkColumn = linkColumn;
		data.help = help;
		data.documentPath = documentPath;
		data.config = config;
		data.columnType = columnType;
		data.columnName = columnName;
		data.sideIcon = sideIcon;
		data.isEnabled = isEnabled;
		data.isSpreadSheet = isSpreadSheet;
		data.isCopyable = isCopyable;
		data.inputPerLine = inputPerLine;
		data.typeName = typeName;
		data.foreignColumn = foreignColumn;
		data.foreignModelName = foreignModelName;
		return data;
	}

	/**
	 * @typedef {object} InputConfig
	 * @property {string} columnName 
	 * @property {string} columnType 
	 * @property {string} label 
	 * @property {string} order 
	 * @property {object} group
	 * @property {boolean} isTable 
	 * @property {boolean} isMobile 
	 * @property {boolean} isSearch 
	 * @property {boolean} isRequired 
	 * @property {boolean} isEditable 
	 * @property {boolean} isForm 
	 * @property {boolean} isTableForm 
	 * @property {boolean} isSearchTable 
	 * @property {boolean} isAdvanceForm 
	 * @property {object} attachedGroup 
	 * @property {boolean} isLink 
	 * @property {string} linkColumn 
	 * @property {object} help 
	 * @property {string} documentPath 
	 * @property {object} config
	 * @property {Array} sideIcon 
	 * @property {boolean} isEnabled 
	 * @property {boolean} isSpreadSheet 
	 * @property {boolean} isCopyable 
	 * @property {number} inputPerLine 
	 * @property {string} typeName 
	 */

	/**
	 * 
	 * @param {InputConfig} param0 
	 * @returns 
	 */
	static createByConfig({
		columnName,
		columnType,
		label,
		order=null,
		group=null,
		isTable=false,
		isMobile=false,
		isSearch=false,
		isRequired=false,
		isEditable=true,
		isForm=true,
		isTableForm=false,
		isSearchTable=false,
		isAdvanceForm=false,
		attachedGroup=null,
		isLink=false,
		linkColumn='',
		help=null,
		documentPath=null,
		config=null,
		sideIcon=[],
		isEnabled=true,
		isSpreadSheet=true,
		isCopyable=false,
		inputPerLine=null,
		typeName=null,
		foreignColumn=null,
		foreignModelName=null
	}) {
		let data = {};
		data.label = label;
		data.order = order;
		data.group = group;
		data.isTable = isTable;
		data.isMobile = isMobile;
		data.isSearch = isSearch;
		data.isRequired = isRequired;
		data.isEditable = isEditable;
		data.isForm = isForm;
		data.isTableForm = isTableForm;
		data.isSearchTable = isSearchTable;
		data.isAdvanceForm = isAdvanceForm;
		data.attachedGroup = attachedGroup;
		data.isLink = isLink;
		data.linkColumn = linkColumn;
		data.help = help;
		data.documentPath = documentPath;
		data.config = config;
		data.columnType = columnType;
		data.columnName = columnName;
		data.sideIcon = sideIcon;
		data.isEnabled = isEnabled;
		data.isSpreadSheet = isSpreadSheet;
		data.isCopyable = isCopyable;
		data.inputPerLine = inputPerLine;
		data.typeName = typeName;
		data.foreignColumn = foreignColumn;
		data.foreignModelName = foreignModelName;
		return data;
	}
}