<div class="abstract_input_box input_per_line_{{{inputPerLine}}} {{#isHidden}}hidden{{/isHidden}}" rel="{{{columnName}}}_box">
	<div class="flex gap-5px" rel="labelDIV">
		<div localize>{{{label}}}</div>
		{{#isRequired}}<div><label class="required">*</label></div>{{/isRequired}}
	</div>
	{{#option}}
	<div class="abstract_checkbox">
		<input type="checkbox" rel="{{{columnName}}}_{{{value}}}" value="{{{value}}}" autocomplete="off" {{#isRequired}}required{{/isRequired}} {{^isEditable}}disabled{{/isEditable}}>
		<label rel="{{{columnName}}}_{{{value}}}Label" localize>{{{label}}}</label>
	</div>
	{{/option}}
	<div class="error text-align-center hidden" rel="{{{columnName}}}_error"></div>
</div>