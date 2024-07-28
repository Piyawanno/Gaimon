class FractionColumn extends ColumnMetaData{
    toDisplay(data) {
        return Fraction(data).toString();
    }

	inputToJSON(data){
		if (data == undefined) return "0/1";
		if (data.length == 0) return "0/1";
		let fraction = new Fraction(data);			
		fraction = `${fraction.n}/${fraction.d}`;
		return fraction;
	}

	toInput(data){
		if (data == undefined) return "0";
		if (data.length == 0) return "0";
		let fraction = new Fraction(data);
		return fraction.toString();
	}
}