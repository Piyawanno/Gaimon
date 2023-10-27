<div class="abstract_input_box input_per_line_1 {{#isHidden}}hidden{{/isHidden}}" rel="{{{columnName}}}_box">
	<div class="flex gap-5px" rel="labelDIV">
		<div localize>{{{label}}}</div>
		{{#isRequired}}<div><label class="required">*</label></div>{{/isRequired}}
	</div>
	<div>
		<table class="abstract_table">
			<thead>
				<tr>
					<th style="width:100%;" localize>File</th>
					<th class="text-align-center" localize>View</th>
					{{^config.isView}}
					<th style="width:10%;padding:5px;">
						<div class="flex center">
							<svg class="abstract_button add_button" rel="{{{columnName}}}_icon" style="padding:2px;border-radius:50%;width:20px;" viewBox="0 0 24 24">
								<path fill="currentColor" d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
							</svg>
						</div>
					</th>
					{{/config.isView}}
				</tr>
			</thead>
			<tbody rel="{{{columnName}}}_tbody" fileMatrix="{{{columnName}}}" {{#config.isView}}isView="{{{config.isView}}}"{{/config.isView}} url="{{url}}">

			</tbody>
		</table>
	</div>
</div>