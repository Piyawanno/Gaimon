<div class="dialog">
	<div class="container">
		<div class="title flex gap-10px" style="background:red !important;" rel="title" localize>
			<div class="flex-column-center">
				<svg style="width:24px;height:24px" viewBox="0 0 24 24">
					<path fill="currentColor" d="M11,15H13V17H11V15M11,7H13V13H11V7M12,2C6.47,2 2,6.5 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20Z" />
				</svg>
			</div>
			<div class="flex-column-center" localize>Alert</div>
		</div>
		<div class="form width-100-percent" style="box-shadow:unset;">
			<div class="body" localize>{{{text}}}</div>
		</div>
		<div class="operation" rel="operation">
			<div class="width-100-percent flex-end gap-15px">
				<div rel="confirm" class="alert" localize>OK</div>
			</div>
		</div>
	</div>
</div>