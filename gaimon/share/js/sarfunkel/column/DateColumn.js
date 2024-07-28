class DateColumn extends ColumnMetaData{

    constructor(config){
        super(config);
        this.formatter = new Intl.DateTimeFormat(LANGUAGE, {day: '2-digit', month: '2-digit', year:"numeric"});
    }


    toDisplay(data) {
        let date = new Date(data);
        return this.formatter.format(date);
    }
}