<tr>
	{{#hasSelect}}
	<th style="width:0;"><input type="checkbox" rel="checkAll"/></th>
	{{/hasSelect}}
	{{#hasIndex}}
	<th style="text-align:center;width:0;"></th>
	{{/hasIndex}}
	{{#tableColumn}}
	<th rel="{{{columnName}}}" {{#isStatus}}style="width:0;"{{/isStatus}} class="{{#isNumber}}text-align-right{{/isNumber}} {{#isStatus}}text-align-center{{/isStatus}} {{#isHidden}}hidden{{/isHidden}}" localize>{{{label}}}</th>
	{{/tableColumn}}
	{{#recordOperation}}
	<th localize>{{{label}}}</th>
	{{/recordOperation}}
</tr>