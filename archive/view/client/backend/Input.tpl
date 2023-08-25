{{^isLabel}}
	{{#isText}}
	<div class="abstract_input_box input_per_line_{{{inputPerLine}}}" rel="{{{columnName}}}_box">
		<div localize>{{{label}}} {{#isRequired}}<label class="required">*</label>{{/isRequired}}</div>
		<div class="flex gap-5px">
			<div class="width-100-percent"><input type="text" rel="{{{columnName}}}" autocomplete="off" {{#isRequired}}required{{/isRequired}} {{^isEditable}}disabled{{/isEditable}}></div>
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
		<div class="error text-align-center hidden" rel="{{{columnName}}}_error"></div>
	</div>
	{{/isText}}
	{{#isNumber}}
	<div class="abstract_input_box input_per_line_{{{inputPerLine}}}" rel="{{{columnName}}}_box">
		<div localize>{{{label}}} {{#isRequired}}<label class="required">*</label>{{/isRequired}}</div>
		<div><input type="number" rel="{{{columnName}}}" autocomplete="off" 
				isNegative="{{{isNegative}}}" 
				isZeroIncluded="{{{isZeroIncluded}}}"
				isFloatingPoint="{{{isFloatingPoint}}}"
				{{#isRequired}}required{{/isRequired}}
				{{^isEditable}}disabled{{/isEditable}}></div>
		<div class="error text-align-center hidden" rel="{{{columnName}}}_error"></div>
	</div>
	{{/isNumber}}
	{{#isFraction}}
	<div class="abstract_input_box input_per_line_{{{inputPerLine}}}" rel="{{{columnName}}}_box">
		<div localize>{{{label}}} {{#isRequired}}<label class="required">*</label>{{/isRequired}}</div>
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
	<div class="error text-align-center hidden" rel="{{{columnName}}}_error"></div>
	</div>
	{{/isFraction}}
	{{#isPassword}}
	<div class="abstract_input_box input_per_line_{{{inputPerLine}}} normal" style="flex-direction:row;">
		<div class="abstract_input_box input_per_line_{{{inputPerLine}}} full" rel="{{{columnName}}}_box">
			<div localize>{{{label}}}</div>
			<div><input type="password" rel="{{{columnName}}}" autocomplete="off" {{^hasEdit}}{{#isRequired}}required{{/isRequired}}{{/hasEdit}} {{^isEditable}}disabled{{/isEditable}}></div>
			<div class="error text-align-center hidden" rel="{{{columnName}}}_error"></div>
		</div>
		<div class="abstract_input_box input_per_line_{{{inputPerLine}}} full" rel="confirm_{{{columnName}}}_box">
			<div localize>Confirm {{{label}}}</div>
			<div><input type="password" rel="confirm_{{{columnName}}}" autocomplete="off" {{^hasEdit}}{{#isRequired}}required{{/isRequired}}{{/hasEdit}} {{^isEditable}}disabled{{/isEditable}}></div>
			<div class="error text-align-center hidden" rel="confirm_{{{columnName}}}_error"></div>
		</div>
	</div>
	{{/isPassword}}
	{{#isEmail}}
	<div class="abstract_input_box input_per_line_{{{inputPerLine}}}" rel="{{{columnName}}}_box">
		<div localize>{{{label}}} {{#isRequired}}<label class="required">*</label>{{/isRequired}}</div>
		<div><input type="email" rel="{{{columnName}}}" autocomplete="off" {{#isRequired}}required{{/isRequired}} {{^isEditable}}disabled{{/isEditable}}></div>
		<div class="error text-align-center hidden" rel="{{{columnName}}}_error"></div>
	</div>
	{{/isEmail}}
	{{#isEnumSelect}}
	<div class="abstract_input_box input_per_line_{{{inputPerLine}}}" rel="{{{columnName}}}_box">
		<div localize>{{{label}}} {{#isRequired}}<label class="required">*</label>{{/isRequired}}</div>
		<div>
			<select rel="{{{columnName}}}" {{#isRequired}}required{{/isRequired}} {{^isEditable}}disabled{{/isEditable}} localize>
				{{^isFilter}}<option rel="defaultValue_{{{columnName}}}" value="-1" localize>None</option>{{/isFilter}}
				{{#isFilter}}<option value="-1" localize>All</option>{{/isFilter}}
				{{#option}}
				<option value="{{{value}}}" localize>{{{label}}}</option>
				{{/option}}
			</select>
		</div>
		<div class="error text-align-center hidden" rel="{{{columnName}}}_error"></div>
	</div>
	{{/isEnumSelect}}
	{{#isReferenceSelect}}
	<div class="abstract_input_box input_per_line_{{{inputPerLine}}}" rel="{{{columnName}}}_box">
		<div localize>{{{label}}} {{#isRequired}}<label class="required">*</label>{{/isRequired}}</div>
		<div>
			<select rel="{{{columnName}}}" {{#isRequired}}required{{/isRequired}} {{^isEditable}}disabled{{/isEditable}} localize>
				{{^isFilter}}<option rel="defaultValue_{{{columnName}}}" value="-1" localize>None</option>{{/isFilter}}
				{{#isFilter}}<option value="-1" localize>All</option>{{/isFilter}}
				{{#option}}
				<option value="{{{value}}}" localize>{{{label}}}</option>
				{{/option}}
			</select>
		</div>
		<div class="error text-align-center hidden" rel="{{{columnName}}}_error"></div>
	</div>
	{{/isReferenceSelect}}
	{{#isSelect}}
	<div class="abstract_input_box input_per_line_{{{inputPerLine}}}" rel="{{{columnName}}}_box">
		<div localize>{{{label}}} {{#isRequired}}<label class="required">*</label>{{/isRequired}}</div>
		<div>
			<select rel="{{{columnName}}}" {{#isRequired}}required{{/isRequired}} {{^isEditable}}disabled{{/isEditable}} localize>
				{{^isFilter}}<option rel="defaultValue_{{{columnName}}}" value="-1" localize>None</option>{{/isFilter}}
				{{#isFilter}}<option value="-1" localize>All</option>{{/isFilter}}
				{{#option}}
				<option value="{{{value}}}" localize>{{{label}}}</option>
				{{/option}}
			</select>
		</div>
		<div class="error text-align-center hidden" rel="{{{columnName}}}_error"></div>
	</div>
	{{/isSelect}}
	{{#isPrerequisiteReferenceSelect}}
	<div class="abstract_input_box input_per_line_{{{inputPerLine}}}" rel="{{{columnName}}}_box">
		<div localize>{{{label}}} {{#isRequired}}<label class="required">*</label>{{/isRequired}}</div>
		<div>
			<select rel="{{{columnName}}}" {{#isRequired}}required{{/isRequired}} {{^isEditable}}disabled{{/isEditable}} localize>
				{{^isFilter}}<option rel="defaultValue_{{{columnName}}}" value="-1" localize>None</option>{{/isFilter}}
				{{#isFilter}}<option value="-1" localize>All</option>{{/isFilter}}
			</select>
		</div>
		<div class="error text-align-center hidden" rel="{{{columnName}}}_error"></div>
	</div>
	{{/isPrerequisiteReferenceSelect}}
	{{#isDateTime}}
	<div class="abstract_input_box input_per_line_{{{inputPerLine}}}" rel="{{{columnName}}}_box">
		<div localize>{{{label}}} {{#isRequired}}<label class="required">*</label>{{/isRequired}}</div>
		<div><input type="datetime-local" rel="{{{columnName}}}" autocomplete="off" {{#isRequired}}required{{/isRequired}} {{^isEditable}}disabled{{/isEditable}}></div>
		<div class="error text-align-center hidden" rel="{{{columnName}}}_error"></div>
	</div>
	{{/isDateTime}}
	{{#isTime}}
	<div class="abstract_input_box input_per_line_{{{inputPerLine}}}" rel="{{{columnName}}}_box">
		<div localize>{{{label}}} {{#isRequired}}<label class="required">*</label>{{/isRequired}}</div>
		<div><input type="time" rel="{{{columnName}}}" autocomplete="off" {{#isRequired}}required{{/isRequired}} {{^isEditable}}disabled{{/isEditable}}></div>
		<div class="error text-align-center hidden" rel="{{{columnName}}}_error"></div>
	</div>
	{{/isTime}}
	{{#isDate}}
	<div class="abstract_input_box input_per_line_{{{inputPerLine}}}" rel="{{{columnName}}}_box">
		<div localize>{{{label}}} {{#isRequired}}<label class="required">*</label>{{/isRequired}}</div>
		<div><input type="date" rel="{{{columnName}}}" autocomplete="off" {{#isRequired}}required{{/isRequired}} {{^isEditable}}disabled{{/isEditable}}></div>
		<div class="error text-align-center hidden" rel="{{{columnName}}}_error"></div>
	</div>
	{{/isDate}}
	{{#isMonth}}
	<div class="abstract_input_box input_per_line_{{{inputPerLine}}}" rel="{{{columnName}}}_box">
		<div localize>{{{label}}} {{#isRequired}}<label class="required">*</label>{{/isRequired}}</div>
		<div><input type="month" rel="{{{columnName}}}" autocomplete="off" {{#isRequired}}required{{/isRequired}} {{^isEditable}}disabled{{/isEditable}}></div>
		<div class="error text-align-center hidden" rel="{{{columnName}}}_error"></div>
	</div>
	{{/isMonth}}
	{{#isTextArea}}
	<div class="abstract_input_box input_per_line_{{{inputPerLine}}} full" rel="{{{columnName}}}_box">
		<div localize>{{{label}}} {{#isRequired}}<label class="required">*</label>{{/isRequired}}</div>
		<div><textarea rel="{{{columnName}}}" autocomplete="off" {{#isRequired}}required{{/isRequired}} {{^isEditable}}disabled{{/isEditable}}></textarea></div>
		<div class="error text-align-center hidden" rel="{{{columnName}}}_error"></div>
	</div>
	{{/isTextArea}}
	{{#isEnumCheckBox}}
	<div class="abstract_input_box input_per_line_{{{inputPerLine}}}" rel="{{{columnName}}}_box">
		<div localize>{{{label}}} {{#isRequired}}<label class="required">*</label>{{/isRequired}}</div>
		<div><input type="checkbox" rel="{{{columnName}}}" autocomplete="off" {{#isRequired}}required{{/isRequired}} {{^isEditable}}disabled{{/isEditable}}></div>
		<div class="error text-align-center hidden" rel="{{{columnName}}}_error"></div>
	</div>
	{{/isEnumCheckBox}}
	{{#isCheckBox}}
	<div class="abstract_input_box input_per_line_{{{inputPerLine}}}" rel="{{{columnName}}}_box">
		<div localize>{{{label}}} {{#isRequired}}<label class="required">*</label>{{/isRequired}}</div>
		{{#option}}
		<div class="abstract_checkbox">
			<input type="checkbox" rel="{{{columnName}}}_{{{value}}}" value="{{{value}}}" autocomplete="off" {{#isRequired}}required{{/isRequired}} {{^isEditable}}disabled{{/isEditable}}>
			<label rel="{{{columnName}}}_{{{value}}}Label" localize>{{{label}}}</label>
		</div>
		{{/option}}
		<div class="error text-align-center hidden" rel="{{{columnName}}}_error"></div>
	</div>
	{{/isCheckBox}}
	{{#isEnable}}
	<div class="abstract_input_box input_per_line_{{{inputPerLine}}}" rel="{{{columnName}}}_box">
		<div rel="{{{columnName}}}_blankSpace" style="height: calc(1em + 7.5px);"></div>
		<div class="abstract_form_input_check_box">
			<input type="checkbox" rel="{{{columnName}}}" autocomplete="off" {{#isRequired}}required{{/isRequired}} {{^isEditable}}disabled{{/isEditable}}>
			<label rel="{{{columnName}}}Label" localize>{{{label}}}</label>
		</div>
		<div class="error text-align-center hidden" rel="{{{columnName}}}_error"></div>
	</div>
	{{/isEnable}}
	{{#isFile}}
	<div class="abstract_input_box input_per_line_{{{inputPerLine}}}" rel="{{{columnName}}}_box">
		<div localize>{{{label}}} {{#isRequired}}<label class="required">*</label>{{/isRequired}}</div>
		<div><input type="file" rel="{{{columnName}}}" autocomplete="off" accept="{{accept}}" {{#isRequired}}required{{/isRequired}} {{^isEditable}}disabled{{/isEditable}}></div>
		<div class="error text-align-center hidden" rel="{{{columnName}}}_error"></div>
	</div>
	{{/isFile}}
	{{#isImage}}
	<div class="abstract_input_box input_per_line_{{{inputPerLine}}}" rel="{{{columnName}}}_box">
		<div localize>{{{label}}}</div>
		<div class="flex gap-5px">
			<div class="width-100-percent hidden">
				<input type="file" rel="{{{columnName}}}" autocomplete="off" accept="image/*" {{#isRequired}}required{{/isRequired}} {{^isEditable}}disabled{{/isEditable}}>
			</div>
			<div class="width-100-percent" style="max-width:calc(100% - 73px);">
				<div class="abstract_input_file" rel="{{{columnName}}}_file">
					<div class="fileName" rel="{{{columnName}}}_fileName">No File Chosen</div>
					<div class="button">Choose Files</div>
				</div>
			</div>
			<div class="abstract_input_svg_icon disabled {{{cssClass}}}" rel="{{{columnName}}}_preview">
				<svg style="width:24px;height:24px" viewBox="0 0 24 24">
					<path fill="currentColor" d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z" />
				</svg>
			</div>
			<div class="abstract_input_svg_icon {{{cssClass}}}" style="background:red;" rel="{{{columnName}}}_delete">
				<svg style="width:24px;height:24px" viewBox="0 0 24 24">
					<path fill="currentColor" d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
				</svg>
			</div>
		</div>
		<div class="abstract_dialog hidden" rel="{{{columnName}}}_cropper">
			<div class="hidden" rel="{{{columnName}}}_canvas"></div>
			<div class="abstract_image_previewer {{size}}">
				<div class="flex-column gap-20px width-100-percent">
					<div class="abstract_dialog_topic">Image Cropper</div>
					<div class="width-100-percent" style="max-height:calc(100% - 200px) !important;">
						<img rel="{{{columnName}}}_image">
					</div>
					<div class="flex gap-5px flex-end">
						<div class="abstract_button submit_button" rel="{{{columnName}}}_confirm" localize>Confirm</div>
						<div class="abstract_button cancel_button" rel="{{{columnName}}}_cancel" localize>Cancel</div>
					</div>
				</div>
			</div>
		</div>
		<div class="abstract_dialog hidden" rel="{{{columnName}}}_previewer">
			<div class="hidden" rel="{{{columnName}}}_canvas"></div>
			<div class="abstract_image_previewer {{size}}">
				<div class="flex-column gap-20px width-100-percent">
					<div class="abstract_dialog_topic">Previewer</div>
					<div class="width-100-percent" style="max-height:calc(100% - 200px) !important;" rel="{{{columnName}}}_original">
						<img rel="{{{columnName}}}_originalImage" src="{{{url}}}">
					</div>
					<div class="width-100-percent hidden" style="max-height:calc(100% - 200px) !important;" rel="{{{columnName}}}_cropped">
						<img rel="{{{columnName}}}_croppedImage" src="{{{url}}}cropped">
					</div>
					<div class="flex gap-5px space-between">
						<div class="flex gap-5px">
							<div class="abstract_button submit_button" rel="{{{columnName}}}_originalButton" localize>Original</div>
							<div class="abstract_button submit_button disabled" rel="{{{columnName}}}_croppedButton" localize>Cropped</div>
						</div>
						<div class="abstract_button cancel_button" rel="{{{columnName}}}_previwerCancel" localize>Cancel</div>
					</div>
				</div>
			</div>
		</div>
	</div>
	{{/isImage}}
	{{#isFileMatrix}}
	<div class="abstract_input_box input_per_line_1" rel="{{{columnName}}}_box">
		<div localize>{{{label}}} {{#isRequired}}<label class="required">*</label>{{/isRequired}}</div>
		<div>
			<table class="abstract_form_table">
				<thead>
					<tr>
						<th localize>file</th>
						<th style="width:10%;padding:5px;">
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
		</div>
	</div>
	{{/isFileMatrix}}
	{{#isTimeSpan}}
	<div class="abstract_input_box input_per_line_{{{inputPerLine}}}" rel="{{{columnName}}}_box">
		<div localize>{{{label}}} {{#isRequired}}<label class="required">*</label>{{/isRequired}}</div>
		<div class="flex gap-5px">
			<div class="width-100-percent"><input type="number" timespan="{{{columnName}}}" min="0" rel="{{{columnName}}}_hour" placeholder="hour" autocomplete="off" {{#isRequired}}required{{/isRequired}} {{^isEditable}}disabled{{/isEditable}}></div>
			<div class="width-100-percent"><input type="number" timespan="{{{columnName}}}" min="0" max="59" rel="{{{columnName}}}_minute" placeholder="minute" autocomplete="off" {{#isRequired}}required{{/isRequired}} {{^isEditable}}disabled{{/isEditable}}></div>
			<div class="width-100-percent"><input type="number" timespan="{{{columnName}}}" min="0" max="59" rel="{{{columnName}}}_second" placeholder="second" autocomplete="off" {{#isRequired}}required{{/isRequired}} {{^isEditable}}disabled{{/isEditable}}></div>
		</div>
		<div class="error text-align-center hidden" rel="{{{columnName}}}_error"></div>
	</div>
	{{/isTimeSpan}}
	{{#isAutoComplete}}
	<div class="abstract_input_box input_per_line_{{{inputPerLine}}}" rel="{{{columnName}}}_box">
		<div localize>{{{label}}} {{#isRequired}}<label class="required">*</label>{{/isRequired}}</div>
		<div class="flex gap-5px">
			<div class="width-100-percent">
				<input type="text" rel="{{{columnName}}}" autocomplete="off" {{#isRequired}}required{{/isRequired}} {{^isEditable}}disabled{{/isEditable}}>
			</div>
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
		<div class="flex gap-5px" style="flex-wrap: wrap;" rel="{{{columnName}}}_container"></div>
		<div class="error text-align-center hidden" rel="{{{columnName}}}_error"></div>
		{{#hasTag}}
		<div class="flex-wrap gap-5px" rel="{{{columnName}}}_tag"></div>
		{{/hasTag}}
	</div>
	{{/isAutoComplete}}
	{{#isColor}}
	<div class="abstract_input_box input_per_line_{{{inputPerLine}}}" rel="{{{columnName}}}_box">
		<div localize>{{{label}}} {{#isRequired}}<label class="required">*</label>{{/isRequired}}</div>
		<div><input type="color" rel="{{{columnName}}}" autocomplete="off" {{#isRequired}}required{{/isRequired}} {{^isEditable}}disabled{{/isEditable}}></div>
		<div class="error text-align-center hidden" rel="{{{columnName}}}_error"></div>
	</div>
	{{/isColor}}
	{{#isHidden}}
	<input type="hidden" class="hidden" rel="{{{columnName}}}" value="{{{value}}}" {{^isEditable}}disabled{{/isEditable}}/>
	{{/isHidden}}
	{{#isRichText}}
	<div class="abstract_input_box input_per_line_{{{inputPerLine}}} full" rel="{{{columnName}}}_box">
		<div localize>{{{label}}} {{#isRequired}}<label class="required">*</label>{{/isRequired}}</div>
		<div><div style="height:120px;" rel="{{{columnName}}}" {{#isRequired}}required{{/isRequired}}></div></div>
		<div class="error text-align-center hidden" rel="{{{columnName}}}_error"></div>
	</div>
	{{/isRichText}}
{{/isLabel}}