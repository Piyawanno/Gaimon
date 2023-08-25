<div class="layoutCreatorPreferenceForm" rel="preference">
    <div class="abstract_input_box input_per_line_1" rel="label_box">
        <div localize>Label</div>
        <div class="flex gap-5px">
            <div class="width-100-percent"><input type="text" rel="label" autocomplete="off" required></div>
        </div>
        <div class="error text-align-center hidden" rel="label_error"></div>
    </div>
    <div class="abstract_input_box input_per_line_1" rel="isShowLabel_box">
		<div class="abstract_form_input_check_box">
			<input type="checkbox" rel="isShowLabel" autocomplete="off" checked>
			<label rel="isShowLabelLabel" localize>Show label</label>
		</div>
		<div class="error text-align-center hidden" rel="{{{columnName}}}_error"></div>
	</div>
    <div class="abstract_input_box input_per_line_1" rel="inputPerLine_box">
        <div localize>Input per line</div>
        <div>
            <select rel="inputPerLine" required localize>
				<option value="1" localize>1</option>
                <option value="2" localize>2</option>
                <option value="3" localize>3</option>
                <option value="4" localize>4</option>
			</select>
        </div>
    </div>
</div>