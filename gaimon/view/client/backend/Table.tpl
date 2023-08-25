<div class="width-100-percent flex-column gap-10px" rel="tableContainer">
	{{#isTableForm}}
	<div class="flex space-between margin-top-10px">
		<div class="flex gap-10px">
			<div class="table_form_head" localize>{{{title}}}</div>
		</div>
		<div class="flex gap-10px" rel="buttonList">
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
	{{/isTableForm}}
	<div class="overflow-x-auto width-100-percent">
		<table class="abstract_table {{#isTableForm}}abstract_formTable{{/isTableForm}}" rel="table">
			<thead rel="thead"></thead>
			<tbody rel="tbody"></tbody>
		</table>
	</div>
</div>