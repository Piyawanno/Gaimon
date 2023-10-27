<div class="subMenuItem" rel="menu">
	<div class="flex space-between width-100-percent">
		<a rel="link" href="{{{url}}}">
			<div class="flex {{#isMobile}}flex-column width-100-percent{{/isMobile}} gap-10px" style="height:100%;width: 100%;" rel="menuButton">
				{{#isSVG}}
				<div class="menuSVGIcon flex-column-center">
					{{{icon}}}
				</div>
				{{/isSVG}}
				{{^isSVG}}
				<div class="menuImgIcon">
					<img class="menuImg" src="{{icon}}">
				</div>
				{{/isSVG}}
				<div class="menuLabel" localize>{{name}}</div>
			</div>
		</a>
		{{^isMobile}}
		{{#hasAdd}}
		<div class="subMenuButton add_button" rel="add" title="Add">
			<svg style="width:20px;height:20px;" viewBox="0 0 24 24">
				<path fill="currentColor" d="M17,13H13V17H11V13H7V11H11V7H13V11H17M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"></path>
			</svg>
		</div>
		{{/hasAdd}}
		{{/isMobile}}
	</div>
</div>