<div class="abstract_input_box input_per_line_{{{inputPerLine}}} {{#isHidden}}hidden{{/isHidden}}" rel="{{{columnName}}}_box">
	<div class="flex gap-5px" rel="labelDIV">
		<div localize>{{{label}}}</div>
		{{#isRequired}}<div><label class="required">*</label></div>{{/isRequired}}
	</div>
	<div class="flex gap-5px">
		<div class="width-100-percent">
			<input type="text" rel="{{{columnName}}}" class="{{#config.isView}}hidden{{/config.isView}}" autocomplete="off" {{#isRequired}}required{{/isRequired}} {{^isEditable}}disabled{{/isEditable}} {{#config.isView}}readonly{{/config.isView}}>
			{{#config.isView}}
			<div class="abstract_input_view" rel="{{{columnName}}}_view"></div>
			{{/config.isView}}
		</div>
		<div class="side_icon_container" rel="sideIconContainer">
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
	</div>
	<div class="error_message text-align-center hidden" rel="{{{columnName}}}_error"></div>
</div>