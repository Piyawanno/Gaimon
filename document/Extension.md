# Extension

In aspect of application, Gaimon out of the box provides a set of limited capabilities.
The application in Gaimon can be created with **Extension**, which contains 
multiple set of [MVC](MVC.md), [Front-End](frontend/README.md),
[Back-Office](BackOffice.md), [MicroService](microservice/README.md) and other components
to provide a functioning application. As the name suggests, Extension can be
enabled or disabled according to the need of users. One Extension can depend
on the other. The dependencies will be auto automatically resolved.

## Module and Extension

Module in Python programming language is additional library, which can be manage
with `pip`. A Gaimon Extension must also be packed into a module and can be manage
like other Python Module. A Module can contain however, more than one Extension.
In the source code of a Module, a `setup.py` file is recommended to support
some operation e.g. install required package, create wheel file.
Gaimon provides a CLI tool for creating a Python Module :

```bash
gaimon-module-create
```

After running the command, the script will ask some questions and a
Module with some files and directories will be created. As an example,
a Module named `eshopping` (EShopping) is created the followed
directory structure will be created. :

    .
    ├── document
    │   └── README.md 
    ├── eshopping
    │   └── __init__.py 
    ├── script
    │   └── README.md 
    ├── setup.py
    ├── requirements.txt
    ├── MANIFEST.in
    └── README.md 

To make the module for Gaimon usable, the script `setup.py` will be called.:

```bash
sudo ./setup.py link
```

For the development process, we recommend to use the operation `link`.
The Module folder `eshopping` will be soft linked to the library folder
of Python. By changing and modifying the module, it will take effect
system wide. The other option is .:

```bash
sudo ./setup.py install
```

The Module folder `eshopping` will be copied to the library folder of Python
and it is isolated to the development folder.

## Creating Extension

After creating a Module, an extension can be created under the directory `eshopping`.:

```bash
gaimon-extension-create
```

Under the module `eshopping`, the Extension with the name `product` (`eshopping.product`)
with the label `Cart` will be created with the structure :

    .
    ├── document
    │   └── README.md 
    ├── eshopping
    │   ├── product
    │   │   ├── config
    │   │   │   ├── entity
    │   │   │   │   └── Cart.json
    │   │   │   ├── global
    │   │   │   │   └── Cart.json
    │   │   │   └── user
    │   │   │       └── Cart.json
    │   │   ├── controller
    │   │   │   └── __init__.py
    │   │   ├── document
    │   │   │   └── README.md
    │   │   ├── file
    │   │   │   └── README.md
    │   │   ├── locale
    │   │   │   └── README.md
    │   │   ├── model
    │   │   │   └── __init__.py
    │   │   ├── script
    │   │   │   └── README.md
    │   │   ├── service
    │   │   │   └── __init__.py
    │   │   ├── share
    │   │   │   ├── css
    │   │   │   │   └── Cart.css
    │   │   │   ├── icon
    │   │   │   │   └── README.md
    │   │   │   ├── image
    │   │   │   │   └── README.md
    │   │   │   └── js
    │   │   │       └── Cart.js
    │   │   ├── util
    │   │   │   └── __init__.py
    │   │   ├── view
    │   │   │   └── client
    │   │   │       ├── Cart.tpl
    │   │   │       └── icon
    │   │   │           └── Default.tpl
    │   │   ├── CartExtension.py
    │   │   ├── Extension.json
    │   │   ├── README.md
    │   │   └── __init__.py
    │   └── __init__.py
    ├── script
    │   └── README.md 
    ├── setup.py
    ├── requirements.txt
    ├── MANIFEST.in
    └── README.md 

Yes, it creates a lot of files and folders. They all are useful for the development.
In this document, each files and folders will be described. Note that, after
installing the Module with the operation `link`, the Extension must not be
explicitly installed.

## Enabling Extension

After creating Module, installing Module and creating Extension, the Extension
is still not ready to be used under Gaimon. To enable the extension, the script
can be called :

