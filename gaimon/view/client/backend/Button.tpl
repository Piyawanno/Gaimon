<div class="abstract_button {{{cssClass}}}" rel="{{{ID}}}">
	{{#SVG}}
		{{#isSVG}}
		<div class="flex gap-10px">
			<div class="abstract_tag_card_svg_icon">{{{icon}}}</div>
			<div localize>{{{label}}}</div>
		</div>
		{{/isSVG}}
		{{^isSVG}}
		<div class="flex gap-10px">
			<div class="abstract_tag_card_img_icon">
				<img class="menuImg" src="{{{icon}}}">
			</div>
			<div localize>{{{label}}}</div>
		</div>
		{{/isSVG}}
	{{/SVG}}
	{{^SVG}}
		<div localize>{{{label}}}</div>
	{{/SVG}}
</div>