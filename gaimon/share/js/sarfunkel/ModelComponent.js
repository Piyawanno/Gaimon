class ModelComponent {
	constructor(component, viewType){
		this.component = component;
		this.order = component.order;
		this.viewType = viewType;

		this.renderMap = this.component.renderMap;

		this.parent = null;
	}

	async render(data, tag, viewType) {
		this.component.parent = this.parent;
		let rendered;
		if (this.viewType == ViewType.TABLE) {
			let isView = viewType == ViewType.DETAIL
			rendered = await this.component.renderMap[this.viewType].bind(this.component)(data, isView);
		} else {
			rendered = await this.component.renderMap[this.viewType].bind(this.component)(data);
		}
		if (rendered == undefined || rendered == null) return;
		if (this.viewType == ViewType.TABLE || this.viewType == ViewType.TABLE_FORM) {
			tag.appendChild(rendered.dom.dataContainer);
		} else if (this.viewType == ViewType.INSERT || this.viewType == ViewType.UPDATE) {
			tag.appendChild(rendered.dom.form);
		} else {
			tag.appendChild(rendered.html)
		}
		return rendered;
	}

	getFormValue(form, data, file, message){
		let isPass = true;
		if (this.viewType == ViewType.TABLE) {
			isPass = this.component.table.getFormValue(this.component.form, data, file, message);
		} else if (this.viewType == ViewType.TABLE_FORM) {
			isPass = this.component.tableForm.getFormValue(this.component.form, data, file, message);
		} else if (this.viewType == ViewType.INSERT || this.viewType == ViewType.UPDATE) {
			isPass = this.component.form.getFormValue(this.component.form, data, file, message) && isPass;
		}
		return isPass;
	}
}