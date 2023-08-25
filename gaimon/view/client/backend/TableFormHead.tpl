<tr>
    {{#hasSelect}}
    <th class="{{{cssClass}}} text-align-center" style="width:0;"><input type="checkbox" rel="checkAll"/></th>
    {{/hasSelect}}
    {{#thead}}
	<th rel="{{{columnName}}}_th" class="{{{cssClass}}} {{#isNumber}}text-align-right{{/isNumber}} {{#isHidden}}hidden{{/isHidden}}" style="min-width:{{{width}}};" localize>{{{label}}}</th>
    {{/thead}}
</tr>