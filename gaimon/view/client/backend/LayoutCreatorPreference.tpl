<div class="layoutCreatorPreferenceForm" rel="preference">
    <div class="abstract_input_box input_per_line_1" rel="column_box">
        <div localize>Column</div>
        <div class="flex gap-5px">
            <div class="width-100-percent"><input type="text" rel="column" value="{{{name}}}" autocomplete="off" required></div>
        </div>
        <div class="error text-align-center hidden" rel="column_error"></div>
    </div>
    <div class="abstract_input_box input_per_line_1" rel="label_box">
        <div localize>Label</div>
        <div class="flex gap-5px">
            <div class="width-100-percent"><input type="text" rel="label" value="{{{input.label}}}" autocomplete="off" required></div>
        </div>
        <div class="error text-align-center hidden" rel="label_error"></div>
    </div>
    {{#additional.isInput}}
    <div class="abstract_input_box input_per_line_1" rel="default_box">
        <div localize>Default</div>
        <div class="flex gap-5px">
            <div class="width-100-percent">
                {{#additional.isNumnber}}
                <input type="number" rel="default" value="{{{default}}}" autocomplete="off" required>
                {{/additional.isNumnber}}
                {{^additional.isNumnber}}
                <input type="text" rel="default" value="{{{default}}}" autocomplete="off" required>
                {{/additional.isNumnber}}
            </div>
        </div>
        <div class="error text-align-center hidden" rel="default_error"></div>
    </div>
    {{/additional.isInput}}
    {{#additional.hasOption}}
    <div class="abstract_input_box input_per_line_1" rel="option_box">
        <div class="layoutCreaterPreferenceInputHeader">
            <div localize>Option</div>
            <div class="layoutCreaterPreferenceInputHeader layoutCreaterPreferenceInputHeaderButton" rel="addOption">
                <svg style="width: 18px;height: 18px;" viewBox="3 3 18 18">
                    <path fill="currentColor" d="M17,13H13V17H11V13H7V11H11V7H13V11H17M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3Z"></path>
                </svg>
            </div>
        </div>
        <div class="layoutCreaterPreferenceOptionContainer" rel="option">
        </div>
        <div class="error text-align-center hidden" rel="option_error"></div>
    </div>
    {{/additional.hasOption}}
    {{#additional.isFile}}
    <div class="abstract_input_box input_per_line_1" rel="isMultiple_box">
		<div rel="isMultiple_blankSpace" style="height: calc(1em + 7.5px);"></div>
		<div class="abstract_form_input_check_box">
			<input type="checkbox" rel="isMultiple" autocomplete="off">
			<label rel="isMultipleLabel" localize>Multiple files</label>
		</div>
		<div class="error text-align-center hidden" rel="isMultiple_error"></div>
	</div>
    {{/additional.isFile}}
    {{#additional.isPassword}}
    <div class="abstract_input_box input_per_line_1" rel="verify_box">
		<div localize>Must contain</div>
		<div class="abstract_form_input_check_box">
			<input type="checkbox" rel="verify_lowercase" autocomplete="off">
			<label rel="verify_lowercaseLabel" localize>a-z</label>
		</div>
        <div class="abstract_form_input_check_box">
			<input type="checkbox" rel="verify_uppercase" autocomplete="off">
			<label rel="verify_uppercaseLabel" localize>A-Z</label>
		</div>
        <div class="abstract_form_input_check_box">
			<input type="checkbox" rel="verify_numberic" autocomplete="off">
			<label rel="verify_numbericLabel" localize>0-9</label>
		</div>
        <div class="abstract_form_input_check_box">
			<input type="checkbox" rel="verify_symbol" autocomplete="off">
			<label rel="verify_symbolLabel" localize>Symbol</label>
		</div>
		<div class="error text-align-center hidden" rel="isMultiple_error"></div>
	</div>
    {{/additional.isPassword}}
</div>