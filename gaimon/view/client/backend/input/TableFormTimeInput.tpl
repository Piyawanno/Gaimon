<td>
	<div class="abstract_input_box {{#isHidden}}hidden{{/isHidden}}" rel="{{{columnName}}}_box">
		<div><input class="{{#config.isView}}abstract_input_view{{/config.isView}}" type="time" rel="{{{columnName}}}" autocomplete="off" {{#isRequired}}required{{/isRequired}} {{^isEditable}}disabled{{/isEditable}} {{#config.isView}}readonly{{/config.isView}}></div>
		<div class="error text-align-center hidden" rel="{{{columnName}}}_error"></div>
	</div>
</td>