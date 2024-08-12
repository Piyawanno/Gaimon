<td>
	<div class="abstract_form_input">
		<div class="abstract_input_box" style="flex-direction:row;">
			<input type="number" rel="{{{columnName}}}" autocomplete="off" currency="{{{columnName}}}"
				isNegative="{{{isNegative}}}" 
				isZeroIncluded="{{{isZeroIncluded}}}"
				isFloatingPoint="{{{isFloatingPoint}}}"
				{{#isRequired}}required{{/isRequired}}
				{{^isEditable}}disabled{{/isEditable}} placeholder="{{placeHolder}}">
			<select rel="currency" style="width:70px;" {{^isShowCurrency}}hidden{{/isShowCurrency}}>
				<option value="THB">THB</option>
			</select>
		</div>
		<div class="error_message text-align-center hidden" rel="{{{columnName}}}_error"></div>
	</div>
</td>