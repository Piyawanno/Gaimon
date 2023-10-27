# Model

Model in Gaimon is basically based on [Xerial](https://github.com/Piyawanno/Xerial).
Note that a Model in Gaimon is created mainly for data structure and form-input.
A Model object should process its own attribute. The related attribute from other
object can be done but with limitation. To process multiple objects and the relation
between objects, the [Controller](Controller.md) should take the task.
The method is design to prevent the **Envy** behavior as defined in the **Refactoring**.

In a development process, after creating Module, Extension and MVC set,
we recommend to start with Model. And note that the Model has a huge impact on
the application. But in the case of Model modification, Gaimon and Xerial offer tools
for [Structure Modification](https://github.com/Piyawanno/Xerial/blob/main/document/tutorial/StructureModification.md).

## Creating Model

After [creating Module and Extension](Extension.md), a [set of MVC](MVC.md) can be created.
A Model file can be found under `MODULE_PATH/EXTENSION_PATH/model/MVC_NAME.py`.
For example, if you have a Module named `eshopping` and an Extension named `cart` under
the Extension, the MVC set named `Product` is created. The Model can be found
under `eshopping/cart/model/Product.py`. The empty Model inherited from
`xerial.Record.Record` is created :

```python

from xerial.Record import Record

class Product (Record) :
	pass
```

It can be seen that the Model has a very simple code base. Hence, an empty Model
can also manually created. And it is very common situation for the development
under Gaimon.

## Data Structure

Gaimon uses Xerial for defining structure of a Model and the Relation between Models.
For the implementation, we recommend to follow these guidelines and tutorials :

- [Xerial Tutorial](https://github.com/Piyawanno/Xerial/blob/main/document/tutorial/README.md)
- [Data Structure Modification](https://github.com/Piyawanno/Xerial/blob/main/document/tutorial/StructureModification.md)
- [One-to-One Relation](https://github.com/Piyawanno/Xerial/blob/main/document/tutorial/OneToOneRelation.md)
- [One-to-Many Relation](https://github.com/Piyawanno/Xerial/blob/main/document/tutorial/OneToManyRelation.md)
- [Many-to-Many Relation](https://github.com/Piyawanno/Xerial/blob/main/document/tutorial/ManyToManyRelation.md)

For example, the Model `Product` will as followed implemented.:

```python
from xerial.Record import Record
from xerial.IntegerColumn import IntegerColumn
from xerial.StringColumn import StringColumn
from xerial.CurrencyColumn import CurrencyColumn

class Product (Record) :
	name = StringColumn(length=128)
	sku = StringColumn(length=32)
	description = StringColumn(length=-1)
	price = CurrencyColumn()
	isDrop = IntegerColumn(default=0)
```

### Note
1. The length of `description` is `-1`, it means that `description` has the
`TEXT` type in the database and has an extra length in comparison to the other
attribute with the length under `255`, which has the type `VARCHAR`.
2. The column `price` has the type `CurrencyColumn`, which is a special Column
type from xerial. It stores data into database as JSON string and can be searched
under database vendor with JSON support like PostgreSQL. Moreover, the calculation
of `CurrencyColumn` will be implemented with
[`fractions` module in Python](https://docs.python.org/3/library/fractions.html)
to ensure the precision of the value.
3. The column `isDrop` designates the status of the Record/Object, if `isDrop=1`,
means that the Record will not be used. We recommend to use the status designation
instead of actual deleting the data from the database, since Xerial uses
`weak foreign-key reference`. This approach will cause no database lock
and reduce data corruption e.g. a record references to other non-existing record.

After creating Models with data structure and starting or restarting Gaimon with
the command :

```bash
gaimon
```

Database tables according to the Model name and data structure will be automatically
created and ready to used. In the case of data structure modification (or known as
the term `migration`), the structure of the table will also be automatically
altered or modified without any additional procedure. This feature is essential
for the software development in team, since a developer will continuously change
the data structure of Models. Modification of a Model from a developer can negatively
affect on the whole application or development process and the modification
of a Model is a very common task, which can daily happen. If it requires an additional
procedure, or worse no recommendation procedure at all, the development process
can be significantly slowed down or it can cause malfunction in the application.

Data structure defined in Model will be used in every part of the application
from database structure, data ingestion, data query, data processing to front-end.
With the approach, the data structure in the application is strongly consistent.

## Input Form

The fact is that input form on client-side is tightly coupled with the data
structure on server-side including the table structure in database.
In the most development process, however, the implementation of form input
is strictly separated from the sever-side data processing. One of the frequently
reasons is the layered architecture and work separation. The connection
between the font-end and the back-end will regularly tested in the integration
phase and can cause errors. The silo approach can reduce the integration problem
but not the consistency. As an example, naming of the attribute or column
is a common problem in this aspect. The name of the input from can usually be
different from the attribute in the REST-API or column in the database.
Or even worse, if the data structure from server-side is changed, the input form
must go after. Hence, Gaimon is designed with the strong coupling of all
components related to the Model including the input form. The change ot the
Model will automatically affect the input form.

Hence, Gaimon and Xerial provides the option to directly implement the
input form inside the data structure of the Model. The class `Column`,
which is the super class of all Column types, can take the optional
parameter `input`, which is designed to be the subclass of the class `Input`.
On the server-side, the meta data for the input form will be automatically
generated and can be accessed over the URL `http//yourdomain.com/input/MODEL_NAME`,
in our case `MODEL_NAME` is `Product`. The meta data will be used on the
client-side for creating the input form and extract data from the
filled input form.

As example the Model `Product` can be implemented as followed :

```python
from xerial.Record import Record
from xerial.IntegerColumn import IntegerColumn
from xerial.StringColumn import StringColumn
from xerial.CurrencyColumn import CurrencyColumn

from xerial.input.TextInput import TextInput
from xerial.input.RichTextInput import RichTextInput
from xerial.input.CurrencyInput import CurrencyInput

class Product (Record) :
	name = StringColumn(
		length=128,
		input=TextInput(
			label='Name',
			order='1.0',
			isRequired=True,
			isTable=True,
			isSearch=True,
		)
	)
	sku = StringColumn(
		length=32,
		input=TextInput(
			label='SKU',
			order='2.0',
			isRequired=True,
			isTable=True,
			isSearch=True,
		)
	)
	description = StringColumn(
		length=-1,
		input=RichTextInput(
			label='Description',
			order='3.0',
			isRequired=False,
			isTable=True,
			isSearch=True,
		)
	)
	price = CurrencyColumn(
		input=CurrencyInput(
			label='Price',
			order='4.0',
			isRequired=True,
			isTable=True,
			isSearch=True,
		)
	)
	isDrop = IntegerColumn(default=0)
```

### Note

1. In each input, the `order` of the input can be given. The sequence of
the input will be sorted by this parameter. In the case that a new column
with an input will be inserted between the existing input, the order can be
given applying version number. For example, if an input is inserted between
`sku` and `description`, the order can be given as `2.1`.
2. The implemented input already has some basic validation like `isRequired`.
Each input type can have other validation parameters. For full featured
validation on the server-side the decoration [Validation](Decorator.md#input-validation)
can be applied.
3. Not only the input form will be created with the given code but
the [data table](frontend/DataTable.md) will also be created for basic and advance
data management.

It should be emphasized that the input form in the Gaimon is an advanced
and usable feature. It can be directly used with the [Back-Office](BackOffice.md)
to achieve an usable application for data management. Moreover, the existing Model
in the existing Extension can be extended with the additional features for
the input form and the data table withe other Model in the other Extension
without modifying the existing code. More information about the input form in the
[Advance Input Form](AdvanceInputForm.md) and [Data Table](DataTable.md).

## Data Processing

The basic data processing i.e. mapping data from the user input to the record or
convert record into JSON using [Record.toDict()](https://github.com/Piyawanno/Xerial/blob/main/document/api/xerial/Record.md)
are already provided by Xerial.
From [selecting data with Xerial](https://github.com/Piyawanno/Xerial/blob/main/document/tutorial/README.md#query-data),
it can be seen that with `select`, a list of Records can be retrieved from database
can can further processed. To send data to the client-side in a form of JSON,
each Record must be converted to dictionary form and response to the client
via [Controller](Controller.md#response-to-client).

```python
productList:List[Product] = await session.select(Product, "")
productRawList:List[Dict[str:Any]] = [i.toDict() for i in productList]
```

Note that the given code is not complete and should be implemented under
a Controller.

For further data processing related to the attribute of Record, it should
be implemented as method of the record. As an example, the discounted price
of a `Product` Record should be calculated :

```python
# Implemented imports is skipped.

from fractions import Fraction

class Product (Record) :
	# The attribute implementation is skipped.
	def calculateDiscount(self, discountPercentage:Fraction) -> Fraction :
		# The selected price will have the type CurrencyData,
		# which has attribute origin as a Fraction.
		return self.price.origin*(100-discountPercentage)/100
```

To calculate each discount :

```python
discountList = [i.calculateDiscount(Fraction(10.0)) for i in productList]
```

## Dynamic Model

Model in Gaimon can be dynamically created and edited with the
[Dynamic Model](DynamicModel.md) so that users can change and extend the
behavior of the Extension without touching any source code.