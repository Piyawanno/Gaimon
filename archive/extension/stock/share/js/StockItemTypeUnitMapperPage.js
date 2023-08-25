const StockItemTypeUnitMapperPage = function(main, parent) {
    AbstractPage.call(this, main, parent);

    let object = this;

    this.prepare = async function() {
    }

    this.initJS = async function() {
        await LOAD_JS_EXTENSION('stock', 'protocol/StockProtocol.js');
        object.protocol = new StockProtocol(object.main);
    }

    this.getMenu = async function(isSubMenu) {
        object.menu = await CREATE_MENU(object.pageID, 'Unit Mapper', 'Unit', isSubMenu);
        return object.menu;
    }

    this.render = async function() {
        AbstractPage.prototype.render.call(this);
		await object.getAllUnitMapper();
    }

    this.renderState = async function(state) {
        if (state.state == 'search') await object.renderSearchForm('StockItemTypeUnitMapper', {isSetState: false});
		if (state.state == 'form') await object.renderForm('StockItemTypeUnitMapper', {isSetState: false, data: state.data});
    }

    this.submit = async function(form) {
        let result = await AbstractPage.prototype.submit.call(this, form);
        if (!result.isPass) return;
        await object.main.protocol.unit.setUnit(result.data);
        await object.render();
    }

	this.getAllUnitMapper = async function(){
		let response = await object.protocol.getAllUnitMapper();
		await object.renderTable('StockItemTypeUnitMapper', {'data': response.results});
	}
}