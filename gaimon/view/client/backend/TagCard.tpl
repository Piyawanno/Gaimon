<div class="abstract_tag_card">
	<div>{{{label}}}</div>
	{{#SVG}}
		{{#isSVG}}
		<div class="abstract_tag_card_svg_icon" rel="delete">
			{{{icon}}}
		</div>
		{{/isSVG}}
		{{^isSVG}}
		<div class="abstract_tag_card_img_icon" rel="delete">
			<img class="menuImg" src="{{{icon}}}">
		</div>
		{{/isSVG}}
	{{/SVG}}
</div>