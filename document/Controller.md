# Controller

A Controller is the core component for the business logic implementation in Gaimon.
If the Model is the structure, the Controller is the logic. It handles the
user request, does everything in between and responses the user with result
or error message. 

## Creating a Controller

A Controller can be created in the same way as a Model :
[creating Module and Extension](Extension.md) then a [set of MVC](MVC.md).
In this case a Controller inherited from `BaseController` is created
under the path `MODULE_PATH/EXTENSION_PATH/model/MVC_NAME.py`.
From the [MVC example](MVC.md#mvc-set), a Module named `eshopping` and
an Extension named `cart` under the Extension, the MVC set named `Product`
is created. The Controller can be found under
`eshopping/cart/model/ProductController.py`.:

```python
from gaimon.core.BaseController import BaseController, BASE
from gaimon.core.Route import GET, POST
from gaimon.model.PermissionType import PermissionType as PT
from eshopping.cart.model.Product import Product

from gaimon.core.RESTResponse import RESTResponse 

@BASE(Product, '/cart/product', 'Product')
class ProductController (BaseController) :
	pass
```

Note that the `ProductController` is created with the MVC creator and
is already filled with many functionalities including CRUD API
(Create, Read, Update, Delete) and [Permission Control](Permission.md).
The given example `ProductController` is bound with the Model `Product`
and contains already the Routes starting with `/cart/product/`
(see [BaseController](#basecontroller) for more information) and
the user must have the [Role](Permission.md#role) of `Product` to
access CRUD API of the Controller.

Beside the generated Controller inherited from the `BaseController`,
a simple Controller can also be directly created without
any dependencies and inheritance. The convention for creating a
Controller is that the Controller class must have a name ended with
`Controller` and stored in the folder `controller` of an extension.:

```python
class SimpleController :
	pass
```

The code `SimpleController` is a valid Controller in Gaimon but is still
useless since it has no implementation of any request/response method.

## Routing

Routing in Gaimon is based on the
[Sanic Routing](https://sanic.dev/en/guide/basics/routing.html) with some
modifications. Unlike in Sanic, where a function will be mapped with
a Route-path via decorator, in Gaimon, a method of a Controller class
will be mapped. Moreover, Routing in Gaimon includes also the permission
control into it. To create a Route on top of the method, the decorator
`GET` and `POST` can be used.:

```python
from gaimon.core.Route import GET
from gaimon.core.RESTResponse import RESTResponse as REST

from sanic.request import Request

class SimpleController :
	@GET('/hello/world', role=['guest'], hasDBSession=False)
	async def returnHello(self, request:Request) :
		return REST({'message' : 'Hello world!'})
```

From the given example, after starting Gaimon, the routes method
can be accessed under the URL `http://yourdomain/hello/world`
and the result will be :

```JSON
{"message" : "Hello world!"}
```

The parameter `role=['guest']` designates that everyone without
logging-in can access the method (see
[Guest Role](Permission.md#special-role--guest) for more information).
Without giving the parameter `role`, the default permission
to the method is [Root Permission](Permission.md#special-role--root)
for the security. The other optional parameter is `hasDBSession=False`,
which designates that the method doesn't requires any database
connection and can response a bit faster. The default value of
`hasDBSession=True`, which allows the Controller to have the attribute
`self.session: xerial.AsyncDBSessionBase` for the data handling
with database.

Since Gaimon Routing is based on Sanic Routing, all the features
from Sanic Routing can be used under Gaimon.
## User Request

Since Gaimon inherits Routing from Sanic, user request of Gaimon has
no big difference to Sanic. Each method with Routing will receive
at lease one parameter `request: sanic.request.Request`. This parameter
contains all information from user request (for more information see
[Sanic Request](https://sanic.dev/en/guide/basics/request.html)).
The basic usage of user request are :

Getting data from user input form :

```python
class SimpleController :
	@GET('/hello/world', role=['guest'], hasDBSession=False)
	async def returnHello(self, request:Request) :
		# Getting data from user input form
		print(request.form)
		return REST({'message' : 'Hello world!'})
```

Getting JSON data :

```python
		# Other code is skipped
		print(request.json)
```

Getting user session :

```python
		# Other code is skipped
		print(request.ctx.session)
```

Getting uploaded files and stored into local path:

```python
		# Other code is skipped
		print(request.files)
		# Store file into local path
		uploaded = request.files[0]
		await self.application.static.storeStaticShare(uploaded.name, uploaded.body)
```

Note that the uploaded file can be accessed under the URL
`http://yourdomain/upload/FILE_NAME`


## Response to Client

Like other parts, response in Gaimon is also based on
[Sanic Response](https://sanic.dev/en/guide/basics/response.html).
HTTP response with different type of data can be returned to
the client with `sanic.response`

HTML response :

```python
# Other imports are skipped.
from sanic import response

class SimpleController :
	@GET('/hello/world', role=['guest'], hasDBSession=False)
	async def returnHello(self, request:Request) :
		return response.html('<h1>Hello World</h1>')
```

HTML response with error code :

```python
		# Other code is skipped
		return response.html('<h1>Internal Error</h1>', status=501)
```

JSON response :

```python
		# Other code is skipped
		return response.json({'message' : 'Hello world!'})
```

Static file response :

```python
		# Other code is skipped
		return await response.file(path)
```

Data response as a static file :

```python
# Other imports are skipped.
from sanic import response

import mimetypes

class SimpleController :
	@GET('/hello/world', role=['guest'], hasDBSession=False)
	async def returnHello(self, request:Request) :
		with open(path, 'rb') as fd :
			content = fd.read()
			type = mimetypes.guess_type(path)
		return response.raw(content, content_type=type[0])
```

Beside the response based on Sanic, Gaimon provides the
[Controller Extension](#controller-extension), where the existing
Controller can be extended with the other Controller.
To enables this feature, response must be based on `gaimon.core.RESTResponse`.

```python
from gaimon.core.Route import GET
from gaimon.core.RESTResponse import RESTResponse as REST

from sanic.request import Request

class SimpleController :
	@GET('/hello/world', role=['guest'], hasDBSession=False)
	async def returnHello(self, request:Request) :
		return REST({'message' : 'Hello world!'})
```

For [REST API](REST.md), the responded JSON data must contains the key
`isSuccess`. Gaimon, hence, provides a sugar syntax for this.:

```python
from gaimon.core.Route import GET
from gaimon.core.RESTResponse import (
	SuccessRESTResponse as Success,
	ErrorRESTResponse as Error,
)

from sanic.request import Request

class SimpleController :
	@GET('/hello/world', role=['guest'], hasDBSession=False)
	async def returnHello(self, request:Request) :
		isSuccess = True
		if isSuccess :
			return Success({'data' : 'Some result data'})
		else :
			return Error('This is error message.')
```

## Permission

Permission control is a crucial component of the application security
and can be directly implemented by the Controller. By default, if the
permission is not given, Gaimon will set the permission control
to the most strict mode, where only users with the **Role** `root` can access the Route.
The opposite of the most strict mode is the the Route is set permission
to the Role `guest`, where everyone with or without login can access the Route.

```python
class SimpleController :
	@GET('/hello/world', role=['guest', 'user'], hasDBSession=False)
	async def returnHello(self, request:Request) :
		return REST({'message' : 'Hello world!'})
```

From the example, it can be seen that multiple Roles can be set in
the parameter `role: List[str]` and beside `guest`, the Role `user`
is also allowed to access the Role. Note that all logged in user
will automatically grant the Role `user`. In the practical use, if any
Route allows `guest` Role to access, it is not necessary to add the other Role,
since already everyone can access the Route with or without logging in.

For more information and advance feature of permission management see
[Permission Control](Permission.md).

## BaseController

A simple Controller can be directly implemented as shown in previous sections
or can inherit from `BaseController`, which already have a set of common used
features.

```python
from gaimon.core.BaseController import BaseController, BASE
from gaimon.core.Route import GET, POST
from gaimon.model.PermissionType import PermissionType as PT
from eshopping.cart.model.Product import Product

from gaimon.core.RESTResponse import RESTResponse 

@BASE(Product, '/cart/product', 'Product')
class ProductController (BaseController) :
	pass
```

The decorator `@BASE` requires the followed parameters :
- Model (`Product` in the example) is the class bounded with the Controller.
It means that all the database connected methods of the Controller will
use the given Model as parameter e.g. `select`,  `insert`, `update` and `drop`.
- Base Route (`'/cart/product'` in the example) is the string for creating
the Routes in the Controller. All the Routes will start with the given
Base Route.
- Role name (`'Product'` in the example) is the string of the Role to
access each Routed method of the Controller. See
[Role with PermissionType](Permission.md#role-with-permissiontype) for more
information.

From the example code, `ProductController` will have the followed routed
methods :

### Selecting Pagination

The Route is `/cart/product/getAll`, which is a `HTTP POST` REST-API for
querying data from database, The request has the structure :

```json
{
	"data" : [
		{
			"isAnd" : false,
			"children" : [
				{
					"key": "description",
					"value": "something",
					"operation": 40,
				}, {
					"key": "sku",
					"value": ["123456", "123457"],
					"operation": 41,
				}
			]
		},{
			"key": "name",
			"value": "pen",
			"operation": 40,
		}
	],
	"isAnd": true,
	"limit": 10,
	"pageNumber": 2,
	"orderBy": "id",
	"isDecreasingOrder": true
}
```
With the request, a complex query can be executed. From the given request
the followed query will generated :

```SQL id, 
SELECT id, name, sku, description, price, isDrop FROM Product
WHERE (
	(
		(description LIKE '%something%') OR
		(sku IN ('123456', '123457'))
	) AND (
		name LIKE '%pen%'
	)
)
LIMIT 10 OFFSET 20 ORDER BY id DESC
```

Note that the field `operation` is enumeration fro xerial.FilterOperation
and has the followed value :

```python
from enum import IntEnum

class FilterOperation (IntEnum) :
	EQUAL = 10
	NOT_EQUAL = 11
	GREATER = 20
	GREATER_EQUAL = 21
	LESS = 30
	LESS_EQUAL = 31
	LIKE = 40
	IN = 41
```

It can be seen that the requesting data in JSON is much more complex
than the generated query. This is why Xerial is designed to use the direct
`WHERE` clause in stead of creating query from the structured parameter.
For HTTP request, however, the direct clause is not allowed due to
the security. In the Gaimon, this Route will be directly used from
the [Table](frontend/DataTable.md).

The response of the Route will be :
```JSON
{
	"isSuccess": true,
	"result": {

	}
}
```

## DisplayController

## Data Processing

## Server Side Rendering

## Controller Extension