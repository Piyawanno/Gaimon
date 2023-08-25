<div class="abstract_input_box input_per_line_{{{inputPerLine}}}" rel="{{{columnName}}}_box">
	<div class="flex gap-5px" rel="labelDIV">
		<div localize>{{{label}}}</div>
		{{#isRequired}}<div><label class="required">*</label></div>{{/isRequired}}
	</div>
	<div><input type="number" rel="{{{columnName}}}" autocomplete="off" 
			isNegative="{{{isNegative}}}" 
			isZeroIncluded="{{{isZeroIncluded}}}"
			isFloatingPoint="{{{isFloatingPoint}}}"
			{{^isNegative}}min="0"{{/isNegative}}
			{{^isFloatingPoint}}
				onkeypress="return /^-?[0-9]*$/.test(this.value+event.key)" step="1"
			{{/isFloatingPoint}}}
			{{#isRequired}}required{{/isRequired}}
			{{^isEditable}}disabled{{/isEditable}}></div>
	<div class="error text-align-center hidden" rel="{{{columnName}}}_error"></div>
</div>