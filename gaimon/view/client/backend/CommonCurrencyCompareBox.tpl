<div class="chart_container currency">
	<div class="topic" localize>{{{title}}}</div>
	<div class="currencyBox">
		<div class="currencyValue">
			<div class="currency" rel="currency"></div>
			<div class="number" rel="value"></div>
		</div>
		<div class="comparatorBox" rel="comparatorBox">
			<div rel="equal" class="sign hidden">
				<svg fill="currentColor" viewBox="0 0 24 24">
					<path d="M12,10A2,2 0 0,0 10,12C10,13.11 10.9,14 12,14C13.11,14 14,13.11 14,12A2,2 0 0,0 12,10Z" />
				</svg>
			</div>
			<div rel="up" class="sign hidden">
				<svg fill="currentColor" viewBox="0 0 24 24">
					<path d="M13,20H11V8L5.5,13.5L4.08,12.08L12,4.16L19.92,12.08L18.5,13.5L13,8V20Z" />
				</svg>
			</div>
			<div rel="down" class="sign hidden">
				<svg fill="currentColor" viewBox="0 0 24 24">
					<path d="M11,4H13V16L18.5,10.5L19.92,11.92L12,19.84L4.08,11.92L5.5,10.5L11,16V4Z" />
				</svg>
			</div>
			<div>
				<label rel="percent"></label>
				<label>%</label>
			</div>
		</div>
	</div>
	<div class="comparatorLabelBox">
		<div localize>vs previous</div>
		<div rel="comparatorValue"></div>
		<div rel="comparatorUnit" localize></div>
	</div>
</div>