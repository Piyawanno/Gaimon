<td>
	<div class="flex gap-5px abstract_form_input">
		<div class="width-100-percent abstract_input_box">
			<input class="{{#config.isView}}abstract_input_view{{/config.isView}}" type="date" rel="{{{columnName}}}" autocomplete="off" {{#isRequired}}required{{/isRequired}} {{#config.isView}}disabled{{/config.isView}} {{^isEditable}}disabled{{/isEditable}}>
		</div>
	</div>
	<div class="error_message text-align-center hidden" rel="{{{columnName}}}_error"></div>
</td>