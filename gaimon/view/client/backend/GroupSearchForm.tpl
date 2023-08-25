<div class="abstract_search_container">
	<div class="abstract_search">
		<div class="form_header" localize>Filter</div>
		<div class="abstract_search_input" rel="filter_container">
			{{#input}}
			<div class="abstract_group_form">
				<div class="abstract_group_form_label" localize>{{label}}</div>
				<div class="abstract_form_input abstract_group">
					{{#inputs}}
						{{^isLabel}}			
							{{#isText}}
							<div class="abstract_input_box input_per_line_{{{inputPerLine}}}" rel="{{{columnName}}}_box">
								<div localize>{{{label}}}</div>
								<div class="flex gap-5px">
									<div class="width-100-percent"><input type="text" rel="{{{columnName}}}" autocomplete="off" {{^isSearch}}{{#isRequired}}required{{/isRequired}}{{/isSearch}}></div>
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
							<div class="abstract_input_box input_per_line_{{{inputPerLine}}}" rel="{{{columnName}}}_box">
								<div localize>{{{label}}}</div>
								<div class="flex gap-5px">
									<div class="width-100-percent">
										<input type="number" rel="{{{columnName}}}" autocomplete="off" 
											isNegative="{{{isNegative}}}" 
											isZeroIncluded="{{{isZeroIncluded}}}"
											isFloatingPoint="{{{isFloatingPoint}}}"
											{{^isSearch}}{{#isRequired}}required{{/isRequired}}{{/isSearch}}>
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
							<div class="abstract_input_box input_per_line_{{{inputPerLine}}}" rel="{{{columnName}}}_box">
								<div localize>{{{label}}}</div>
								<div><input type="password" rel="{{{columnName}}}" autocomplete="off" {{^hasEdit}}{{^isSearch}}{{#isRequired}}required{{/isRequired}}{{/isSearch}}{{/hasEdit}}></div>
							</div>
							<div class="abstract_input_box input_per_line_{{{inputPerLine}}}" rel="{{{columnName}}}_box">
								<div localize>Confirm {{{label}}}</div>
								<div><input type="password" rel="confirm_{{{columnName}}}" autocomplete="off" {{^hasEdit}}{{^isSearch}}{{#isRequired}}required{{/isRequired}}{{/isSearch}}{{/hasEdit}}></div>
							</div>
							{{/isPassword}}
							{{#isEmail}}
							<div class="abstract_input_box input_per_line_{{{inputPerLine}}}" rel="{{{columnName}}}_box">
								<div localize>{{{label}}}</div>
								<div><input type="email" rel="{{{columnName}}}" autocomplete="off" {{^isSearch}}{{#isRequired}}required{{/isRequired}}{{/isSearch}}></div>
							</div>
							{{/isEmail}}
							{{#isEnumSelect}}
							<div class="abstract_input_box input_per_line_{{{inputPerLine}}}" rel="{{{columnName}}}_box">
								<div localize>{{{label}}}</div>
								<div>
									<select rel="{{{columnName}}}" {{^isSearch}}{{#isRequired}}required{{/isRequired}}{{/isSearch}}>
										<option value="-1" localize>All</option>
										{{#option}}
										<option value="{{{value}}}" localize>{{{label}}}</option>
										{{/option}}
									</select>
								</div>
							</div>
							{{/isEnumSelect}}
							{{#isReferenceSelect}}
							<div class="abstract_input_box input_per_line_{{{inputPerLine}}}" rel="{{{columnName}}}_box">
								<div localize>{{{label}}}</div>
								<div>
									<select rel="{{{columnName}}}" {{^isSearch}}{{#isRequired}}required{{/isRequired}}{{/isSearch}}>
										<option value="-1" localize>All</option>
										{{#option}}
										<option value="{{{value}}}" localize>{{{label}}}</option>
										{{/option}}
									</select>
								</div>
							</div>
							{{/isReferenceSelect}}
							{{#isPrerequisiteReferenceSelect}}
							<div class="abstract_input_box input_per_line_{{{inputPerLine}}}" rel="{{{columnName}}}_box">
								<div localize>{{{label}}}</div>
								<div>
									<select rel="{{{columnName}}}" {{^isSearch}}{{#isRequired}}required{{/isRequired}}{{/isSearch}}>
										<option value="-1" localize>All</option>
									</select>
								</div>
							</div>
							{{/isPrerequisiteReferenceSelect}}
							{{#isDateTime}}
							<div class="abstract_input_box input_per_line_{{{inputPerLine}}}" rel="{{{columnName}}}_box">
								<div localize>{{{label}}}</div>
								<div><input type="datetime-local" rel="{{{columnName}}}" autocomplete="off" {{^isSearch}}{{#isRequired}}required{{/isRequired}}{{/isSearch}}></div>
							</div>
							{{/isDateTime}}
							{{#isTime}}
							<div class="abstract_input_box input_per_line_{{{inputPerLine}}}" rel="{{{columnName}}}_box">
								<div localize>{{{label}}}</div>
								<div><input type="time" rel="{{{columnName}}}" autocomplete="off" {{^isSearch}}{{#isRequired}}required{{/isRequired}}{{/isSearch}}></div>
							</div>
							{{/isTime}}
							{{#isDate}}
							<div class="abstract_input_box input_per_line_{{{inputPerLine}}}" rel="{{{columnName}}}_box">
								<div localize>{{{label}}}</div>
								<div><input type="date" rel="{{{columnName}}}" autocomplete="off" {{^isSearch}}{{#isRequired}}required{{/isRequired}}{{/isSearch}}></div>
							</div>
							{{/isDate}}
							{{#isTextArea}}
							<div class="abstract_input_box input_per_line_{{{inputPerLine}}} full" rel="{{{columnName}}}_box">
								<div localize>{{{label}}}</div>
								<div><textarea rel="{{{columnName}}}" autocomplete="off" {{^isSearch}}{{#isRequired}}required{{/isRequired}}{{/isSearch}}></textarea></div>
							</div>
							{{/isTextArea}}
							{{#isEnumCheckBox}}
							<div class="abstract_input_box input_per_line_{{{inputPerLine}}}" rel="{{{columnName}}}_box">
								<div localize>{{{label}}}</div>
								<div><input type="checkbox" rel="{{{columnName}}}" autocomplete="off" {{^isSearch}}{{#isRequired}}required{{/isRequired}}{{/isSearch}}></div>
							</div>
							{{/isEnumCheckBox}}
							{{#isEnable}}
							<div class="abstract_input_box input_per_line_{{{inputPerLine}}}" rel="{{{columnName}}}_box">
								<div style="height: calc(1em + 7.5px);"></div>
								<div class="abstract_form_input_check_box">
									<input type="checkbox" rel="{{{columnName}}}" autocomplete="off" {{^isSearch}}{{#isRequired}}required{{/isRequired}}{{/isSearch}}>
									<label rel="{{{columnName}}}Label">{{{label}}}</label>
								</div>
							</div>
							{{/isEnable}}
							{{#isFile}}
							<div class="abstract_input_box input_per_line_{{{inputPerLine}}}" rel="{{{columnName}}}_box">
								<div localize>{{{label}}}</div>
								<div><input type="file" rel="{{{columnName}}}" autocomplete="off" {{^isSearch}}{{#isRequired}}required{{/isRequired}}{{/isSearch}}></div>
							</div>
							{{/isFile}}
							{{#isImage}}
							<div class="abstract_input_box input_per_line_{{{inputPerLine}}}" rel="{{{columnName}}}_box">
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
								<div class="abstract_image_previewer hidden" rel="{{{columnName}}}_previewer"></div>
							</div>
							{{/isImage}}
							{{#isTimeSpan}}
							<div class="abstract_input_box input_per_line_{{{inputPerLine}}}" rel="{{{columnName}}}_box">
								<div localize>{{{label}}}</div>
								<div class="flex gap-5px">
									<div class="width-100-percent"><input type="number" timespan="{{{columnName}}}" min="0" rel="{{{columnName}}}_hour" placeholder="hour" autocomplete="off" {{^isSearch}}{{#isRequired}}required{{/isRequired}}{{/isSearch}}></div>
									<div class="width-100-percent"><input type="number" timespan="{{{columnName}}}" min="0" max="59" rel="{{{columnName}}}_minute" placeholder="minute" autocomplete="off" {{^isSearch}}{{#isRequired}}required{{/isRequired}}{{/isSearch}}></div>
									<div class="width-100-percent"><input type="number" timespan="{{{columnName}}}" min="0" max="59" rel="{{{columnName}}}_second" placeholder="second" autocomplete="off" {{^isSearch}}{{#isRequired}}required{{/isRequired}}{{/isSearch}}></div>
								</div>
							</div>
							{{/isTimeSpan}}
							{{#isAutoComplete}}
							<div class="abstract_input_box input_per_line_{{{inputPerLine}}}" rel="{{{columnName}}}_box">
								<div localize>{{{label}}}</div>
								<div class="flex gap-5px">
									<div class="width-100-percent"><input type="text" rel="{{{columnName}}}" autocomplete="off" {{^isSearch}}{{#isRequired}}required{{/isRequired}}{{/isSearch}}></div>
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
							{{#hasTag}}
							<div class="flex-wrap gap-5px" rel="{{{columnName}}}_tag"></div>
							{{/hasTag}}
						{{/isLabel}}
					{{/inputs}}
				</div>
			</div>
			{{/input}}
		</div>
        <div class="flex gap-5px flex-end">
			<div class="abstract_button submit_button" rel="submit" localize>Submit</div>
			<div class="abstract_button cancel_button" rel="cancel" localize>Clear</div>
		</div>
	</div>
</div>