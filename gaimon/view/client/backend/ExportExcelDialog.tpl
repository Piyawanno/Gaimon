<div class="abstract_dialog">
	<div class="abstract_dialog_container {{size}}" rel="dialog_container">
		<div rel="dialogMenu" class="abstract_dialog_menu hidden"></div>
		<div rel="additionalTopBar" class="abstract_additional_topBar hidden"></div>
		<div class="flex-column gap-20px width-100-percent" rel="container">
			<div class="abstract_dialog_topic" rel="title" localize>{{{title}}}</div>
			<div class="abstract_form_input" rel="form"></div>
			<div class="abstract_form_input" rel="additionalForm"></div>
			<div class="flex gap-5px flex-end" rel="operation">
				<div class="abstract_button excel_button" rel="submit">
					<div class="flex-column-center">
						<svg style="width:15px;height:15px;" viewBox="0 0 24 24">
							<path fill="currentColor" d="M4 3H18C19.11 3 20 3.9 20 5V12.08C18.45 11.82 16.92 12.18 15.68 13H12V17H13.08C12.97 17.68 12.97 18.35 13.08 19H4C2.9 19 2 18.11 2 17V5C2 3.9 2.9 3 4 3M4 7V11H10V7H4M12 7V11H18V7H12M4 13V17H10V13H4M19.44 21V19H15.44V17H19.44V15L22.44 18L19.44 21" />
						</svg>
					</div>
					<div localize>Export</div>
				</div>
				<div class="abstract_button delete_button" rel="cancel">
					<div class="flex-column-center">
						<svg style="width:15px;height:15px" viewBox="0 0 24 24">
							<path fill="currentColor" d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
						</svg>
					</div>
					<div localize>Clear</div>
				</div>
				<div class="abstract_button cancel_button" rel="close">					
					<div class="flex-column-center">
						<svg style="width:15px;height:15px" viewBox="0 0 24 24">
							<path fill="currentColor" d="M12,2C17.53,2 22,6.47 22,12C22,17.53 17.53,22 12,22C6.47,22 2,17.53 2,12C2,6.47 6.47,2 12,2M15.59,7L12,10.59L8.41,7L7,8.41L10.59,12L7,15.59L8.41,17L12,13.41L15.59,17L17,15.59L13.41,12L17,8.41L15.59,7Z" />
						</svg>
					</div>
					<div localize>Close</div>
				</div>
			</div>
		</div>
	</div>
</div>