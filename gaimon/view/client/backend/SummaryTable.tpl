<div class="text-align-right width-100-percent flex-right">
	<table class="abstract_form_table width-auto">
		<tbody>
			{{#purchaseDate}}
			<tr>
				<td colspan="1"localize>purchase date</td>
				<td colspan="3"><input type="datetime-local" rel="purchaseDate"></td>
			</tr>
			{{/purchaseDate}}
			{{#totalPrice}}
			<tr>
				<td colspan="1"localize>sub total</td>
				<td colspan="3"><input type="number" rel="totalPrice" value="0" autocomplete="off" {{^isEditable}}disabled{{/isEditable}}></td>
			</tr>
			{{/totalPrice}}
			{{#discountPercentage}}
			<tr>
				<td localize>discount [%]</td>
				<td><input type="number" rel="discountPercentage" value="0" autocomplete="off"></td>
				<td localize>discount</td>
				<td><input type="number" rel="discount" value="0" autocomplete="off"></td>
			</tr>
			{{/discountPercentage}}
			{{#netPrice}}
			<tr>
				<td localize>net price</td>
				<td colspan="3"><input type="number" rel="netPrice" value="0" autocomplete="off" {{^isEditable}}disabled{{/isEditable}}></td>
			</tr>
			{{/netPrice}}
			{{#tax}}
			<tr>
				<td localize>tax</td>
				<td colspan="3"><input type="number" rel="tax" value="0" autocomplete="off" {{^isEditable}}disabled{{/isEditable}}></td>
			</tr>
			{{/tax}}
			{{#vat}}
			<tr>
				<td localize>VAT</td>
				<td colspan="3"><input type="number" rel="vat" value="0" autocomplete="off" {{^isEditable}}disabled{{/isEditable}}></td>
			</tr>
			{{/vat}}
			{{#priceIncludingTax}}
			<tr>
				<td localize>price including VAT</td>
				<td colspan="3"><input type="number" rel="priceIncludingTax" value="0" autocomplete="off" {{^isEditable}}disabled{{/isEditable}}></td>
			</tr>
			{{/priceIncludingTax}}
			
			
		</tbody>
	</table>
</div>