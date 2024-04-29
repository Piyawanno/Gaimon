class CurrencyColumn extends ColumnMetaData{

    toDisplay(data) {
        let value = Fraction(data.origin[0], data.origin[1]).toString();
        return new Intl.NumberFormat(LANGUAGE, { style: 'currency', currency: data.originCurrency}).format(value);
    }
}