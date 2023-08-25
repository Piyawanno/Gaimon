<div class="abstract_input_box input_per_line_{{{inputPerLine}}}" rel="{{{columnName}}}_box">
	<div rel="labelDIV" localize>{{{label}}}</div>
	<div class="flex gap-5px">
		<div class="width-100-percent">
			<input type="file" rel="{{{columnName}}}" autocomplete="off" {{#isRequired}}required{{/isRequired}} {{^isEditable}}disabled{{/isEditable}}>
		</div>
	</div>
</div>