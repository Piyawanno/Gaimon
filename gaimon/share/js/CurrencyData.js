const CurrencyDataInitializer = function() {
	let data = CURRENCY_DATA_ORIGINAL;
	Object.freeze(CURRENCY_DATA_ORIGINAL);
	
	for (let i in data){
		Object.freeze(data[i]);
	}
}

CurrencyDataInitializer();


const CurrencyData = function() {
	let object = this;
	let cloneCurrency = structuredClone(CURRENCY_DATA_ORIGINAL);
	for (let i in cloneCurrency){
		object[i] = cloneCurrency[i];
	}
}