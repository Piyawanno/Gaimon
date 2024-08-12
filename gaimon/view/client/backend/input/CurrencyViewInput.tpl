<div class="abstract_input_box input_per_line_{{{inputPerLine}}} {{#isHidden}}hidden{{/isHidden}}" rel="{{{columnName}}}_box">
	<div class="flex gap-5px" rel="labelDIV">
		<div localize>{{{label}}}</div>
		{{#isRequired}}<div><label class="required">*</label></div>{{/isRequired}}
	</div>
	<div class="flex gap-5px">
		<div class="width-100-percent flex gap-5px">
			<input type="number" rel="{{{columnName}}}" autocomplete="off" currency="{{{columnName}}}"
				isNegative="{{{isNegative}}}" 
				isZeroIncluded="{{{isZeroIncluded}}}"
				isFloatingPoint="{{{isFloatingPoint}}}"
				{{#isRequired}}required{{/isRequired}}
				{{^isEditable}}disabled{{/isEditable}}>
			<select rel="currency" style="width:70px;" {{^isShowCurrency}}hidden{{/isShowCurrency}}>
				<option value="THB">THB</option>
			</select>
		</div>
	</div>
	<div class="error text-align-center hidden" rel="{{{columnName}}}_error"></div>
</div>