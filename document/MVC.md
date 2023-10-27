# MVC

Model View Controller or MVC is a generic coding paradigm, in which the code
will be separated mainly in 3 groups : Model, View and Controller.
It is a well-known and widely used in many application especially
in the development of Web-Application. Gaimon and many other Web-Application
frameworks follow the MVC paradigm. However, in each framework,
the tasks of Model, View and Controller are differently defined.

## Model

In the most Web-Application frameworks, Model will defined, how the data
will be processed e.g. ingest and query of data into or from database.
The data structure will defined within the database via table structure.
Hence, by changing data structure of the Model, an external application for
accessing database is required at least the CLI of database.
Gaimon, on the other hand, tries to manage the data structure with code.
Hence, Model in Gaimon is mostly the description of the data structure
base on [Xerial](https://github.com/Piyawanno/Xerial).
The data processing will be executed under Controller, since a Model class
should represent the table structure in the database and a Model object
then a record of the given table in the database. Hence, a table or a record
should not manage itself, but should be managed from external component
like a Controller. Beside the data structure, a Model has also the task
to process own attribute, which represents a cell in the database table.

See [Model](Model.md) for more information.
## View

View in Gaimon is very comprehensive and consists of multiple parts :

- Template : Gaimon uses [Mustache](https://mustache.github.io/) as template engine
  for server-side rendering as well as for client side.
- JavaScript : Gaimon uses many external JavaScript libraries and creates own
  libraries for the implementation of UI for [Front-End](frontend/README.md)
  and for [Back-Office](BackOffice.md).
- CSS : Gaimon uses vanilla CSS to set look & feel of UI.

Moreover, Gaimon provides [Theming system](Theme.md) and
[Internationalization](Internationalization.md)

## Controller

Controller is has the followed tasks :

- It is the start point of user request and process all the data according to the request.
- It controls the permission : Which user has the right to which function.
- It handle the data in the data base : Data ingest, data query.
- It renders the server-side HTML page.

Note that the functionality of a controller in an extension can be extended with
the [Decorator](Decorator.md) in the other extension. The Decorator is the method
to implement **Open/Close** principle in the **SOLID**.

See [Controller](Controller.md) for more information.

## MVC Set

In Gaimon, a set of MVC is defined as Model + Controller + JavaScript Page for
a database table, which can be related to multiple database tables. Note that
a JavaScript Page consists mostly of 2 files : [Page](frontend/Page.md) &
[Protocol](frontend/Protocol.md). To create a set of MVC, firstly
a [Module and Extension](Extension.md) must be created and then
the script `gaimon-mvc-create` can be used.:

```bash
gaimon-mvc-create
```

The script will ask some questions and automatically generate files for a set of MVC.
As an example, the Module `eshopping` and the Extension `product` is created and
the MVC set `Product` will be created. The folder structure will be extended
as followed :

    .
    ├── eshopping
    │   └── product
    │   │   ├── controller
    │   │   │   └── ProductController.py
    │   │   ├── model
    │   │   │   └── Product.py
    │   │   ├── share
    │   │   │   └── js
    │   │   │       ├── ProductPage.py
    │   │   │       └── protocol
    │   │   │           └── ProductProtocol.js