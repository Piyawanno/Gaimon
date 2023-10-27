# Gaimon

Gaimon is a MVC Web-Application Framework built on top of
[Sanic](https://sanic.dev/en/), aims to provide rapid development for
Full-Stack and Cross-Platform application.

## Installation

For production :

```bash
sudo ./setup.py setup -p ubuntu20.04
sudo ./setup.py install
```

For development :

```bash
sudo ./setup.py setup -p ubuntu20.04
sudo ./setup.py link
```

Afterwards, configure files in /etc/gaimon/.

## Build

```bash
./setup.py bdist_wheel
check-wheel-contents dist/
```
For more information and document see [Gaimon Document](document/README.md).