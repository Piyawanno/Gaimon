<td>
	<div class="abstract_form_input">
		<div class="abstract_input_box">
			<input type="number" rel="{{{columnName}}}" autocomplete="off" 
				isNegative="{{{isNegative}}}" 
				isZeroIncluded="{{{isZeroIncluded}}}"
				isFloatingPoint="{{{isFloatingPoint}}}"
				{{^isNegative}}min="0"{{/isNegative}}
				{{^isFloatingPoint}}
					onkeypress="return /^-?[0-9]*$/.test(this.value+event.key)" step="1"
				{{/isFloatingPoint}}}
				{{#isRequired}}required{{/isRequired}}
				{{^isEditable}}disabled{{/isEditable}}
				{{#config.isView}}readonly{{/config.isView}} placeholder="{{placeHolder}}">
		</div>
		<div class="error_message text-align-center hidden" rel="{{{columnName}}}_error"></div>
	</div>
</td>