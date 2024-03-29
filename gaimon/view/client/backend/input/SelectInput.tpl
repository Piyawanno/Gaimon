<div class="abstract_input_box input_per_line_{{{inputPerLine}}} {{#isHidden}}hidden{{/isHidden}}" rel="{{{columnName}}}_box">
	<div class="flex gap-5px" rel="labelDIV">
		<div localize>{{{label}}}</div>
		{{#isRequired}}<div><label class="required">*</label></div>{{/isRequired}}
	</div>
	<div>
		<select rel="{{{columnName}}}" {{#isRequired}}required{{/isRequired}} {{#config.isView}}disabled{{/config.isView}} {{^isEditable}}disabled{{/isEditable}} localize>
			{{^isFilter}}<option rel="defaultValue_{{{columnName}}}" value="-1" localize>None</option>{{/isFilter}}
			{{#isFilter}}<option value="-1" localize>All</option>{{/isFilter}}
			{{#option}}
			<option value="{{{value}}}" localize>{{{label}}}</option>
			{{/option}}
		</select>
	</div>
	<div class="error_message text-align-center hidden" rel="{{{columnName}}}_error"></div>
</div>