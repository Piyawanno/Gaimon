class AddSideIcon extends SideIcon{
    /**
     * 
     * @param {string} name 
     * @param {string} icon 
     * @param {string} order 
     * @param {InputMetaData} input 
     * @param {DOMObject} dom
     * @param {(id:number) => {}} handlerInsert 
     */
    constructor(name, icon, order, input, dom, handlerInsert){
        super(name, icon, order, input, dom, undefined);
        this.handlerInsert = handlerInsert;
	}

	setEvent(record) {
        let object = this;
        if (this.handlerInsert == undefined) {
            this.handlerInsert = async function(id) {
                await object.input.fetch(object.dom, id);
            }
        }
        let callback = async function(event) {
            let modelName = object.input.column.foreignModelName;
            if (modelName == undefined) return;
            let page = main.pageModelDict[modelName];
            if (page == undefined) return;
            if (page.renderInsertDialog) {
                await page.onPrepareState();
                await page.renderInsertDialog.bind(page)(undefined, object.handlerInsert);
            } else if (page.renderDialog) {
                await page.prepare();
                await page.renderDialog(modelName, {});
            }
        }
		this.svg.DOM.dom.icon.onclick = callback;
	}
}