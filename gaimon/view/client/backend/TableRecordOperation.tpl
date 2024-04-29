<td style="vertical-align:middle;width:0;">
	<div class="flex center">
		<a class="clear_link" {{#urlPath}}href="{{urlPath}}"{{/urlPath}} rel="url" onclick="return false;">
			<div class="abstract_operation_button" rel="operation">
				{{#icon.isSVG}}
					{{{icon.icon}}}
				{{/icon.isSVG}}
				{{^icon.isSVG}}
					<img class="menuImg" src="{{{icon.icon}}}">
				{{/icon.isSVG}}
			</div>
		</a>
	</div>
</td>