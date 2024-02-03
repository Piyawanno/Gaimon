<tr>
	<td style="width:100%;" localize rel="{{{column}}}_td">
		<input rel="{{{column}}}" type="text"/>
	</td>
	<td class="text-align-center" localize rel="view">
		<div class="flex center cursor-pointer">
			<svg style="width:24px;height:24px" viewBox="0 0 24 24">
				<path fill="currentColor" d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z" />
			</svg>
		</div>
	</td>
	{{^config.isView}}
	<td style="width:10%;padding:5px;">
		<div class="flex center cursor-pointer">
			<svg rel="delete" style="width:24px;height:24px;cursor:pointer;" viewBox="0 0 24 24">
				<path fill="#f00" d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"></path>
			</svg>
		</div>
	</th>
	{{/config.isView}}
</tr>