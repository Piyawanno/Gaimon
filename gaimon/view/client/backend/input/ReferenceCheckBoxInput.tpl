<div class="abstract_input_box input_per_line_{{{inputPerLine}}} {{#isHidden}}hidden{{/isHidden}}" rel="{{{columnName}}}_box">
	<div class="flex gap-5px" rel="labelDIV">
		<div localize>{{{label}}}</div>
		{{#isRequired}}<div><label class="required">*</label></div>{{/isRequired}}
	</div>
	{{#option}}
	<div class="flex gap-10px" style="user-select: none;margin-left: 20px;">
		<div class="flex-column-center flex-column flex-start" style="margin-top:4px;margin-top:0px;"><input type="checkbox" value="{{{value}}}" rel="{{{columnName}}}_{{{value}}}" autocomplete="off" {{#isRequired}}required="{{{columnName}}}"{{/isRequired}} {{^isEditable}}disabled{{/isEditable}} ></div>
		<div class="flex-column-center width-100-percent" rel="{{{columnName}}}_{{{value}}}Box"><label class="flex-column-center" rel="{{{columnName}}}_{{{value}}}Label">{{{label}}}</label></div>
	</div>
	{{/option}}
	<div class="error text-align-center hidden" rel="{{{columnName}}}_error"></div>
</div>