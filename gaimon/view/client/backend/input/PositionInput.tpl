<div class="abstract_input_box input_per_line_{{{inputPerLine}}} normal {{#isHidden}}hidden{{/isHidden}}" style="flex-direction:row;">
	<div rel="labelDIV" class="abstract_input_box input_per_line_{{{inputPerLine}}} full" rel="latitude_{{{columnName}}}_box">
		<div localize>Latitude</div>
		<div><input type="number" rel="latitude_{{{columnName}}}" autocomplete="off" {{^hasEdit}}{{#isRequired}}required{{/isRequired}}{{/hasEdit}} {{^isEditable}}disabled{{/isEditable}} isPosition="{{columnName}}"></div>
		<div class="error text-align-center hidden" rel="latitude_{{{columnName}}}_error"></div>
	</div>
	<div class="abstract_input_box input_per_line_{{{inputPerLine}}} full" rel="latitude_{{{columnName}}}_box">
		<div localize>Longitude</div>
		<div><input type="number" rel="longitude_{{{columnName}}}" autocomplete="off" {{^hasEdit}}{{#isRequired}}required{{/isRequired}}{{/hasEdit}} {{^isEditable}}disabled{{/isEditable}} isPosition="{{columnName}}"></div>
		<div class="error text-align-center hidden" rel="confirm_{{{columnName}}}_error"></div>
	</div>
</div>