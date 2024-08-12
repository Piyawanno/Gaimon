<td>
	<div class="flex gap-5px abstract_form_input">
		<div class="width-100-percent abstract_input_box">
			<input type="text" rel="{{{columnName}}}" class="{{#config.isView}}hidden{{/config.isView}}" autocomplete="off" {{#isRequired}}required{{/isRequired}} {{^isEditable}}disabled{{/isEditable}} {{#config.isView}}readonly{{/config.isView}} placeholder="{{placeHolder}}">
			{{#config.isView}}
			<div class="abstract_input_view" rel="{{{columnName}}}_view"></div>
			{{/config.isView}}
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
	<div class="error_message text-align-center hidden" rel="{{{columnName}}}_error"></div>
</td>