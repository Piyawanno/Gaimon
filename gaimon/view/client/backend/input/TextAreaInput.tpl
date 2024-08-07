<div class="abstract_input_box input_per_line_{{{inputPerLine}}} full {{#isHidden}}hidden{{/isHidden}}" rel="{{{columnName}}}_box">
	<div class="flex gap-5px" rel="labelDIV">
		<div localize>{{{label}}}</div>
		{{#isRequired}}<div><label class="required">*</label></div>{{/isRequired}}
	</div>
	<div><textarea rel="{{{columnName}}}" autocomplete="off" {{#isRequired}}required{{/isRequired}} {{#config.isView}}disabled{{/config.isView}} {{^isEditable}}disabled{{/isEditable}} placeholder="{{placeHolder}}"></textarea></div>
	<div class="error text-align-center hidden" rel="{{{columnName}}}_error"></div>
</div>