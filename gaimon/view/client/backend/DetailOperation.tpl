<a class="clear_link operation" {{#urlPath}}href="{{urlPath}}"{{/urlPath}} rel="url" onclick="return false;">
	<div class="flex gap-10px" rel="operation">
		{{#icon.isSVG}}
			<div class="flex-column-center">{{{icon.icon}}}</div>
			<div class="flex-column-center">{{{label}}}</div>
		{{/icon.isSVG}}
		{{^icon.isSVG}}
			<img class="menuImg" src="{{{icon.icon}}}">
		{{/icon.isSVG}}
	</div>
</a>