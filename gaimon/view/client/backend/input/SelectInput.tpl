<div class="abstract_input_box input_per_line_{{{inputPerLine}}}" rel="{{{columnName}}}_box">
	<div class="flex gap-5px" rel="labelDIV">
		<div localize>{{{label}}}</div>
		{{#isRequired}}<div><label class="required">*</label></div>{{/isRequired}}
	</div>
	<div>
		<select rel="{{{columnName}}}" {{#isRequired}}required{{/isRequired}} {{^isEditable}}disabled{{/isEditable}} localize>
			{{^isFilter}}<option rel="defaultValue_{{{columnName}}}" value="-1" localize>None</option>{{/isFilter}}
			{{#isFilter}}<option value="-1" localize>All</option>{{/isFilter}}
			{{#option}}
			<option value="{{{value}}}" localize>{{{label}}}</option>
			{{/option}}
		</select>
	</div>
	<div class="error text-align-center hidden" rel="{{{columnName}}}_error"></div>
</div>