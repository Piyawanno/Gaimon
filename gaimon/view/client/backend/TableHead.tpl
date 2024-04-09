<tr>
	{{#hasSelect}}
	<th style="width:0;"><input type="checkbox" rel="checkAll"/></th>
	{{/hasSelect}}
	{{#hasIndex}}
	<th style="text-align:center;width:0;"></th>
	{{/hasIndex}}
	{{#hasAvatar}}
	<th style="width:0;" localize>Avatar</th>
	{{/hasAvatar}}
	{{#thead}}
	{{#isTable}}
	<th rel="{{{columnName}}}_th" {{#isStatus}}style="width:0 !important;min-width:0 !important;"{{/isStatus}} class="{{#isNumber}}text-align-right{{/isNumber}} {{#isStatus}}text-align-center{{/isStatus}} {{#isHidden}}hidden{{/isHidden}}" localize>{{{label}}}</th>
	{{/isTable}}
	{{/thead}}
</tr>