<div class="abstract_input_box input_per_line_{{{inputPerLine}}} normal {{#isHidden}}hidden{{/isHidden}}" style="flex-direction:row;">
	<div rel="labelDIV" class="abstract_input_box input_per_line_{{{inputPerLine}}} full" rel="{{{columnName}}}_box">
		<div localize>{{{label}}}</div>
		<div><input type="password" rel="{{{columnName}}}" autocomplete="off" {{^hasEdit}}{{#isRequired}}required{{/isRequired}}{{/hasEdit}} {{^isEditable}}disabled{{/isEditable}}></div>
		<div class="error text-align-center hidden" rel="{{{columnName}}}_error"></div>
	</div>
	<div class="abstract_input_box input_per_line_{{{inputPerLine}}} full" rel="confirm_{{{columnName}}}_box">
		<div localize>Confirm {{{label}}}</div>
		<div><input type="password" rel="confirm_{{{columnName}}}" autocomplete="off" {{^hasEdit}}{{#isRequired}}required{{/isRequired}}{{/hasEdit}} {{^isEditable}}disabled{{/isEditable}}></div>
		<div class="error text-align-center hidden" rel="confirm_{{{columnName}}}_error"></div>
	</div>
</div>