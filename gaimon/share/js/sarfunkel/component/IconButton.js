class IconButton extends Button {
	constructor(label, icon, order='1.0', callback=async (event)=>{}, classList=[], url=async (id)=>{}){
		super(label, order, callback, classList, url);
		this.icon = icon;
	}
}