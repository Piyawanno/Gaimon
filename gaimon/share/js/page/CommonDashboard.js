const CommonDashboard = function(main, parent) {
	let object = this;

	object.main = main;
	object.parent = parent;
	object.isInit = false;
	object.maxValue = {};

    this.init = async function(config) {
        if (!object.isInit) {
			Chart.register(ChartDataLabels);
			object.isInit = true;
		}
        object.chartList = [];
        object.dashboard = new DOMObject(await TEMPLATE.get("CommonDashboard"), {title: config.title, rootURL});
        object.dateRangeInput = await getDateRangeInput();
		object.dateRangeInput.onchange = function(filter) {
			object.refresh();
		}
        object.dashboard.dom.filterContainer.html(object.dateRangeInput)
    }

	this.render = async function(target) {
        object.dashboard.dom.container.html('');
        target.html(object.dashboard);
	}

	this.getTableLog = async function(config, fetchProtocol) {
		let view = new DOMObject(await TEMPLATE.get("CommonLogTable"), config)
		let classList = config.classList != undefined ? config.classList:[]
		for (let item of classList) {
			view.html.classList.add(item);
		}
		let filter = {
			limit: 10, 
			pageNumber: 1,
		}
		let filterData = await object.getCommonFilterData();
		Object.keys(filterData.date).map(x => { filter[x] =  filterData.date[x] });

        if (filterData.filterBy) {
            filter[filterData.filterBy] = config.data.id;
        }

		let log = await fetchProtocol(filter);
        let innerFilter = {};
		let filterLogType = -1;
		let filterVehicle = -1;
		let data = {
			count: log.count,
			hasAvatar: false,
			hasDelete: false,
			hasEdit: false,
		}
		if (config.inputs != undefined) data.inputs = config.inputs;
		if (config.excludeInput != undefined) data.excludeInput = config.excludeInput;
		let table = await object.parent.getTableView(config.modelName, data, 'Table');
		view.dom.log.append(table.component);
		view.dom.log.append(table.pagination);
		table.component.pageNumber = 1;
		table.component.limit = view.dom.limit;
		table.component.getPageNumber = function() {
			return parseInt(table.component.pageNumber);
		}
		table.component.setPageNumber = function(pageNumber) {
			table.component.pageNumber = pageNumber;
		}
		table.component.limit.onchange = async function() {
			await table.component.renderFunction();
		}
		table.component.getFilerData = async function() {
			let filter = {
				limit: parseInt(table.component.limit.value), 
				pageNumber: table.component.getPageNumber(),
			}
			let filterData = await object.getCommonFilterData();
			Object.keys(filterData.date).map(x => { filter[x] =  filterData.date[x] });
            Object.keys(innerFilter).map(x => { filter[x] =  innerFilter[x] });
			return filter
		}

		table.component.renderFunction = async function(limit = 10) {
			let filter = await table.component.getFilerData();
			let log = await fetchProtocol(filter);
			table.pagination.dom.pageNumber.placeholder = `${await table.component.getPageNumber()}/${log.count}`;
			await table.component.clearRecord();
			await table.component.createMultipleRecord(log.data);
		}

		table.renderFunction = table.component.renderFunction;
		view.renderFunction = table.component.renderFunction;

        if (config.modelName == undefined && config.inputs == undefined) view.dom.search.hide();

		view.dom.search.onclick = async function() {
            let searchConfig = {};
            if (config.search) searchConfig = config.search;
			let searhForm = await object.parent.getView(config.modelName == undefined ? '': config.modelName, searchConfig, 'SearchForm');
            let inner = new DOMObject(`<div class="abstract_form_input">${searhForm.dom.form.innerHTML}</div>`);
			let dialog = await object.parent.renderBlankView({title: 'Filter'}, 'Dialog');
			dialog.dom.form.html(inner);
            inner.setData(innerFilter);
			dialog.dom.submit.onclick = async function() {
				let result = inner.getData();
                innerFilter = result.data;
				await table.component.renderFunction(table.component.limit.value);
				dialog.close();
			}
		}

		await table.component.createMultipleRecord(log.data);
		return view;
	}

    this.getFilterData = async function() {
        
	}

	this.getCommonFilterData = async function() {
        let result = {};
		let dateFilter = object.dateRangeInput.getFilterData();
        if (dateFilter != undefined) Object.keys(dateFilter).map(x => { result[x] =  dateFilter[x] });
        let externalFilter = await object.getFilterData();
        if (externalFilter != undefined) Object.keys(externalFilter).map(x => { result[x] =  externalFilter[x] });
		return result
	}

	this.refresh = async function() {
		object.maxValue = {};
		for (let view of object.chartList) {
			if (view.renderFunction) view.renderFunction();
		}
	}

    this.appendTableLog = async function(config = {}, fetchProtocol) {
		let table = await object.getTableLog(config, fetchProtocol);
		object.dashboard.dom.container.append(table);
        object.chartList.push(table);
		return table;
	}

    this.appendChart = async function(config = {}, fetchProtocol) {
		let chart = await object.renderChartByTime(object.dashboard, config, fetchProtocol);
        object.chartList.push(chart);
		return chart;
    }

    this.appendPieChart = async function(config = {}, fetchProtocol) {
        let chart = await object.renderPieChart(object.dashboard, config, fetchProtocol);
        object.chartList.push(chart);
		return chart;
    }

	this.getPieChartConfig = async function(){
		let config = {
			type: 'doughnut',
			options: {
				cutout: '75%',
				responsive: true,
				maintainAspectRatio: true,
				aspectRatio: 1.1,
				plugins: {
					legend: {
						position: 'bottom',
					},
					datalabels : {
						display: true,
						color: '#fff',
					}
				}
			},
		}
		return config;
	}


	this.timeDifference = function(current, previous) {
		const elapsed = current - previous;
		if (elapsed < msPerHour) return [-Math.round(elapsed/msPerMinute), 'minute'];
		else if (elapsed < msPerDay ) return [-Math.round(elapsed/msPerHour ), 'hour'];
		else if (elapsed < msPerMonth) return [-Math.round(elapsed/msPerDay), 'day'];
		else if (elapsed < msPerYear) return [-Math.round(elapsed/msPerMonth), 'month'];
		else return [-Math.round(elapsed/msPerYear ), 'year'];
	}

	this.getBarChartConfig = async function(){
		let config = {
			type: 'bar',
			options: {
				responsive: true,
				maintainAspectRatio: true,
				aspectRatio: 2.5,
				barThickness: 24,
				maxBarThickness: 24,
				plugins: {
					legend: {
						position: 'bottom',
					},
					datalabels : {
						display: true,
						color: '#fff',
						align: 'center',
						anchor: 'center'
					}
				},
				scales: {
					y: {
						type: 'linear',
						grace: '5%',
						ticks: {
							precision: 0,
						},
					}
				}
			},
		}
		return config;
	}

	this.getLineChartConfig = async function(){
		let config = {
			type: 'line',
			options: {
				responsive: true,
				maintainAspectRatio: true,
				aspectRatio: 2.5,
				plugins: {
					legend: {
						position: 'bottom',
					},
					datalabels : {
						display: false,
						color: '#fff',
						align: 'end',
						anchor: 'center'
					}
				},
				scales: {
					y: {
						type: 'linear',
						min: 0,
						ticks: {
							precision: 0,
						},
					}
				}
			},
		}
		return config;
	}

	this.updateMaxValue = async function(key, maxValue) {
		if (object.maxValue[key] == undefined) object.maxValue[key] = 0
		if (object.maxValue[key] < maxValue) {
			object.maxValue[key] = maxValue;
		}
		for (let ID in object.charts) {
			if (!object.charts[ID].isSyncMaxValue) continue
			if (object.charts[ID].syncMaxValue != key) continue
			object.charts[ID].config.options.scales.y.max = parseInt(object.maxValue[key] * 1.1);
			object.charts[ID].chart.update();
		}
	}

	this.setChart = async function(ID, target, config){		
		if (object.charts == undefined) object.charts = {};
		if (config.syncMaxValue == undefined) config.isSyncMaxValue = false;
		else config.isSyncMaxValue = true;
		if(!object.charts[ID]){
			object.charts[ID] = {}
			let chart = new Chart(target, config);
			object.charts[ID].chart = chart;
			object.charts[ID].config = config;
			object.charts[ID].isSyncMaxValue = config.isSyncMaxValue;
			object.charts[ID].syncMaxValue = config.syncMaxValue;
		} else if (object.charts[ID].chart.height == 0) {
			let chart = new Chart(target, config);
			object.charts[ID].chart = chart;
			object.charts[ID].config = config;
			object.charts[ID].isSyncMaxValue = config.isSyncMaxValue;
			object.charts[ID].syncMaxValue = config.syncMaxValue;
		} else{
			object.charts[ID].config = config;
			object.charts[ID].data = config.data;
			object.charts[ID].isSyncMaxValue = config.isSyncMaxValue;
			object.charts[ID].syncMaxValue = config.syncMaxValue;
			object.charts[ID].chart.update();
		}
		if (config.isSyncMaxValue) {
			if (config.data.maxValue == undefined) return;
			await object.updateMaxValue(config.syncMaxValue, config.data.maxValue);
		}
	}

	this.renderPieChart = async function(dashboard, config, fetchProtocol) {
        let ID = config.data.id;
		let view = new DOMObject(await TEMPLATE.get('CommonChart'), {title: config.title});
		dashboard.dom.container.append(view);
		async function render() {
            let filter = await object.getCommonFilterData();
            filter.id = ID;
			let statistic = await fetchProtocol(filter);
			let chartConfig = config.chart;
			chartConfig.data = {};
			chartConfig.data.labels = statistic.labels;
			chartConfig.data.datasets = statistic.datasets;
			await object.setChart(config.chartID, view.dom.chart, chartConfig);
		}
		await render();
		view.renderFunction = render;
		return view;
	}

	this.renderChartByTime = async function(dashboard, config, fetchProtocol) {
		let ID = config.data.id;

		let view = await object.getChartView(config.title, config.classList)
		dashboard.dom.container.append(view);

		async function render() {
			let filter = await object.getCommonFilterData();
            let innerFilter = {
                id: ID, 
                start: filter[filter.timeType].start, 
                end: filter[filter.timeType].end, 
                filterBy: filter.filterBy,
                timeType: filter.timeType, 
                groupBy: filter.groupBy
            }
			if (config.additional) {
				Object.keys(config.additional).map(x => { innerFilter[x] =  config.additional[x] });
			}
			let data = await object.loadDataByDate(innerFilter, fetchProtocol);
			config.chart.data = data;
			await object.setChart(config.chartID, view.dom.chart, config.chart);
		}

		await render();
		view.renderFunction = render;
		return view;
	}

	this.getChartView = async function(title, classList = []) {
		let years = []
		let template = await TEMPLATE.get('CommonChart');

		let view = new DOMObject(template, {title, years});
		for (let item of classList) {
			view.html.classList.add(item);
		}
		return view;
	}

	this.loadDataByDate = async function(filter, fetchProtocol) {
		let statistic = await fetchProtocol(filter);
		let data = {};
		let formatter = new Intl.DateTimeFormat(LANGUAGE, {year: "2-digit", month: "2-digit", day: '2-digit'});
		data.labels = [];
		if (filter.timeType == 'date') {
			for (let label of statistic.labels) {
				let date = new Date(label * 1000.0);
				data.labels.push(formatter.format(date))
			}
		} else if (filter.timeType == 'month') {
			let now = new Date();
			let monthYearFormatter = new Intl.DateTimeFormat(LANGUAGE, {year: "numeric", month: "short"});
			let monthFormatter = new Intl.DateTimeFormat(LANGUAGE, {month: "short"});
			for (let label of statistic.labels) {
				let date = new Date(label * 1000.0);
				if (date.getFullYear() == now.getFullYear()) data.labels.push(monthFormatter.format(date))
				else data.labels.push(monthYearFormatter.format(date))
			}
		} else {
			data.labels = statistic.labels;
		}

		data.datasets = statistic.datasets;
		data.maxValue = statistic.maxValue;
		return data;
	}

	this.getFilterByType = async function(start, end, type) {
		let result = {start, end}
		let now = new Date();
		if (type == 'date') {
			let DAY_SECONDS = 60 * 60 * 24 * 1000.0;
			let timezone = (now.getTimezoneOffset() * 60) * 1000.0;
			let startTime = new Date(start);
			result.start = parseInt((startTime.getTime() - timezone) / DAY_SECONDS)
			let endTime = new Date(end);
			result.end = parseInt((endTime.getTime() - timezone) / DAY_SECONDS)
		} else if (type == 'month') {
			let startTime = new Date(start);
			result.start = 12 * (startTime.getFullYear() - 1970) + (startTime.getMonth() + 1)
			let endTime = new Date(end);
			result.end = 12 * (endTime.getFullYear() - 1970) + (endTime.getMonth() + 1)
		}
		return result;
	}

	this.getTimeDeltaToolTip = function(context) {
		const formatter = new Intl.RelativeTimeFormat(LANGUAGE, { numeric: "auto" });
		let result = [];
		let label = context.dataset.label || '';
		if (label) {
			result.push(label)
			result.push(':')
		}
		if (context.parsed.y !== null) {
			let hourResult = formatter.formatToParts(context.parsed.y, "hour");
			let value = 0;
			for (let item of hourResult) {
				if (item.type == "integer") {
					value = item.value;
				}
			}
			if (value != 0) {
				result.push(value);
				result.push((hourResult[hourResult.length - 1].value.trim()));
			}
			
			value = 0;
			let minute = ((context.parsed.y * 3600) % 3600) / 60;
			let minuteResult = formatter.formatToParts(minute, "minute");
			for (let item of minuteResult) {
				if (item.type == "integer") {
					value = item.value;
				}
			}
			if (value != 0) {
				result.push(value);
				result.push((minuteResult[minuteResult.length - 1].value).trim());
			}
			let second = (context.parsed.y * 3600) % 60;
			let secondResult = formatter.formatToParts(second, "second");
			for (let item of secondResult) {
				if (item.type == "integer") {
					result.push(item.value);
				}
			}
			result.push((secondResult[secondResult.length - 1].value).trim());
		}
		return result.join(' ');
	}

}