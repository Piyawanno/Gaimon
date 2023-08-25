<div class="abstract_input_box input_per_line_{{{inputPerLine}}}" rel="{{{columnName}}}_box">
	<div class="flex gap-5px" rel="labelDIV">
		<div localize>{{{label}}}</div>
		{{#isRequired}}<div><label class="required">*</label></div>{{/isRequired}}
	</div>
	<div class="flex gap-5px">
		<div class="width-100-percent"><input type="number" rel="{{{columnName}}}" autocomplete="off" currency="{{{columnName}}}"
			isNegative="{{{isNegative}}}" 
			isZeroIncluded="{{{isZeroIncluded}}}"
			isFloatingPoint="{{{isFloatingPoint}}}"
			{{#isRequired}}required{{/isRequired}}
			{{^isEditable}}disabled{{/isEditable}}></div>
		<!-- <div class="width-100-percent"><input type="number" rel="{{{columnName}}}_integer" autocomplete="off" currency="{{{columnName}}}"
			isNegative="{{{isNegative}}}" 
			isZeroIncluded="{{{isZeroIncluded}}}"
			isFloatingPoint="{{{isFloatingPoint}}}"
			{{#isRequired}}required{{/isRequired}}
			{{^isEditable}}disabled{{/isEditable}}></div>
		<div class="flex-column flex-end">.</div>
		<div class="width-100-percent"><input type="number" rel="{{{columnName}}}_decimal" autocomplete="off" currency="{{{columnName}}}"
			isNegative="{{{isNegative}}}" 
			isZeroIncluded="{{{isZeroIncluded}}}"
			isFloatingPoint="{{{isFloatingPoint}}}"
			{{#isRequired}}required{{/isRequired}}
			{{^isEditable}}disabled{{/isEditable}}></div> -->
	</div>
	<div class="error text-align-center hidden" rel="{{{columnName}}}_error"></div>
</div>