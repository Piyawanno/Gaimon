from xerial.Record import Record
from xerial.DateTimeColumn import DateTimeColumn
from xerial.IntegerColumn import IntegerColumn
from xerial.StringColumn import StringColumn

class AddressBook (Record) :
	addressName = StringColumn(length=255, default="")

	phoneNumber = StringColumn(length=16, default="")
	email = StringColumn(length=255, default="")
	firstname = StringColumn(length=255, default="")
	lastname = StringColumn(length=255, default="")

	addressNumber = StringColumn(length=16, default="")
	moo = StringColumn(length=255, default="")
	village = StringColumn(length=255, default="")
	alley = StringColumn(length=255, default="")
	road = StringColumn(length=255, default="")
	subDistrictID = IntegerColumn(default=-1, foreignKey="Subdistrict.id")
	districtID = IntegerColumn(default=-1, foreignKey="District.id")
	provinceID = IntegerColumn(default=-1, foreignKey="Province.id")
	postalCode = StringColumn(length=16)
	countryCode = StringColumn(length=10)
	remark = StringColumn(default="")
	address = StringColumn(default="")

	subDistrict = StringColumn(default="")
	district = StringColumn(default="")
	province = StringColumn(default="")

	ownerID = IntegerColumn(default=-1, isIndex=True)
	companyID = IntegerColumn(default=-1, isIndex=True)

	isInternational = IntegerColumn(length=1)

	isDrop = IntegerColumn(default=0)