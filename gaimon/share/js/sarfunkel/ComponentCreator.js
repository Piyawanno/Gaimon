/// ComponentCreator creates Views without having its own page.
/// This can be used to embed the created views inside TabView or StepView.
class ComponentCreator extends ViewLoader{
	constructor(ID, order){
		super();
		this.ID = ID;
		this.order = new VersionParser(order+"");
		this.isTableForm = true;
		this.isDetailTable = true;
		this.isForm = false;
		this.isDetail = false;

		this.renderMap = {};
		// this.renderMap[ViewType.MAIN] = this.renderMain;
		this.renderMap[ViewType.INSERT] = this.renderInsertContent;
		this.renderMap[ViewType.UPDATE] = this.renderUpdateContent;
		this.renderMap[ViewType.TABLE] = this.getTable;
		this.renderMap[ViewType.TABLE_FORM] = this.getTableForm;
		this.renderMap[ViewType.DETAIL] = this.renderDetailContent;
		// this.renderMap[ViewType.SUMMARY] = this.renderSummary;
		// this.renderMap[ViewType.MAIN_DIALOG] = this.renderMainDialog;
		this.renderMap[ViewType.INSERT_DIALOG] = this.renderInsertDialogContent;
		this.renderMap[ViewType.UPDATE_DIALOG] = this.renderUpdateDialogContent;
		// this.renderMap[ViewType.TABLE_DIALOG] = this.renderTableDialog;
		// this.renderMap[ViewType.DETAIL_DIALOG] = this.renderDetailDialog;
		// this.renderMap[ViewType.SUMMARY_DIALOG] = this.renderSummaryDialog;
	}

	async onCreate() {

	}
}