<div class="abstract_input_box input_per_line_{{{inputPerLine}}} {{#isHidden}}hidden{{/isHidden}}" rel="{{{columnName}}}_box">
	<div class="flex gap-5px" rel="labelDIV">
		<div localize rel="label">{{{label}}}</div>
		{{#isRequired}}<div><label class="required">*</label></div>{{/isRequired}}
	</div>
	{{#option}}
	<div class="flex gap-10px" style="user-select: none;margin-left: 20px;">
		<div class="flex-column-center" style="height:32px;"><input style="margin:0;" type="radio" name="{{{columnName}}}" value="{{{value}}}" rel="{{{columnName}}}_{{{value}}}" autocomplete="off" {{#isRequired}}required="{{{columnName}}}"{{/isRequired}} {{^isEditable}}disabled{{/isEditable}}></div>
		<div class="flex width-100-percent gap-10px" style="height:32px;">
			<div class="flex" rel="{{{columnName}}}_{{{value}}}Box"><label class="flex-column-center" rel="{{{columnName}}}_{{{value}}}Label" localize>{{{label}}}</label></div>
			{{#isOtherInput}}<div class="flex width-100-percent"><input type="text" placeholder="{{{placeholder}}}" rel="{{{columnName}}}_{{{value}}}_other"></div>{{/isOtherInput}}
		</div>
	</div>
	{{/option}}
	<div class="error text-align-center hidden" rel="{{{columnName}}}_error"></div>
</div>