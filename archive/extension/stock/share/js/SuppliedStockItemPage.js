const SuppliedStockItemPage = function(main, parent) {
    AbstractPage.call(this, main, parent);

    let object = this;

    this.prepare = async function() {
    }

    this.getMenu = async function(isSubMenu) {
        object.menu = await CREATE_MENU(object.pageID, 'สต๊อกของขาย', 'Stock', isSubMenu);
        return object.menu;
    }

    this.render = async function() {
        AbstractPage.prototype.render.call(this);
        await object.getStockCategory();
    }

    this.renderState = async function(state) {
        if (state.state == 'search') await object.renderSearchForm('SuppliedStockItem', {isSetState: false});
        if (state.state == 'form') await object.renderForm('SuppliedStockItem', {isSetState: false, data: state.data});
    }

    this.getStockCategory = async function(){
        let response = await GET(`supplied/stock/item/all`, undefined, 'json');
        await object.renderTable('SuppliedStockItem', {'data': response.results});
    }

    this.submit = async function(){
        // let object = this;
        // let data = object.form.getData();
        // if(data.isPass){
        //     POST(`stock/item/category/insert`, data, function(callback){
        //         history.back();
        //     },'json');
        // }else{

        // }
    }
}