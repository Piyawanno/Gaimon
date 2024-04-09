<tr class="{{{cssClass}}}">
	{{#hasSelect}}
	<td class="text-align-center" style="width:50px;"><input type="checkbox" rel="check"/></td>
	{{/hasSelect}}
	{{#tbody}}
	<td rel="{{{columnName}}}_td" class="{{{cssClass}}} {{#config.isView}}table_view{{/config.isView}} {{#isHidden}}hidden{{/isHidden}}" {{#isFileMatrix}}style="vertical-align:top;"{{/isFileMatrix}}>
		<div class="flex-column gap-10px">
			{{{input}}}
		</div>
	</td>
	{{/tbody}}
</tr>