<div class="dialog">
	<div class="container">
		<div class="title flex gap-10px" style="background:orange !important;" rel="title" localize>
			<div class="flex-column-center">
        		<svg style="width:24px;height:24px" viewBox="0 0 24 24">
					<path fill="currentColor" d="M12 2C6.5 2 2 6.5 2 12S6.5 22 12 22 22 17.5 22 12 17.5 2 12 2M12 20C7.59 20 4 16.41 4 12S7.59 4 12 4 20 7.59 20 12 16.41 20 12 20M16.59 7.58L10 14.17L7.41 11.59L6 13L10 17L18 9L16.59 7.58Z" />
				</svg>
    		</div>
			<div class="flex-column-center">Confirm</div>
		</div>
		<div class="form width-100-percent" style="box-shadow:unset;">
			<div class="body" localize>{{{text}}}</div>
		</div>
		<div class="operation" rel="operation">
			<div class="width-100-percent flex-end gap-15px">
				<div rel="cancel" class="cancel">Cancel</div>
				<div rel="confirm" class="warning">OK</div>
			</div>
		</div>
	</div>
</div>