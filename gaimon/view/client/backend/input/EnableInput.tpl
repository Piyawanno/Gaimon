<div class="abstract_input_box input_per_line_{{{inputPerLine}}} {{#isHidden}}hidden{{/isHidden}}" rel="{{{columnName}}}_box">
	<div class="flex gap-5px" rel="labelDIV" style="height: calc(1em + 7.5px);">
		<div localize class="hidden">{{{label}}}</div>
		{{#isRequired}}<div class="hidden"><label class="required">*</label></div>{{/isRequired}}
	</div>
	<div class="abstract_form_input_check_box">
		<input type="checkbox" rel="{{{columnName}}}" autocomplete="off" {{#isRequired}}required{{/isRequired}} {{^isEditable}}disabled{{/isEditable}}>
		<label rel="{{{columnName}}}Label" localize>{{{label}}}</label>
	</div>
	<div class="error text-align-center hidden" rel="{{{columnName}}}_error"></div>
</div>