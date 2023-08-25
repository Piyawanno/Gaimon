<div class="abstract_form_container">
	<div class="abstract_form">
		<div class="form_header" rel="title" localize>{{{title}}}</div>
		<div class="abstract_form_input" rel="form">
			{{#input}}
			<div class="abstract_group_form">
				<div class="abstract_group_form_label" localize>{{label}}</div>
				<div class="abstract_form_input abstract_group">
					{{#input}}
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
								<div class="error text-align-center hidden" rel="{{{columnName}}}_error"></div>
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
								<div class="error text-align-center hidden" rel="{{{columnName}}}_error"></div>
							</div>
							{{/isNumber}}
							{{#isPassword}}
							<div class="abstract_input_box input_per_line_{{{inputPerLine}}}" rel="{{{columnName}}}_box">
								<div localize>{{{label}}}</div>
								<div><input type="password" rel="{{{columnName}}}" autocomplete="off" {{^hasEdit}}{{^isSearch}}{{#isRequired}}required{{/isRequired}}{{/isSearch}}{{/hasEdit}}></div>
								<div class="error text-align-center hidden" rel="{{{columnName}}}_error"></div>
							</div>
							<div class="abstract_input_box input_per_line_{{{inputPerLine}}}" rel="{{{columnName}}}_box">
								<div localize>Confirm {{{label}}}</div>
								<div><input type="password" rel="confirm_{{{columnName}}}" autocomplete="off" {{^hasEdit}}{{^isSearch}}{{#isRequired}}required{{/isRequired}}{{/isSearch}}{{/hasEdit}}></div>
								<div class="error text-align-center hidden" rel="confirm_{{{columnName}}}_error"></div>
							</div>
							{{/isPassword}}
							{{#isEmail}}
							<div class="abstract_input_box input_per_line_{{{inputPerLine}}}" rel="{{{columnName}}}_box">
								<div localize>{{{label}}}</div>
								<div><input type="email" rel="{{{columnName}}}" autocomplete="off" {{^isSearch}}{{#isRequired}}required{{/isRequired}}{{/isSearch}}></div>
								<div class="error text-align-center hidden" rel="{{{columnName}}}_error"></div>
							</div>
							{{/isEmail}}
							{{#isEnumSelect}}
							<div class="abstract_input_box input_per_line_{{{inputPerLine}}}" rel="{{{columnName}}}_box">
								<div localize>{{{label}}}</div>
								<div>
									<select rel="{{{columnName}}}" {{^isSearch}}{{#isRequired}}required{{/isRequired}}{{/isSearch}} localize>
										<option value="-1" localize>None</option>
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
								<div localize>{{{label}}}</div>
								<div>
									<select rel="{{{columnName}}}" {{^isSearch}}{{#isRequired}}required{{/isRequired}}{{/isSearch}} localize>
										<option value="-1" localize>None</option>
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
								<div localize>{{{label}}}</div>
								<div>
									<select rel="{{{columnName}}}" {{#isRequired}}required{{/isRequired}} localize>
										<option rel="defaultValue_{{{columnName}}}" value="-1" localize>None</option>
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
								<div localize>{{{label}}}</div>
								<div>
									<select rel="{{{columnName}}}" {{^isSearch}}{{#isRequired}}required{{/isRequired}}{{/isSearch}} localize>
										<option value="-1" localize>None</option>
									</select>
								</div>
								<div class="error text-align-center hidden" rel="{{{columnName}}}_error"></div>
							</div>
							{{/isPrerequisiteReferenceSelect}}
							{{#isDateTime}}
							<div class="abstract_input_box input_per_line_{{{inputPerLine}}}" rel="{{{columnName}}}_box">
								<div localize>{{{label}}}</div>
								<div><input type="datetime-local" rel="{{{columnName}}}" autocomplete="off" {{^isSearch}}{{#isRequired}}required{{/isRequired}}{{/isSearch}}></div>
								<div class="error text-align-center hidden" rel="{{{columnName}}}_error"></div>
							</div>
							{{/isDateTime}}
							{{#isTime}}
							<div class="abstract_input_box input_per_line_{{{inputPerLine}}}" rel="{{{columnName}}}_box">
								<div localize>{{{label}}}</div>
								<div><input type="time" rel="{{{columnName}}}" autocomplete="off" {{^isSearch}}{{#isRequired}}required{{/isRequired}}{{/isSearch}}></div>
								<div class="error text-align-center hidden" rel="{{{columnName}}}_error"></div>
							</div>
							{{/isTime}}
							{{#isDate}}
							<div class="abstract_input_box input_per_line_{{{inputPerLine}}}" rel="{{{columnName}}}_box">
								<div localize>{{{label}}}</div>
								<div><input type="date" rel="{{{columnName}}}" autocomplete="off" {{^isSearch}}{{#isRequired}}required{{/isRequired}}{{/isSearch}}></div>
								<div class="error text-align-center hidden" rel="{{{columnName}}}_error"></div>
							</div>
							{{/isDate}}
							{{#isTextArea}}
							<div class="abstract_input_box input_per_line_{{{inputPerLine}}} full" rel="{{{columnName}}}_box">
								<div localize>{{{label}}}</div>
								<div><textarea rel="{{{columnName}}}" autocomplete="off" {{^isSearch}}{{#isRequired}}required{{/isRequired}}{{/isSearch}}></textarea></div>
								<div class="error text-align-center hidden" rel="{{{columnName}}}_error"></div>
							</div>
							{{/isTextArea}}
							{{#isEnumCheckBox}}
							<div class="abstract_input_box input_per_line_{{{inputPerLine}}}" rel="{{{columnName}}}_box">
								<div localize>{{{label}}}</div>
								<div><input type="checkbox" rel="{{{columnName}}}" autocomplete="off" {{^isSearch}}{{#isRequired}}required{{/isRequired}}{{/isSearch}}></div>
								<div class="error text-align-center hidden" rel="{{{columnName}}}_error" localize></div>
							</div>
							{{/isEnumCheckBox}}
							{{#isCheckBox}}
							<div class="abstract_input_box input_per_line_{{{inputPerLine}}}" rel="{{{columnName}}}_box">
								<div localize>{{{label}}}</div>
								{{#option}}
								<div class="abstract_checkbox">
									<input type="checkbox" rel="{{{columnName}}}_{{{value}}}" value="{{{value}}}" autocomplete="off" {{#isRequired}}required{{/isRequired}}>
									<label rel="{{{columnName}}}_{{{value}}}Label" localize>{{{label}}}</label>
								</div>
								{{/option}}
								<div class="error text-align-center hidden" rel="{{{columnName}}}_error" localize></div>
							</div>
							{{/isCheckBox}}
							{{#isEnable}}
							<div class="abstract_input_box input_per_line_{{{inputPerLine}}}" rel="{{{columnName}}}_box">
								<div style="height: calc(1em + 7.5px);"></div>
								<div class="abstract_form_input_check_box">
									<input type="checkbox" rel="{{{columnName}}}" autocomplete="off" {{^isSearch}}{{#isRequired}}required{{/isRequired}}{{/isSearch}}>
									<label rel="{{{columnName}}}Label" localize>{{{label}}}</label>
								</div>
								<div class="error text-align-center hidden" rel="{{{columnName}}}_error"></div>
							</div>
							{{/isEnable}}
							{{#isFile}}
							<div class="abstract_input_box input_per_line_{{{inputPerLine}}}" rel="{{{columnName}}}_box">
								<div localize>{{{label}}}</div>
								<div><input type="file" rel="{{{columnName}}}" autocomplete="off" {{^isSearch}}{{#isRequired}}required{{/isRequired}}{{/isSearch}}></div>
								<div class="error text-align-center hidden" rel="{{{columnName}}}_error"></div>
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
								<div class="abstract_image_previewer hidden" rel="{{{columnName}}}_previewer">
									<div><img rel="{{{columnName}}}_image"></div>
									<div>
										<div rel="{{{columnName}}}_confirm">Confirm</div>
										<div rel="{{{columnName}}}_cancel">Cancel</div>
									</div>
								</div>
							</div>
							{{/isImage}}
							{{#isFileMatrix}}
							<div class="abstract_input_box input_per_line_1" rel="{{{columnName}}}_box">
								<div localize>{{{label}}}</div>
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
								<div localize>{{{label}}}</div>
								<div class="flex gap-5px">
									<div class="width-100-percent"><input type="number" timespan="{{{columnName}}}" min="0" rel="{{{columnName}}}_hour" placeholder="hour" autocomplete="off" {{^isSearch}}{{#isRequired}}required{{/isRequired}}{{/isSearch}}></div>
									<div class="width-100-percent"><input type="number" timespan="{{{columnName}}}" min="0" max="59" rel="{{{columnName}}}_minute" placeholder="minute" autocomplete="off" {{^isSearch}}{{#isRequired}}required{{/isRequired}}{{/isSearch}}></div>
									<div class="width-100-percent"><input type="number" timespan="{{{columnName}}}" min="0" max="59" rel="{{{columnName}}}_second" placeholder="second" autocomplete="off" {{^isSearch}}{{#isRequired}}required{{/isRequired}}{{/isSearch}}></div>
								</div>
								<div class="error text-align-center hidden" rel="{{{columnName}}}_error"></div>
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
								<div class="error text-align-center hidden" rel="{{{columnName}}}_error"></div>
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
			</div>
			{{/input}}
		</div>
		<div class="abstract_form_input" rel="additionalForm"></div>
		<div class="flex gap-5px flex-end" rel="operation">
			<div class="abstract_button submit_button" rel="submit" localize>Submit</div>
			<div class="abstract_button cancel_button" rel="cancel" localize>Cancel</div>
		</div>
	</div>
</div>