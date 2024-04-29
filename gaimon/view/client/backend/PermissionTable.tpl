<div class="width-100-percent">
	<div class="flex gap-20px" style="justify-content: flex-end;margin-top: 10px;margin-bottom: 20px;">
		<div class="flex gap-10px">
			<div class="flex center"><input id="permission_check_all" rel="all" style="margin:0;" type="checkbox"></div>
			<div class="flex center"><label class="user-select-none" for="permission_check_all" localize>All</label></div>
		</div>
		<div class="flex gap-10px">
			<div class="flex center"><input id="permission_check_none" rel="none" style="margin:0;" type="checkbox" checked></div>
			<div class="flex center"><label class="user-select-none" for="permission_check_none" localize>None</label></div>
		</div>
	</div>
	<table class="abstract_form_table" rel="table">
		<colgroup>
			<col style="min-width:50%;max-width:50%;width:50%;">
			<col style="min-width:10%;max-width:10%;width:10%;">
			<col style="min-width:10%;max-width:10%;width:10%;">
			<col style="min-width:10%;max-width:10%;width:10%;">
			<col style="min-width:10%;max-width:10%;width:10%;">
			<col style="min-width:10%;max-width:10%;width:10%;">
		</colgroup>
		<tr>
			<th rowspan="2" localize>Modules</th>
			<th colspan="5" localize>Permissions</th>
		</tr>
		<tr>
			<th localize>Read</th>
			<th localize>Write</th>
			<th localize>Update</th>
			<th localize>Drop</th>
			<th localize>Decision</th>
		</tr>
		<tbody rel="tbody"></tbody>
	</table>
</div>