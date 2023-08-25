<div class="abstract_search_container">
	<div class="abstract_search">
		<div class="form_header" localize>Filter</div>
		<div class="abstract_search_input" rel="filter_container">
		{{#input}}
			{{#isSearch}}
			<div class="abstract_search_input_box {{{size}}}">
				<div localize>{{{label}}}</div>
				{{#isText}}
				<div class="flex gap-5px">
					<div class="width-100-percent"><input type="text" rel="{{{columnName}}}" autocomplete="off"></div>
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
				{{/isText}}
				{{#isNumber}}
				<div><input type="number" rel="{{{columnName}}}" autocomplete="off"></div>
				{{/isNumber}}
				{{#isPassword}}
				<div><input type="password" rel="{{{columnName}}}" autocomplete="off"></div>
				{{/isPassword}}
				{{#isEmail}}
				<div><input type="email" rel="{{{columnName}}}" autocomplete="off"></div>
				{{/isEmail}}
				{{#isEnumSelect}}
				<div>
					<select rel="{{{columnName}}}" localize>
						<option rel="defaultValue_{{{columnName}}}" value="-1" localize>All</option>
						{{#option}}
						<option value="{{{value}}}" localize>{{{label}}}</option>
						{{/option}}
					</select>
				</div>
				{{/isEnumSelect}}
				{{#isReferenceSelect}}
				<div>
					<select rel="{{{columnName}}}" localize>
						<option rel="defaultValue_{{{columnName}}}" value="-1" localize>All</option>
						{{#option}}
						<option value="{{{value}}}" localize>{{{label}}}</option>
						{{/option}}
					</select>
				</div>
				{{/isReferenceSelect}}
				{{#isSelect}}
				<div>
					<select rel="{{{columnName}}}" localize>
						<option rel="defaultValue_{{{columnName}}}" value="-1" localize>All</option>
						{{#option}}
						<option value="{{{value}}}" localize>{{{label}}}</option>
						{{/option}}
					</select>
				</div>
				{{/isSelect}}
				{{#isPrerequisiteReferenceSelect}}
				<div>
					<select rel="{{{columnName}}}">
						<option value="-1" localize>None</option>
					</select>
				</div>
				{{/isPrerequisiteReferenceSelect}}
				{{#isDateTime}}
				<div><input type="datetime-local" rel="{{{columnName}}}" autocomplete="off"></div>
				{{/isDateTime}}
				{{#isTime}}
				<div><input type="time" rel="{{{columnName}}}" autocomplete="off"></div>
				{{/isTime}}
				{{#isDate}}
				<div><input type="date" rel="{{{columnName}}}" autocomplete="off"></div>
				{{/isDate}}
				{{#isMonth}}
				<div><input type="month" rel="{{{columnName}}}" autocomplete="off"></div>
				{{/isMonth}}
				{{#isTextArea}}
				<div><textarea rel="{{{columnName}}}" autocomplete="off"></textarea></div>
				{{/isTextArea}}
				{{#isEnumCheckBox}}
				<div><input type="checkbox" rel="{{{columnName}}}" autocomplete="off"></div>
				{{/isEnumCheckBox}}
				{{#isFile}}
				<div><input type="file" rel="{{{columnName}}}" autocomplete="off"></div>
				{{/isFile}}
				{{#isImage}}
				<div><input type="file" rel="{{{columnName}}}" autocomplete="off" accept="image/*" {{#isRequired}}required{{/isRequired}}></div>
				{{/isImage}}
				{{#isTimeSpan}}
				<div class="flex gap-5px">
					<div class="width-100-percent"><input type="number" timespan="{{{columnName}}}" min="0" rel="{{{columnName}}}_hour" placeholder="hour" autocomplete="off"></div>
					<div class="width-100-percent"><input type="number" timespan="{{{columnName}}}" min="0" max="59" rel="{{{columnName}}}_minute" placeholder="minute" autocomplete="off"></div>
					<div class="width-100-percent"><input type="number" timespan="{{{columnName}}}" min="0" max="59" rel="{{{columnName}}}_second" placeholder="second" autocomplete="off"></div>
				</div>
				{{/isTimeSpan}}
				{{#isAutoComplete}}
				<div class="flex gap-5px">
					<div class="width-100-percent"><input type="text" rel="{{{columnName}}}" autocomplete="off"></div>
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
				{{/isAutoComplete}}
				{{#hasTag}}
				<div class="flex-wrap gap-5px" rel="{{{columnName}}}_tag"></div>
				{{/hasTag}}
			</div>
			{{/isSearch}}
		{{/input}}
		</div>
        <div class="flex gap-5px flex-end">
			<div class="abstract_button submit_button" rel="submit" localize>Submit</div>
			<div class="abstract_button cancel_button" rel="cancel" localize>Clear</div>
		</div>
	</div>
</div>