<div>
	<div class="abstract_container" rel="container">
		<!-- <div class="abstract_addOn" rel="addOn">
			<div class="relative">
				<div class="item">
					<div class="pointer">Most used</div>
					<div class="container">
						<div class="chevron"></div>
						<div class="flex-column" rel="mostUsed"></div>
					</div>
				</div>				
			</div>
		</div> -->
		<div class="abstract_menu_container hidden" rel="menu">
			<div class="flex-wrap" rel="menuList"></div>
			<div rel="buttonList"></div>
		</div>
		<div class="hidden" rel="summaryContainer"></div>
		<div class="abstract_filter_container hidden" rel="filter"></div>
		<div class="abstract_data_container" rel="dataContainer">
			<div class="flex flex-column-responsive space-between gap-10px">
				<div class="flex gap-10px">
					<div class="flex gap-20px">
						<div class="data_header" rel="title" localize>{{name}}</div>
						<div class="flex-column center pointer hidden" rel="info">
							<svg style="width:20px;height:20px" viewBox="0 0 24 24">
								<path fill="gray" d="M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z" />
							</svg>
						</div>
					</div>
					<div rel="titleContainer"></div>
				</div>
				<div class="flex space-between gap-5px">
					<div>
						<div class="flex flex-column-responsive gap-5px" rel="button">
							{{#hasExcel}}
							<div class="excel_container">
								<div class="abstract_button excel_button" localize>
									<div class="flex-column-center">
										<svg style="width:20px;height:20px;" viewBox="0 0 24 24">
											<path fill="currentColor" d="M21.17 3.25Q21.5 3.25 21.76 3.5 22 3.74 22 4.08V19.92Q22 20.26 21.76 20.5 21.5 20.75 21.17 20.75H7.83Q7.5 20.75 7.24 20.5 7 20.26 7 19.92V17H2.83Q2.5 17 2.24 16.76 2 16.5 2 16.17V7.83Q2 7.5 2.24 7.24 2.5 7 2.83 7H7V4.08Q7 3.74 7.24 3.5 7.5 3.25 7.83 3.25M7 13.06L8.18 15.28H9.97L8 12.06L9.93 8.89H8.22L7.13 10.9L7.09 10.96L7.06 11.03Q6.8 10.5 6.5 9.96 6.25 9.43 5.97 8.89H4.16L6.05 12.08L4 15.28H5.78M13.88 19.5V17H8.25V19.5M13.88 15.75V12.63H12V15.75M13.88 11.38V8.25H12V11.38M13.88 7V4.5H8.25V7M20.75 19.5V17H15.13V19.5M20.75 15.75V12.63H15.13V15.75M20.75 11.38V8.25H15.13V11.38M20.75 7V4.5H15.13V7Z" />
										</svg>
									</div>
								</div>
								<div class="excel_content">
									<div class="item" rel="downloadTemplate">
										<div class="flex-column-center">
											<svg style="width:20px;height:20px;" viewBox="0 0 24 24">
												<path fill="currentColor" d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z" />
											</svg>
										</div>
										<div class="flex-column-center">Download Template</div>
									</div>
									<div class="item" rel="importExcel">
										<div class="flex-column-center">
											<svg style="width:20px;height:20px;" viewBox="0 0 24 24">
												<path fill="currentColor" d="M4 3H18C19.11 3 20 3.9 20 5V12.08C18.45 11.82 16.92 12.18 15.68 13H12V17H13.08C12.97 17.68 12.97 18.35 13.08 19H4C2.9 19 2 18.11 2 17V5C2 3.9 2.9 3 4 3M4 7V11H10V7H4M12 7V11H18V7H12M4 13V17H10V13H4M18.44 15V17H22.44V19H18.44V21L15.44 18L18.44 15" />
											</svg>
										</div>
										<div class="flex-column-center">Import Excel</div>
										<input type="file" class="hidden" rel="excelFile" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel">
									</div>
									<div class="item" rel="exportExcel">
										<div class="flex-column-center">
											<svg style="width:20px;height:20px;" viewBox="0 0 24 24">
												<path fill="currentColor" d="M4 3H18C19.11 3 20 3.9 20 5V12.08C18.45 11.82 16.92 12.18 15.68 13H12V17H13.08C12.97 17.68 12.97 18.35 13.08 19H4C2.9 19 2 18.11 2 17V5C2 3.9 2.9 3 4 3M4 7V11H10V7H4M12 7V11H18V7H12M4 13V17H10V13H4M19.44 21V19H15.44V17H19.44V15L22.44 18L19.44 21" />
											</svg>
										</div>
										<div class="flex-column-center">Export Excel</div>
									</div>
								</div>
							</div>
							{{/hasExcel}}
							{{#hasTableView}}
							<div class="view">
								<div class="item" rel="cardView">
									<svg style="width:24px;height:20px;" viewBox="0 0 24 24">
										<path fill="currentColor" d="M3,11H11V3H3M3,21H11V13H3M13,21H21V13H13M13,3V11H21V3" />
									</svg>
								</div>
								<div class="item" rel="tableView">
									<svg style="width:24px;height:23px;" viewBox="0 0 24 24">
										<path fill="currentColor" d="M9,5V9H21V5M9,19H21V15H9M9,14H21V10H9M4,9H8V5H4M4,19H8V15H4M4,14H8V10H4V14Z" />
									</svg>
								</div>
							</div>
							{{/hasTableView}}
							{{#hasLimit}}
							<div>
								<select class="abstract_select" style="height: 100%;" rel="limit">
									<option value="10">10</option>
									<option value="20">20</option>
									<option value="50">50</option>
									<option value="100">100</option>
									<option value="200">200</option>
								</select>
							</div>
							{{/hasLimit}}
							{{#hasFilter}}
							<div class="abstract_button filter_button" rel="search">
								<svg style="width:24px;height:15px;" viewBox="0 0 24 24">
									<path fill="currentColor" d="M14,12V19.88C14.04,20.18 13.94,20.5 13.71,20.71C13.32,21.1 12.69,21.1 12.3,20.71L10.29,18.7C10.06,18.47 9.96,18.16 10,17.87V12H9.97L4.21,4.62C3.87,4.19 3.95,3.56 4.38,3.22C4.57,3.08 4.78,3 5,3V3H19V3C19.22,3 19.43,3.08 19.62,3.22C20.05,3.56 20.13,4.19 19.79,4.62L14.03,12H14Z" />
								</svg>
							</div>
							{{/hasFilter}}
							{{#hasAdd}}
							<div class="abstract_button add_button" rel="add" localize>
								<div class="flex-column-center">
									<svg style="width:15px;height:15px;" viewBox="0 0 24 24">
										<path fill="currentColor" d="M17,13H13V17H11V13H7V11H11V7H13V11H17M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
									</svg>
								</div>
								<div class="flex-column-center" localize>Add</div>
							</div>
							{{/hasAdd}}
						</div>
					</div>
					<div class="flex flex-column-responsive gap-5px" rel="additionalButton"></div>
				</div>				
			</div>
			<div class="abstract_table_container" rel="table"></div>
			<div class="abstract_table_container hidden" rel="additionalContainer"></div>
			<div class="abstract_chart_container hidden" rel="chart"></div>
			<div class="abstract_excel_container hidden" rel="excel"></div>
			<div class="hidden" rel="form"></div>
		</div>
	</div>
</div>