<div class="abstract_input_box input_per_line_{{{inputPerLine}}}" rel="{{{columnName}}}_box">
	<div localize>{{{label}}} {{#isRequired}}<label class="required">*</label>{{/isRequired}}</div>
	<div><input type="email" rel="{{{columnName}}}" autocomplete="off" {{#isRequired}}required{{/isRequired}} {{^isEditable}}disabled{{/isEditable}}></div>
	<div class="error text-align-center hidden" rel="{{{columnName}}}_error"></div>
</div>