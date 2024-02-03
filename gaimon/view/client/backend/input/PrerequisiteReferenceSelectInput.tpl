<div class="abstract_input_box input_per_line_{{{inputPerLine}}} {{#isHidden}}hidden{{/isHidden}}" rel="{{{columnName}}}_box">
	<div class="flex gap-5px" rel="labelDIV">
		<div localize>{{{label}}}</div>
		{{#isRequired}}<div><label class="required">*</label></div>{{/isRequired}}
	</div>
	<div class="flex gap-5px">
		<div class="width-100-percent">
			<select rel="{{{columnName}}}" {{#isRequired}}required{{/isRequired}} {{#config.isView}}disabled{{/config.isView}} {{^isEditable}}disabled{{/isEditable}} localize>
				{{^isFilter}}<option rel="defaultValue_{{{columnName}}}" value="-1" localize>None</option>{{/isFilter}}
				{{#isFilter}}<option value="-1" localize>All</option>{{/isFilter}}
			</select>
		</div>
		{{#SVG}}
			{{#isSVG}}
			<div class="abstract_input_svg_icon {{{cssClass}}}" rel="{{{columnName}}}_icon">
				{{{icon}}}
			</div>
			{{/isSVG}}
			{{^isSVG}}
			<div class="abstract_input_img_icon {{{cssClass}}}" rel="{{{columnName}}}_icon">
				<img class="menuImg" src="{{{icon}}}">
			</div>
			{{/isSVG}}
		{{/SVG}}
	</div>
	<div class="error text-align-center hidden" rel="{{{columnName}}}_error"></div>
</div>