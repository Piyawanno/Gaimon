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
				<div>
					<div class="flex flex-column-responsive gap-5px" rel="button">
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
								<option value="50">50</option>
								<option value="100">100</option>
								<option value="500">500</option>
								<option value="1000">1000</option>
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
			</div>
			<div class="abstract_table_container" rel="table"></div>
			<div class="abstract_table_container hidden" rel="additionalContainer"></div>
			<div class="abstract_chart_container hidden" rel="chart"></div>
			<div class="hidden" rel="form"></div>
		</div>
	</div>
</div>