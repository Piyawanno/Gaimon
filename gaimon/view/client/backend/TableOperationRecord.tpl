<td rel="{{{ID}}}_td" style="vertical-align:middle;width:0;">
	<div class="flex center">
		<div class="abstract_operation_button {{{cssClass}}}" rel="{{{ID}}}">
			{{#isLabel}}
				{{{label}}}
			{{/isLabel}}
			{{^isLabel}}
				{{#isSVG}}
					{{{svg}}}
				{{/isSVG}}
				{{^isSVG}}
					<img class="menuImg" src="{{{svg}}}">
				{{/isSVG}}
			{{/isLabel}}
		</div>
	</div>
</td>