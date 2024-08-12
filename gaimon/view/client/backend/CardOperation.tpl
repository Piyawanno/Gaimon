<div class="abstract_menu_button" rel="operation">
	<a class="clear_link" {{#urlPath}}href="{{urlPath}}"{{/urlPath}} rel="url" style="height:20px;" onclick="return false;">
		{{#icon.isSVG}}
			{{{icon.icon}}}
		{{/icon.isSVG}}
		{{^icon.isSVG}}
			<img class="menuImg" src="{{{icon.icon}}}">
		{{/icon.isSVG}}
	</a>
</div>