const StockMainItemPage = function(main, parent) {
    AbstractPage.call(this, main, parent);

    let object = this;

    this.prepare = async function() {
    }

    this.getMenu = async function(isSubMenu) {
        object.menu = await CREATE_MENU(object.pageID, 'รายการสินค้าหลัก', 'Stock', isSubMenu);
        return object.menu;
    }
}