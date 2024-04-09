<tr>
	{{#hasSelect}}
	<th style="width:0;"><input type="checkbox" rel="checkAll"/></th>
	{{/hasSelect}}
	{{#hasIndex}}
	<th style="text-align:center;width:0;"></th>
	{{/hasIndex}}
	{{#hasAvatar}}
	<th style="width:0;">
		<div class="table_head_column">
			<div localize>Avatar</div>
		</div>
	</th>
	{{/hasAvatar}}
	{{#tableColumn}}
	<th rel="{{{columnName}}}" {{#isStatus}}style="width:0;"{{/isStatus}} class="{{#isNumber}}text-align-right{{/isNumber}} {{#isStatus}}text-align-center{{/isStatus}} {{#isHidden}}hidden{{/isHidden}}">
		<div class="table_head_column">
			<div localize>{{{label}}}</div>
			<div rel="{{{columnName}}}_sort" class="table_sort_icon">
				<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12,6L7,11H17L12,6M7,13L12,18L17,13H7Z" /></svg>
			</div>
			<div rel="{{{columnName}}}_sort_asc" class="table_sort_icon hidden">
				<svg viewBox="0 0 24 24"><path fill="currentColor" d="M7,15L12,10L17,15H7Z" /></svg>
			</div>
			<div rel="{{{columnName}}}_sort_desc" class="table_sort_icon hidden">
				<svg viewBox="0 0 24 24"><path fill="currentColor" d="M7,10L12,15L17,10H7Z" /></svg>
			</div>
		</div>
	</th>
	{{/tableColumn}}
	{{#recordOperation}}
	<th style="text-align:center;" rel="operation_{{{label}}}">
		<div class="table_head_column">
			<div localize>{{{label}}}</div>
		</div>
	</th>
	{{/recordOperation}}
</tr>