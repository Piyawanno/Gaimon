<div class="abstract_input_box input_per_line_{{{inputPerLine}}} full {{#isHidden}}hidden{{/isHidden}}" rel="{{{columnName}}}_box">
	<div class="flex gap-5px" rel="labelDIV">
		<div localize>{{{label}}}</div>
		{{#isRequired}}<div><label class="required">*</label></div>{{/isRequired}}
	</div>
	<div><div style="height:120px;" rel="{{{columnName}}}" {{#isRequired}}required{{/isRequired}}></div></div>
	<div class="error text-align-center hidden" rel="{{{columnName}}}_error"></div>
</div>