```bash
gaimon-extension-enable eshopping.product
```

Now, after restarting Gaimon, the Extension `eshopping.product` is ready to used.
If the extension contains any Model, the related database tables will be created
or modified according to the Model. To see the enabled Extensions, 2 Configuration
files can be shown :

```bash
cat /etc/gaimon/Gaimon.json
```

In this Configuration file, all important parameters are stored. The enabled Extensions
can be found under the keyword `extension` as a list of strings.

The other part will be stored in the file `/etc/gaimon/Extension.json` :

```bash
cat /etc/gaimon/Extension.json
```

It contains just the list of enabled Extensions. To disable an Extension, make sure
that the name of Extension is removed from both files.

## Extension Structure

As shown in before, an Extension has a comprehensive structure and can be described
as followed :

### Extension.json

This file contains the basic configuration of the Extension, which will be
dynamically loaded by Gaimon at the start :

- Required Extensions
- Provided Role for the [Permission](Permission.md)
- Initialization information for the [Back-Office](BackOffice.md).

### Extension.py

The name of the file contains also the name of the Extension, for our example
the file should have the name `CartExtension.py`. It contains a class inherited
from the class [`gaimon.core.Extension.Extension`](api/gaimon/core/Extension.md) for
the functional hooks of the Extension, which will be called by starting Gaimon.
Please, read the API document for more information. The important methods to be
implemented are :

- **initialize** will be called by the first time the Extension is loaded to Gaimon.
- **load** will be called by every start of Gaimon.
- **activate** will be called by creating an **Entity**.
- **activateByUserCreation** will be call by creating an user.

### Directory : config

This directory contains configuration files for 3 different type :

- **global** : Configuration files in this folder will be copied to the main configuration
  folder `/etc/gaimon/extension/product/`. The administrator permission is required
  for modification of the installed configuration, which will be read by starting Gaimon.
  It has effect to the entire GaimonApplication.
- **entity** : Configuration files in this folder will be copied to the resource path
  and is designed to be changed on the fly. It has effect to the given Entity.
- **entity** : Like in `entity` configuration files in this folder will be copied to the 
  resource path . It has effect to the given User.
### Directory : controller

This folder contains the `Controller` files.
### Directory : file

This folder contains static files for the Extension. The different to the folder
`share` is that the static files in the folder `file` cannot be accessed over
HTTP/HTTPS. It is designed to be used internally.

### Directory : locale

This folder contains files for [Internalization](Internationalization.md) data.

### Directory : model

This folder contains the `Model` files.

### Directory : script

This folder contains executable script files, which will be installed
into the system and can be used as utilities over the shell.
Or they can be the starting script for [MicroService](microservice/README.md).
Note that the scripts can be automatically installed by adding the relative
path of the script to the `setup.py` of the Module in the attribute
`self.extensionScript` of the `Setup` class.

### Directory : service

This folder contains the [`MicroService`](microservice/README.md) folders.

### Directory : share

This folder contains static files, which should be published over HTTP/HTTPS.
Note that the uploaded files will be stored in `/var/gaimon/upload`,
which also can be accessed over HTTP/HTTPS. The static files in `share` folder
of an Extension can be accessed over the URL
`http//yourdomain.com/share/product/css/Cart.css`, where `product` is the Extension name
and the UTL will access the file

    .
    └── eshopping
        └── product
            └── share
                └── css
                    └── Cart.css

Note that the folder `share` and `product` are in different order, since Gaimon uses
the keyword `share` to designate the static file.
### Directory : util

This folder contains the utility code base. In some situation, a piece of
code should be used in different places for example in `Controller`
and also in `MicroService`. To make it reuseable, the piece of code should
be placed in the `util`, which can be called from everywhere inside and
outside the extensions.
### Directory : view

This folder contains the [`Mustache`](https://mustache.github.io/) template
for server side as well as for client side.




