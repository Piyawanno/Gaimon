 async function getColumnValue(object, column, data) {
	let type = column.typeName;
	if (data == undefined) return value;
	if (type == "EnumSelect") return getSelectColumnValue(column, data);
	else if(type == "Select") return getSelectColumnValue(column, data);
	else if (type == "EnumCheckBox") return getSelectColumnValue(column, data);
	else if (type == "Enable") return getEnableColumnValue(column, data);
	else if (type == "ReferenceSelect")  return getReferenceSelectColumnValue(column, data);
	else if (type == "PrerequisiteReferenceSelect") return await getPrerequisiteColumnValue(object, column, data);
	else if (type == "AutoComplete") return await getAutoCompleteColumnValue(column, data);
	else if(type == "Fraction")  return getFractionColumnValue(column, data);
	else if (type == "Currency")  return getCurrencyColumnValue(column, data);
	else if (type == "Number") return new Intl.NumberFormat('th-TH', {}).format(data[column.columnName]);
	else if (type == "FileMatrix")  return JSON.parse(data[column.columnName]);
	else if (type == "Color") return `<input style="width:100%;" type="color" disabled value="${data[column.columnName]}"/>`
	else if (type == "Status") return getStatusColumnValue(column, data);
	else if (type == "Image") return await getImageColumnValue(column, data);
	else if (type == "Date") return getDateColumnValue(column, data);
	else if (type == "DateTime") return getDateTimeColumnValue(column, data);
	else if (column.optionMap != undefined) return data[column.columnName];
	else return data[column.columnName];
}

function getSelectColumnValue(column, data){
	let value = data[column.columnName];
	for (let j in column.option) {
		if (column.option[j].value == value) return column.option[j].label;
	}
	return value
}

function getEnableColumnValue(column, data){
	let value = data[column.columnName];
	if (value) value = 'Enable';
	else value = 'Disable';
	return value;
}

function getReferenceSelectColumnValue(column, data){
	if (column.option != undefined) {
		column.optionMap = {}
		for (let option of column.option) {
			column.optionMap[option.value] = option.label;
		}
	}
	if (column.optionMap == undefined) return "-";
	if (column.optionMap[data[column.columnName]] == undefined) return "-";
	if (column.optionMap[data[column.columnName]] != undefined){
		return column.optionMap[data[column.columnName]];
	}
	return "";
}

async function getPrerequisiteColumnValue(object, column, data){
	if (column.tableURL) return '-';
	let value = data[column.columnName];
	let prerequisite = column.prerequisite.split('.');
	prerequisite = data[prerequisite[prerequisite.length-1]];
	if (prerequisite != undefined && prerequisite != -1) {
		let results;
		if (object.prerequisiteCache[column.url+prerequisite] == undefined) {
			let response = await GET(column.url+prerequisite, undefined, 'json', true);
			if (!response.isSuccess) return "-";
			results = response.results;
			if (response.result != undefined) results = response.result;
			object.prerequisiteCache[column.url+prerequisite] = {time: Date.now(), results: results};
		} else if (object.prerequisiteCache[column.url+prerequisite].time - Date.now() > 5000){
			let response = await GET(column.url+prerequisite, undefined, 'json', true);
			if (!response.isSuccess) return "-";
			results = response.results;
			if (response.result != undefined) results = response.result;
			object.prerequisiteCache[column.url+prerequisite] = {time: Date.now(), results: results};
		} else {
			results = object.prerequisiteCache[column.url+prerequisite].results;
		}
		let valueMap = {};
		try {
			valueMap = results.reduce((a, v) => ({ ...a, [v.value]: v.label}), {});
		} catch (error) {
			// console.error(error);
		}
		if (valueMap[value] == undefined){
			return "-"
		}
		value = valueMap[value];
	} else {
		return '-'
	}
	return value;
}

async function getAutoCompleteColumnValue(column, data){
	if (column.tableURL) return '-';
	if(data[column.columnName] == '') return value;
	let response = await POST(`${column.url}/by/reference`, {'reference': data[column.columnName]}, undefined, 'json', true);
	if (response == undefined) return value;
	if (response.isSuccess) return response.label;
	return "";
}

function getFractionColumnValue(column, data){
	let fraction = data[column.columnName];
	let value = (new Fraction(fraction)).toString();
	value = new Intl.NumberFormat('th-TH', {}).format(value);
	return value;
}

function getCurrencyColumnValue(column, data){
	let value = "";
	let currency = data[column.columnName];
	if (typeof currency != 'object') {
		value = new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB'}).format(currency);
	} else {
		value = new Intl.NumberFormat('th-TH', { style: 'currency', currency: currency.originCurrency}).format(currency.originValue);
	}
	return value;
}

function getStatusColumnValue(column, data){
	let item = data[column.columnName];
	let classList = item.classList != undefined ? item.classList.join(" "): "";
	let color = item.color != undefined ? item.color: '';
	if (column.option) {
		let option = column.option[data[column.columnName]];
		if (option != undefined) {
			color = option.color;
			item = option;
		}
	}
	let style = color != '' ? `style="background:${color} !important;"`: '';
	return `<div ${style} class="status_flag ${classList}"><span class="tooltiptext" localize>${item.label}</span></div>`;
}

async function getImageColumnValue(column, data){
	let item = data[column.columnName];
	let icon = await CREATE_SVG_ICON("Image");
	return `<div class="flex center">
				<div class="abstract_operation_button " rel="view" onclick="">${icon.icon}</div>
			</div>`
}

function getDateColumnValue(column, data){
	if (data[column.columnName] != undefined && data[column.columnName] != 0) {
		return new Intl.DateTimeFormat(LANGUAGE, {day: "2-digit", month: "2-digit", year: "numeric"}).format(new Date(data[column.columnName]))
	}
	return "";
}

function getDateTimeColumnValue(column, data){
	if (data[column.columnName] != undefined && data[column.columnName] != 0) {
		return new Intl.DateTimeFormat(LANGUAGE, {day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false}).format(new Date(data[column.columnName]))
	}
	return "";
}