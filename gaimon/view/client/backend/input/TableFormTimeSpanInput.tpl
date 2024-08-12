<td>
	<div class="abstract_form_input">
		<div class="abstract_input_box {{#isHidden}}hidden{{/isHidden}}" rel="{{{columnName}}}_box">
			<div class="flex gap-5px">
				<div class="flex width-100-percent">
					<input class="time-span-input" type="number" min="0" rel="hour" placeholder="hour" autocomplete="off" {{#isRequired}}required{{/isRequired}} {{^isEditable}}disabled{{/isEditable}}>
					<div class="time-span-label" localize>hr.</div>
				</div>
				<div class="flex width-100-percent">
					<input class="time-span-input" type="number" min="0" max="59" rel="minute" placeholder="minute" autocomplete="off" {{#isRequired}}required{{/isRequired}} {{^isEditable}}disabled{{/isEditable}}>
					<div class="time-span-label" localize>m.</div>
				</div>
				<div class="flex width-100-percent">
					<input class="time-span-input" type="number" min="0" max="59" rel="second" placeholder="second" autocomplete="off" {{#isRequired}}required{{/isRequired}} {{^isEditable}}disabled{{/isEditable}}>
					<div class="time-span-label" localize>s.</div>
				</div>
			</div>
			<div class="error text-align-center hidden" rel="{{{columnName}}}_error"></div>
		</div>
	</div>
</td>