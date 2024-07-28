class CurrencyData{
	constructor(origin, originCurrency="THB", exchanged=undefined, exchangedCurrency=undefined, rate="1.0", exchangeDate=undefined){
		origin = origin != '' ? origin : 0.0;
		let value = Fraction(origin);
		this.origin = [value.n, value.d];
		this.originString = `${this.origin[0]}/${this.origin[1]}`

		this.originCurrency = originCurrency;
		this.exchanged = exchanged;
		this.exchangedCurrency = exchangedCurrency;

		let rateValue = Fraction(rate);
		this.rate = [rateValue.n, rateValue.d];
		this.rateString = `${this.rate[0]}/${this.rate[1]}`

		this.exchangeDate = exchangeDate;
	}

	toJSON() {
		let data = {...this};
		data.originString = `${this.origin[0]}/${this.origin[1]}`;
		data.rateString = `${this.rate[0]}/${this.rate[1]}`;
		return data;
	}
}