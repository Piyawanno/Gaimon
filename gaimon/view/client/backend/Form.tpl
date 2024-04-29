<div class="abstract_form_container">
	<div class="abstract_step_container  cd-breadcrumb triangle hidden" rel="step"></div>
	<div class="abstract_menu_container tab_view hidden" rel="tab">
		<div class="flex-wrap" rel="tabMenuList"></div>
		<div rel="buttonTabList"></div>
	</div>
	<div class="abstract_form" rel="form_container">
		<div class="flex space-between" rel="titleContainer">
			<div class="form_header" {{^isSpace}}style="gap:0px"{{/isSpace}}>
				{{#prefixTitle}}<div rel="prefixTitle" localize>{{prefixTitle}}</div>{{/prefixTitle}}
				<div rel="title" localize>{{{title}}}</div>
			</div>
			<div class="hidden" rel="switch">
				<div class="advanceSwitch button b2">
					<input type="checkbox" class="checkbox" rel="isAdvance">
					<div class="knobs">
						<span></span>
					</div>
					<div class="layer"></div>
				</div>
			</div>
			<div class="flex space-between gap-5px">
				<div class="flex flex-column-responsive gap-5px" style="height: 30px;" rel="operationContainer"></div>
			</div>
		</div>
		<div class="abstract_menu_container hidden" rel="menu">
			<div class="flex-wrap" rel="menuList"></div>
			<div rel="buttonList"></div>
		</div>
		<div class="abstract_form_input" rel="form">
		{{#input}}
			{{^isLabel}}			
				{{#isText}}
				<div class="abstract_input_box {{{size}}}" rel="{{{columnName}}}_box">
					<div localize>{{{label}}}</div>
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
				</div>
				{{/isText}}
				{{#isNumber}}
				<div class="abstract_input_box {{{size}}}" rel="{{{columnName}}}_box">
					<div localize>{{{label}}}</div>
					<div class="flex gap-5px">
						<div class="width-100-percent">
							<input type="number" rel="{{{columnName}}}" autocomplete="off" 
								isNegative="{{{isNegative}}}" 
								isZeroIncluded="{{{isZeroIncluded}}}"
								isFloatingPoint="{{{isFloatingPoint}}}"
								{{#isRequired}}required{{/isRequired}}
								{{^isEditable}}disabled{{/isEditable}}>
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
				</div>
				{{/isNumber}}
				{{#isPassword}}
				<div class="abstract_input_box {{{size}}}" rel="{{{columnName}}}_box">
					<div localize>{{{label}}}</div>
					<div><input type="password" rel="{{{columnName}}}" autocomplete="off" {{^hasEdit}}{{#isRequired}}required{{/isRequired}}{{/hasEdit}}></div>
				</div>
				<div class="abstract_input_box {{{size}}}" rel="{{{columnName}}}_box">
					<div localize>Confirm {{{label}}}</div>
					<div><input type="password" rel="confirm_{{{columnName}}}" autocomplete="off" {{^hasEdit}}{{#isRequired}}required{{/isRequired}}{{/hasEdit}}></div>
				</div>
				{{/isPassword}}
				{{#isEmail}}
				<div class="abstract_input_box {{{size}}}" rel="{{{columnName}}}_box">
					<div localize>{{{label}}}</div>
					<div><input type="email" rel="{{{columnName}}}" autocomplete="off" {{#isRequired}}required{{/isRequired}}></div>
				</div>
				{{/isEmail}}
				{{#isEnumSelect}}
				<div class="abstract_input_box {{{size}}}" rel="{{{columnName}}}_box">
					<div localize>{{{label}}}</div>
					<div>
						<select rel="{{{columnName}}}" {{#isRequired}}required{{/isRequired}} localize>
							<option value="-1" localize>None</option>
							{{#option}}
							<option value="{{{value}}}" localize>{{{label}}}</option>
							{{/option}}
						</select>
					</div>
				</div>
				{{/isEnumSelect}}
				{{#isReferenceSelect}}
				<div class="abstract_input_box {{{size}}}" rel="{{{columnName}}}_box">
					<div localize>{{{label}}}</div>
					<div>
						<select rel="{{{columnName}}}" {{#isRequired}}required{{/isRequired}} localize>
							<option value="-1" localize>None</option>
							{{#option}}
							<option value="{{{value}}}" localize>{{{label}}}</option>
							{{/option}}
						</select>
					</div>
				</div>
				{{/isReferenceSelect}}
				{{#isSelect}}
				<div class="abstract_input_box {{{size}}}" rel="{{{columnName}}}_box">
					<div localize>{{{label}}}</div>
					<div>
						<select rel="{{{columnName}}}" {{#isRequired}}required{{/isRequired}} localize>
							<option rel="defaultValue_{{{columnName}}}" value="-1">None</option>
							{{#option}}
							<option value="{{{value}}}" localize>{{{label}}}</option>
							{{/option}}
						</select>
					</div>
				</div>
				{{/isSelect}}
				{{#isPrerequisiteReferenceSelect}}
				<div class="abstract_input_box {{{size}}}" rel="{{{columnName}}}_box">
					<div localize>{{{label}}}</div>
					<div>
						<select rel="{{{columnName}}}" {{#isRequired}}required{{/isRequired}}>
							<option value="-1" localize>None</option>
						</select>
					</div>
				</div>
				{{/isPrerequisiteReferenceSelect}}
				{{#isDateTime}}
				<div class="abstract_input_box {{{size}}}" rel="{{{columnName}}}_box">
					<div localize>{{{label}}}</div>
					<div><input type="datetime-local" rel="{{{columnName}}}" autocomplete="off" {{#isRequired}}required{{/isRequired}}></div>
				</div>
				{{/isDateTime}}
				{{#isTime}}
				<div class="abstract_input_box {{{size}}}" rel="{{{columnName}}}_box">
					<div localize>{{{label}}}</div>
					<div><input type="time" rel="{{{columnName}}}" autocomplete="off" {{#isRequired}}required{{/isRequired}}></div>
				</div>
				{{/isTime}}
				{{#isDate}}
				<div class="abstract_input_box {{{size}}}" rel="{{{columnName}}}_box">
					<div localize>{{{label}}}</div>
					<div><input type="date" rel="{{{columnName}}}" autocomplete="off" {{#isRequired}}required{{/isRequired}}></div>
				</div>
				{{/isDate}}
				{{#isTextArea}}
				<div class="abstract_input_box full" rel="{{{columnName}}}_box">
					<div localize>{{{label}}}</div>
					<div><textarea rel="{{{columnName}}}" autocomplete="off" {{#isRequired}}required{{/isRequired}}></textarea></div>
				</div>
				{{/isTextArea}}
				{{#isEnumCheckBox}}
				<div class="abstract_input_box {{{size}}}" rel="{{{columnName}}}_box">
					<div localize>{{{label}}}</div>
					<div><input type="checkbox" rel="{{{columnName}}}" autocomplete="off" {{#isRequired}}required{{/isRequired}}></div>
				</div>
				{{/isEnumCheckBox}}
				{{#isEnable}}
				<div class="abstract_input_box {{{size}}}" rel="{{{columnName}}}_box">
					<div style="height: calc(1em + 7.5px);"></div>
					<div class="abstract_form_input_check_box">
						<input type="checkbox" rel="{{{columnName}}}" autocomplete="off" {{#isRequired}}required{{/isRequired}}>
						<label rel="{{{columnName}}}Label" localize>{{{label}}}</label>
					</div>
				</div>
				{{/isEnable}}
				{{#isFile}}
				<div class="abstract_input_box {{{size}}}" rel="{{{columnName}}}_box">
					<div localize>{{{label}}}</div>
					<div><input type="file" rel="{{{columnName}}}" autocomplete="off" {{#isRequired}}required{{/isRequired}}></div>
				</div>
				{{/isFile}}
				{{#isImage}}
					<div class="abstract_input_box {{{size}}}" rel="{{{columnName}}}_box">
						<div localize>{{{label}}}</div>
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
						</div>
						<div class="abstract_image_previewer hidden" rel="{{{columnName}}}_previewer">
							<div><img rel="{{{columnName}}}_image"></div>
							<div>
								<div rel="{{{columnName}}}_confirm">Confirm</div>
								<div rel="{{{columnName}}}_cancel">Cancel</div>
							</div>
						</div>
					</div>
				{{/isImage}}
				{{#isTimeSpan}}
				<div class="abstract_input_box {{{size}}}" rel="{{{columnName}}}_box">
					<div localize>{{{label}}}</div>
					<div class="flex gap-5px">
						<div class="width-100-percent"><input type="number" timespan="{{{columnName}}}" min="0" rel="{{{columnName}}}_hour" placeholder="hour" autocomplete="off" {{#isRequired}}required{{/isRequired}}></div>
						<div class="width-100-percent"><input type="number" timespan="{{{columnName}}}" min="0" max="59" rel="{{{columnName}}}_minute" placeholder="minute" autocomplete="off" {{#isRequired}}required{{/isRequired}}></div>
						<div class="width-100-percent"><input type="number" timespan="{{{columnName}}}" min="0" max="59" rel="{{{columnName}}}_second" placeholder="second" autocomplete="off" {{#isRequired}}required{{/isRequired}}></div>
					</div>
				</div>
				{{/isTimeSpan}}
				{{#isAutoComplete}}
				<div class="abstract_input_box {{{size}}}" rel="{{{columnName}}}_box">
					<div localize>{{{label}}}</div>
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
				</div>
				{{/isAutoComplete}}
				{{#isHidden}}
				<input type="hidden" class="hidden" rel="{{{columnName}}}" value="{{{value}}}" />
				{{/isHidden}}
				{{#hasTag}}
				<div class="flex-wrap gap-5px" rel="{{{columnName}}}_tag"></div>
				{{/hasTag}}
			{{/isLabel}}
		{{/input}}
		</div>
		<div class="abstract_form_input" rel="additionalForm"></div>
		<div class="flex gap-5px flex-end" rel="operation">
			<div class="abstract_button submit_button" rel="submit" localize>Submit</div>
			<div class="abstract_button edit_form_button" rel="edit" localize>Edit</div>
			<div class="abstract_button cancel_button" rel="cancel" localize>Cancel</div>
		</div>
	</div>
</div>