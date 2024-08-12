<td>
	<div class="abstract_form_input">
		<div class="abstract_input_box" style="flex-direction:row;">
			{{#option}}
			<div class="abstract_checkbox">
				<input type="checkbox" rel="{{{columnName}}}_{{{value}}}" value="{{{value}}}" autocomplete="off" {{#isRequired}}required{{/isRequired}} {{^isEditable}}disabled{{/isEditable}}>
				<label rel="{{{columnName}}}_{{{value}}}Label" localize>{{{label}}}</label>
			</div>
			{{/option}}
		</div>
		<div class="error_message text-align-center hidden" rel="{{{columnName}}}_error"></div>
	</div>
</td>