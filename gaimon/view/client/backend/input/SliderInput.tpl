<div class="abstract_input_box input_per_line_{{{inputPerLine}}} {{#isHidden}}hidden{{/isHidden}}" rel="{{{columnName}}}_box">
	<div class="flex gap-5px" rel="labelDIV">
		<div localize>{{{label}}}</div>
		{{#isRequired}}<div><label class="required">*</label></div>{{/isRequired}}
	</div>
	<div><input type="range" rel="{{{columnName}}}" autocomplete="off"
			{{^minValue}}min="{{minValue}}"{{/minValue}}
			{{^maxValue}}min="{{maxValue}}"{{/maxValue}}
			{{#isRequired}}required{{/isRequired}}
			{{^isEditable}}disabled{{/isEditable}} value="0"></div>
	<div class="error text-align-center hidden" rel="{{{columnName}}}_error"></div>
</div>