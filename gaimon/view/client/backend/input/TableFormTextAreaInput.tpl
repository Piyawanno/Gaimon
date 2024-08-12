<td>
	<div class="flex gap-5px abstract_form_input">
		<div class="width-100-percent abstract_input_box">
			<textarea rel="{{{columnName}}}" autocomplete="off" {{#isRequired}}required{{/isRequired}} {{#config.isView}}disabled{{/config.isView}} {{^isEditable}}disabled{{/isEditable}} placeholder="{{placeHolder}}"></textarea>
		</div>
	</div>
	<div class="error_message text-align-center hidden" rel="{{{columnName}}}_error"></div>
</td>