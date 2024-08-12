<a class="clear_link operation flex" {{#urlPath}}href="{{urlPath}}"{{/urlPath}} rel="url" onclick="return false;">
	<div class="flex gap-10px" rel="operation">
		{{#isEnableInput}}
		<div class="flex-column-center">
			<input rel="isEnable" type="checkbox">
		</div>
		<div class="flex-column-center user-select-none" localize>{{{label}}}</div>
		{{/isEnableInput}}
		{{^isEnableInput}}
			{{#icon.isSVG}}
				<div class="flex-column-center">{{{icon.icon}}}</div>
				<div class="flex-column-center">{{{label}}}</div>
			{{/icon.isSVG}}
			{{^icon.isSVG}}
				<img class="menuImg" src="{{{icon.icon}}}">
			{{/icon.isSVG}}
		{{/isEnableInput}}
	</div>
</a>