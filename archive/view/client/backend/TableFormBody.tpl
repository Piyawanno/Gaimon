<tr class="{{{cssClass}}}">
    {{#tbody}}
    <td class="{{{cssClass}}}" {{#isFileMatrix}}style="vertical-align:top;"{{/isFileMatrix}}>
		<div class="flex-column gap-10px">
			{{#isText}}
			<div><input type="text" rel="{{{columnName}}}" autocomplete="off" {{#isRequired}}required{{/isRequired}}></div>
			{{/isText}}
			{{#isNumber}}
			<div><input type="number" rel="{{{columnName}}}" autocomplete="off" 
						isNegative="{{{isNegative}}}" 
						isZeroIncluded="{{{isZeroIncluded}}}"
						isFloatingPoint="{{{isFloatingPoint}}}"
						{{#isRequired}}required{{/isRequired}}
						{{^isEditable}}disabled{{/isEditable}}></div>
			{{/isNumber}}
			{{#isFraction}}
			<div class="flex gap-5px">
				<div class="width-100-percent"><input type="number" rel="{{{columnName}}}_integer" autocomplete="off" fraction="{{{columnName}}}"
					isNegative="{{{isNegative}}}" 
					isZeroIncluded="{{{isZeroIncluded}}}"
					isFloatingPoint="{{{isFloatingPoint}}}"
					{{#isRequired}}required{{/isRequired}}
					{{^isEditable}}disabled{{/isEditable}}></div>
				<div class="flex-column flex-end">.</div>
				<div class="width-100-percent"><input type="number" rel="{{{columnName}}}_decimal" autocomplete="off" fraction="{{{columnName}}}"
					isNegative="{{{isNegative}}}" 
					isZeroIncluded="{{{isZeroIncluded}}}"
					isFloatingPoint="{{{isFloatingPoint}}}"
					{{#isRequired}}required{{/isRequired}}
					{{^isEditable}}disabled{{/isEditable}}></div>
			</div>
			{{/isFraction}}
			{{#isPassword}}
			<input type="password" rel="{{{columnName}}}" autocomplete="off" {{^hasEdit}}{{#isRequired}}required{{/isRequired}}{{/hasEdit}}>
			<input type="password" rel="confirm_{{{columnName}}}" autocomplete="off" {{^hasEdit}}{{#isRequired}}required{{/isRequired}}{{/hasEdit}}>
			{{/isPassword}}
			{{#isEmail}}
			<input type="email" rel="{{{columnName}}}" autocomplete="off" {{#isRequired}}required{{/isRequired}}>
			{{/isEmail}}
			{{#isEnumSelect}}
			<select rel="{{{columnName}}}" {{#isRequired}}required{{/isRequired}} localize>
				<option rel="defaultValue_{{{columnName}}}" value="-1" localize>None</option>
				{{#option}}
				<option value="{{{value}}}" localize>{{{label}}}</option>
				{{/option}}
			</select>
			{{/isEnumSelect}}
			{{#isReferenceSelect}}
			<select rel="{{{columnName}}}" {{#isRequired}}required{{/isRequired}} localize>
				<option rel="defaultValue_{{{columnName}}}" value="-1" localize>None</option>
				{{#option}}
				<option value="{{{value}}}" localize>{{{label}}}</option>
				{{/option}}
			</select>
			{{/isReferenceSelect}}
			{{#isSelect}}
			<select rel="{{{columnName}}}" {{#isRequired}}required{{/isRequired}} localize>
				<option rel="defaultValue_{{{columnName}}}" value="-1" localize>None</option>
				{{#option}}
				<option value="{{{value}}}" localize>{{{label}}}</option>
				{{/option}}
			</select>
			{{/isSelect}}
			{{#isPrerequisiteReferenceSelect}}
			<select rel="{{{columnName}}}" {{#isRequired}}required{{/isRequired}}>
				<option value="-1" localize>None</option>
			</select>
			{{/isPrerequisiteReferenceSelect}}
			{{#isDateTime}}
			<input type="datetime-local" rel="{{{columnName}}}" autocomplete="off" {{#isRequired}}required{{/isRequired}}>
			{{/isDateTime}}
			{{#isTime}}
			<input type="time" rel="{{{columnName}}}" autocomplete="off" {{#isRequired}}required{{/isRequired}}>
			{{/isTime}}
			{{#isDate}}
			<input type="date" rel="{{{columnName}}}" autocomplete="off" {{#isRequired}}required{{/isRequired}}>
			{{/isDate}}
			{{#isMonth}}
			<input type="month" rel="{{{columnName}}}" autocomplete="off" {{#isRequired}}required{{/isRequired}}>
			{{/isMonth}}
			{{#isTextArea}}
			<textarea rel="{{{columnName}}}" autocomplete="off" {{#isRequired}}required{{/isRequired}}></textarea>
			{{/isTextArea}}
			{{#isEnumCheckBox}}
			<input type="checkbox" rel="{{{columnName}}}" autocomplete="off" {{#isRequired}}required{{/isRequired}}>
			{{/isEnumCheckBox}}
			{{#isCheckBox}}
				{{#option}}
				<div class="abstract_checkbox">
					<input type="checkbox" rel="{{{columnName}}}_{{{value}}}" value="{{{value}}}" autocomplete="off" {{#isRequired}}required{{/isRequired}}>
					<label rel="{{{columnName}}}_{{{value}}}Label" localize>{{{label}}}</label>
				</div>
				{{/option}}
			{{/isCheckBox}}
			{{#isEnable}}
			<div class="abstract_form_input_check_box">
				<input type="checkbox" rel="{{{columnName}}}" autocomplete="off" {{#isRequired}}required{{/isRequired}}>
				<!-- <label rel="{{{columnName}}}Label" localize>{{{label}}}</label> -->
			</div>
			{{/isEnable}}
			{{#isFile}}
			<input type="file" rel="{{{columnName}}}" autocomplete="off" {{#isRequired}}required{{/isRequired}}>
			{{/isFile}}
			{{#isImage}}
			<div class="flex gap-5px">
				<div class="width-100-percent"><input type="file" rel="{{{columnName}}}" autocomplete="off" accept="image/*" {{#isRequired}}required{{/isRequired}}></div>
				<div class="abstract_input_svg_icon {{{cssClass}}}" rel="{{{columnName}}}_preview">
					<svg style="width:24px;height:24px" viewBox="0 0 24 24">
						<path fill="currentColor" d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z" />
					</svg>
				</div>
				<div class="abstract_input_svg_icon {{{cssClass}}}" style="background:red;" rel="{{{columnName}}}_delete">
					<svg style="width:24px;height:24px" viewBox="0 0 24 24">
						<path fill="currentColor" d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
					</svg>
				</div>
				<div class="abstract_image_previewer hidden" rel="{{{columnName}}}_previewer"></div>
			</div>
			{{/isImage}}
			{{#isFileMatrix}}
			<table class="abstract_form_table" style="margin-top:3px;">
				<thead>
					<tr>
						<th style="padding:8px;" localize>file</th>
						<th style="width:10%;padding:0px;">
							<div class="flex center">
								<svg class="abstract_button add_button" rel="{{{columnName}}}_icon" style="padding:2px;border-radius:50%;width:20px;" viewBox="0 0 24 24">
									<path fill="currentColor" d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
								</svg>
							</div>
						</th>
					</tr>
				</thead>
				<tbody rel="{{{columnName}}}_tbody">

				</tbody>
			</table>
			{{/isFileMatrix}}
			{{#isTimeSpan}}
			<div class="flex gap-5px">
				<div class="width-100-percent"><input type="number" timespan="{{{columnName}}}" min="0" rel="{{{columnName}}}_hour" placeholder="hour" autocomplete="off" {{#isRequired}}required{{/isRequired}}></div>
				<div class="width-100-percent"><input type="number" timespan="{{{columnName}}}" min="0" max="59" rel="{{{columnName}}}_minute" placeholder="minute" autocomplete="off" {{#isRequired}}required{{/isRequired}}></div>
				<div class="width-100-percent"><input type="number" timespan="{{{columnName}}}" min="0" max="59" rel="{{{columnName}}}_second" placeholder="second" autocomplete="off" {{#isRequired}}required{{/isRequired}}></div>
			</div>
			{{/isTimeSpan}}
			{{#isAutoComplete}}
			<div class="flex gap-5px">
				<div class="width-100-percent"><input type="text" rel="{{{columnName}}}" autocomplete="off" {{#isRequired}}required{{/isRequired}}></div>
				{{#SVG}}
					{{#isSVG}}
					<div class="abstract_input_svg_icon {{{cssClass}}}" rel="{{{columnName}}}_icon">
						{{{icon}}}
					</div>
					{{/isSVG}}
					{{^isSVG}}
					<div class="abstract_input_img_icon {{{cssClass}}}" rel="{{{columnName}}}_icon">
						<img class="menuImg" src="{{{icon}}}">
					</div>
					{{/isSVG}}
				{{/SVG}}
			</div>
			{{#hasTag}}
			<div class="flex-wrap gap-5px" rel="{{{columnName}}}_tag"></div>
			{{/hasTag}}
			{{/isAutoComplete}}
			{{#isLabel}}
			<label rel="{{{columnName}}}">{{{value}}}</label>
			{{/isLabel}}
			{{#isHidden}}
			<div class="hidden" rel="{{{columnName}}}">
				<input class="hidden" type="number" rel="{{{columnName}}}" autocomplete="off">
			</div>
			{{/isHidden}}
			<div class="error text-align-center hidden" rel="{{{columnName}}}_error"></div>
		</div>
    </td>
    {{/tbody}}
    <td style="vertical-align:middle;">
		<div style="display: flex;align-content: center;justify-content: center;align-items: center;cursor: pointer;" rel="delete">
			<svg style="width:24px;height:24px" viewBox="0 0 24 24">
				<path fill="currentColor" d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
			</svg>
		</div>
	</td>
</tr>