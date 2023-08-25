<div class="abstract_form_container">
	<div class="abstract_form" rel="form">
		<!-- <div class="form_header" localize>Address</div> -->
		<div class="abstract_form_input">
			<div class="abstract_form_input_box full">
				<div localize>Destination country</div>
				<div>
					<select rel="countryCode" required>
						{{#country}}
						<option value="{{value}}" localize>{{name}}</option>
						{{/country}}
					</select>
				</div>
			</div>
		</div>
		<div class="abstract_form_input" rel="addressContentTH">
			<div class="abstract_form_input_box full" rel="defragContent">
				<div localize>Automatic address split</div>
				<div>
					<textarea class="address-textarea" rel="addressBox" placeholder="ตัวอย่างข้อมูล: ดวงดาว สดใส ที่อยู่ 111/11 หมู่ 3 อาคาร A3 ซอยอัศวิน ถนนเจริญประดิษฐ ตําบลรูสะมิแล อําเภอเมืองปัตตานี จังหวัดปัตตานี 94000 โทรศัพท์ 0980861749 email: email@email.com"></textarea>
					<div class="flex gap-5px flex-end">
						<div class="abstract_button submit_button" rel="defragButton" localize>Address split</div>
					</div>
				</div>
			</div>
			<div class="abstract_form_input_box normal">
				<div localize>Name</div>
				<div>
					<input type="text" placeholder="name" rel="firstname" localize >
				</div>
			</div>
			
			<div class="abstract_form_input_box normal">
				<div localize>Place Name</div>
				<div>
					<input type="text" placeholder="place name" rel="addressName" localize>
				</div>
			</div>
			
			<div class="abstract_form_input_box half">
				<div localize>House No.</div>
				<div>
					<input type="text" placeholder="house No." rel="addressNumber" localize >
				</div>
			</div>
			<div class="abstract_form_input_box half">
				<div localize>Moo</div>
				<div>
					<input type="text" placeholder="moo" rel="moo" localize >
				</div>
			</div>
			<div class="abstract_form_input_box half">
				<div localize>Village</div>
				<div>
					<input type="text" placeholder="village" rel="village" localize >
				</div>
			</div>
			<div class="abstract_form_input_box half">
				<div localize>Alley</div>
				<div>
					<input type="text" placeholder="alley" rel="alley" localize required>
				</div>
			</div>
			<div class="abstract_form_input_box normal">
				<div localize>Road</div>
				<div>
					<input type="text" placeholder="road" rel="road" localize required>
				</div>
			</div>
			<div class="abstract_form_input_box normal">
				<div localize>Postal Code</div>
				<div>
					<input type="text" placeholder="postal code" rel="postalCode" localize required>
				</div>
			</div>
			<div class="abstract_form_input_box normal">
				<div localize>Province</div>
				<div>
					<input type="text" placeholder="province" rel="province" localize required>
				</div>
			</div>
			<div class="abstract_form_input_box normal">
				<div localize>District</div>
				<div>
					<input type="text" placeholder="district" rel="district" localize required>
				</div>
			</div>
			<div class="abstract_form_input_box normal">
				<div localize>Sub District</div>
				<div>
					<input type="text" placeholder="sub district" rel="subDistrict" localize required>
				</div>
			</div>
			<div class="abstract_form_input_box normal">
				<div localize>Phone Number</div>
				<div>
					<input type="text" placeholder="phone number" rel="phoneNumber" localize required>
				</div>
			</div>
			<div class="abstract_form_input_box normal">
				<div localize>E-Mail</div>
				<div>
					<input type="text" placeholder="email" rel="email" localize required>
				</div>
			</div>
			<div class="abstract_form_input_box normal">
				<div localize>Address</div>
				<div>
					<input type="text" placeholder="address" rel="address" localize required>
				</div>
			</div>
			<div class="abstract_form_input_box full">
				<div localize>More Details</div>
				<div>
					<textarea placeholder="more details" rel="remark" localize></textarea>
				</div>
			</div>
		</div>
		<div class="abstract_form_input hidden" rel="addressContentInternational">
			<div class="abstract_form_input_box normal">
				<div localize>Name</div>
				<div>
					<input type="text" placeholder="name" rel="firstnameInternational" localize required>
				</div>
			</div>
			<div class="abstract_form_input_box normal">
				<div localize>Last Name</div>
				<div>
					<input type="text" placeholder="last name" rel="lastnameInternational" localize required>
				</div>
			</div>
			<div class="abstract_form_input_box normal">
				<div localize>Address</div>
				<div>
					<input type="text" placeholder="address" rel="addressInternational" localize required>
				</div>
			</div>
			<div class="abstract_form_input_box normal">
				<div localize>State/Province</div>
				<div>
					<input type="text" placeholder="state/province" rel="provinceInternational" localize required>
				</div>
			</div>
			<div class="abstract_form_input_box normal">
				<div localize>City/District</div>
				<div>
					<input type="text" placeholder="city/district" rel="districtInternational" localize required>
				</div>
			</div>
			<div class="abstract_form_input_box normal">
				<div localize>Postal Code</div>
				<div>
					<input type="text" placeholder="postal code" rel="postalCodeInternational" localize required>
				</div>
			</div>
			<div class="abstract_form_input_box normal">
				<div localize>Phone Number</div>
				<div>
					<input type="text" placeholder="phone number" rel="phoneNumberInternational" localize required>
				</div>
			</div>
			<div class="abstract_form_input_box normal">
				<div localize>E-Mail</div>
				<div>
					<input type="text" placeholder="email" rel="emailInternational" localize required>
				</div>
			</div>
			<div class="abstract_form_input_box full">
				<div localize>More Details</div>
				<div>
					<textarea placeholder="more details" rel="remarkInternational" localize ></textarea>
				</div>
			</div>
		</div>
		<!-- <div class="flex gap-5px flex-end" rel="operation">
			<div class="abstract_button submit_button" rel="submit" localize>Submit</div>
			<div class="abstract_button cancel_button" rel="cancel" localize>Cancel</div>
		</div> -->
	</div>
</div>