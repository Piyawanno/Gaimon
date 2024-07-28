class TimeIntervalColumn extends ColumnMetaData{
    toInput(data) {
        let hour = parseInt(data / (60 * 60));
		let minute = parseInt(data / (60))
		let second = data % 60;
		return {hour, minute, second};
    }
}