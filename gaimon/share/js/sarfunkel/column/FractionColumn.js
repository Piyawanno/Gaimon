class FractionColumn extends ColumnMetaData{
    toDisplay(data) {
        return Fraction(data.origin[0], data.origin[1]).toString();
    }
	
}