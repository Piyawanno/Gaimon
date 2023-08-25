<div class="abstract_input_box input_per_line_{{{inputPerLine}}} full" rel="{{{columnName}}}_box">
	<div class="flex gap-5px" rel="labelDIV">
		<div localize>{{{label}}}</div>
		{{#isRequired}}<div><label class="required">*</label></div>{{/isRequired}}
	</div>
	<div><textarea rel="{{{columnName}}}" autocomplete="off" {{#isRequired}}required{{/isRequired}} {{^isEditable}}disabled{{/isEditable}}></textarea></div>
	<div class="error text-align-center hidden" rel="{{{columnName}}}_error"></div>
</div>