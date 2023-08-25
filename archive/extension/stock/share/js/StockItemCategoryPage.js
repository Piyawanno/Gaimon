const StockItemCategoryPage = function(main, parent) {
    AbstractPage.call(this, main, parent);

    let object = this;

    this.prepare = async function() {
    }

    this.getMenu = async function(isSubMenu) {
        object.menu = await CREATE_MENU(object.pageID, 'หมวดสต๊อกสินค้า', 'Stock', isSubMenu);
        return object.menu;
    }

    this.render = async function() {
        AbstractPage.prototype.render.call(this);
        await object.getStockCategory();
    }

    this.renderState = async function(state) {
        if (state.state == 'search') await object.renderSearchForm('StockItemCategory', {isSetState: false});
        if (state.state == 'form') await object.renderForm('StockItemCategory', {isSetState: false, data: state.data});
    }

    this.getStockCategory = async function(){
        let response = await GET(`stock/item/category/all`, undefined, 'json');
        await object.renderTable('StockItemCategory', {'data': response.results});
    }

    this.submit = async function(form){
        let data = await AbstractPage.prototype.submit.call(this, form);
        if(data.isPass){
            POST(`stock/item/category/insert`, data, function(callback){
                history.back();
            },'json');
        }else{

        }
    }
}