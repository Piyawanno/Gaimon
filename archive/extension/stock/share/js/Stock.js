const Stock = function(main, parent) {
    AbstractPage.call(this, main, parent);

    let object = this;

    this.prepare = async function() {
    }

    this.getMenu = async function(isSubMenu) {
        object.menu = await CREATE_MENU(object.pageID, 'Stock', 'Stock', isSubMenu);
        return object.menu;
    }
}