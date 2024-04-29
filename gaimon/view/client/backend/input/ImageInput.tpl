<div class="abstract_input_box input_per_line_{{{inputPerLine}}} {{#isHidden}}hidden{{/isHidden}}" rel="{{{columnName}}}_box">
	<div rel="labelDIV" localize>{{{label}}}</div>
	<div class="flex gap-5px">
		<div class="width-100-percent hidden">
			<input type="file" imageFile="true" aspectRatio="{{{aspectRatio}}}" rel="{{{columnName}}}" autocomplete="off" accept="image/*" {{#isRequired}}required{{/isRequired}} {{^isEditable}}disabled{{/isEditable}}>
		</div>
		<div class="width-100-percent" style="max-width:{{#config.isView}}calc(100% - 35px);{{/config.isView}}{{^config.isView}}calc(100% - 73px);{{/config.isView}}">
			<div class="abstract_input_file" rel="{{{columnName}}}_file">
				<div class="fileName" rel="{{{columnName}}}_fileName" localize>No File Chosen</div>
				{{^config.isView}}
				<div class="button" localize>Choose Files</div>
				{{/config.isView}}
			</div>
		</div>
		<div class="abstract_input_svg_icon disabled {{{cssClass}}}" rel="{{{columnName}}}_preview">
			<svg style="width:24px;height:24px" viewBox="0 0 24 24">
				<path fill="currentColor" d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z" />
			</svg>
		</div>
		{{^config.isTableForm}}
		{{^config.isView}}
		<div class="abstract_input_svg_icon {{{cssClass}}}" style="background:red;" rel="{{{columnName}}}_delete">
			<svg style="width:24px;height:24px" viewBox="0 0 24 24">
				<path fill="currentColor" d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
			</svg>
		</div>
		{{/config.isView}}
		{{/config.isTableForm}}
	</div>
	<div class="abstract_dialog hidden" rel="{{{columnName}}}_cropper">
		<div class="hidden" rel="{{{columnName}}}_canvas"></div>
		<div class="abstract_image_previewer {{size}}">
			<div class="flex-column gap-20px width-100-percent">
				<div class="abstract_dialog_topic">Image</div>
				<div class="width-100-percent" style="max-height:calc(100% - 200px) !important;text-align:center;">
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
				<div class="abstract_dialog_topic" localize>Previewer</div>
				<div class="width-100-percent" style="max-height:calc(100% - 200px) !important;text-align:center;" rel="{{{columnName}}}_original">
					<img rel="{{{columnName}}}_originalImage" src="{{{rootURL}}}{{{url}}}">
				</div>
				<div class="width-100-percent hidden" style="max-height:calc(100% - 200px) !important;" rel="{{{columnName}}}_cropped">
					<img rel="{{{columnName}}}_croppedImage" src="{{{rootURL}}}{{{url}}}cropped">
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