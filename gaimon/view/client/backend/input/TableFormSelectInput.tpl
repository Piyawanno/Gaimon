<td>
	<div class="abstract_form_input">
		<div class="abstract_input_box">
			<select rel="{{{columnName}}}" {{#isRequired}}required{{/isRequired}} {{#config.isView}}disabled{{/config.isView}} {{^isEditable}}disabled{{/isEditable}} localize>
				{{^isFilter}}<option rel="defaultValue_{{{columnName}}}" value="-1" localize>Not Select</option>{{/isFilter}}
				{{#isFilter}}<option value="-1" localize>All</option>{{/isFilter}}
				{{#option}}
				<option value="{{{value}}}" localize>{{{label}}}</option>
				{{/option}}
			</select>
		</div>
		<div class="error_message text-align-center hidden" rel="{{{columnName}}}_error"></div>
	</div>
</td>