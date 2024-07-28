function createDocumentNumberEvent(input, icon, callback){
	icon.style.backgroundColor = '';
	input.enable();
	input.classList.remove('disabled');
	icon.onclick = async function(){
		let data = await callback();
		input.value = data;
		icon.onclick = undefined;
		icon.style.backgroundColor = "#EAEAEA";
		if (input.disable && typeof input.disable == 'function') {
			input.disable();
		} else {
			input.classList.add('disabled');
		}
		
	}
}

function createSubmitEvent(page, view, isSearchForm, isSearchDialog){
	async function submit() {
		let result = view.getViewData();
		if (view.onSubmit != undefined){
			view.onSubmit(view);
		}else if (!isSearchForm && !isSearchDialog) {
			if (page.restProtocol != undefined) {
				await submitRestProtocol(page, view, result);
			} else {
				page.submit(view);
			}
		} else if (isSearchDialog) {
			submitSearchDialog(view, page);
		} else {
			submitSearchForm(page, result);
		}
	}
	return submit;
}

function submitSearchDialog(view, page){
	let filter = view.dom.form.filter;
	let result = filter.getData();
	page.filter = filter.filter;
	page.compare = filter.compare;
	page.parameterLabel = filter.parameterLabel;
	for(let i in result.data){
		if(i == 'parameter' || i == 'compare' || i == 'filter') continue;
		page.filter[i] = result.data[i];
	}						
	SHOW_LOADING_DIALOG(async function(){
		await page.getData(page.limit);
		page.main.home.dom.dialog.html('');
	});
}

function submitSearchForm(page, result){
	page.filter = result.data;
	SHOW_LOADING_DIALOG(async function(){
		await page.getData(page.limit);
	});
}

async function submitRestProtocol(page, view, result){
	if (view.id != undefined) result.data.id = view.id;
	let data = result.data;
	let isValid = await page.validate(view, data);
	if (isValid) {
		if (!result.file.isEmpty()) {
			data = result.file;
			data.append('data', JSON.stringify(result.data));
		}
		if (view.id != undefined) {
			await page.restProtocol.update(data);
		} else {
			await page.restProtocol.insert(data);
		}
		view.close();
	}
}