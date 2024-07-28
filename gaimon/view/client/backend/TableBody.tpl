<tr class="{{{cssClass}}}">
	{{#hasSelect}}
	<td class="text_top"><input type="checkbox" rel="check"/></td>
	{{/hasSelect}}
	{{#hasIndex}}
	<td class="text_top" style="text-align:center;" rel="index">{{{index}}}</td>
	{{/hasIndex}}
	{{#hasAvatar}}
	<td class="avatar" rel="avatar"></td>
	{{/hasAvatar}}
	{{#tbody}}
	<td class="{{#isLink}}hotLink{{/isLink}} table_view {{#isHidden}}hidden{{/isHidden}}" style="{{#isStatus}}vertical-align:middle !important;overflow:unset !important;width:0 !important;min-width:0 !important;{{/isStatus}}" align="{{{align}}}" rel="{{{key}}}" localize>{{{value}}}</td>
	{{/tbody}}
</tr>