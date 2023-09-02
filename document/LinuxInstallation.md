# Installation Gaimon on Linux for Development

Linux is the recommended operating system for Gaimon.
In this instruction, it is oriented on Ubuntu-20.04, Ubuntu-22.04
and Debian-10. Gaimon can be used the other OS or linux distribution,
it is however not well tested.


## Base Package Installation

The first step is installing the base package for Gaimon with the
followed commands:

```bash
sudo apt-get update
sudo apt-get install python3 python3-pip
```

Note that this command can be used for Ubuntu and Debian distribution
almost for all version.

## Setup Required Package

The other required packages for Gaimon can be installed by go to the
folder of Gaimon and execute the command :

```bash
sudo ./setup.py setup
```

For more information and options about the setup script of Gaimon,
the manual page of `setup.py` can be read :

```bash
./setup.py -h
```

## Preparing Database

On the WSL, the service might not automatically start. To start the
required service like PostgreSQL and Regis the followed command can be used :

```bash
sudo service postgresql restart
sudo service redis-server restart
```

Afterwards, PostgreSQL can be accessed and ready for creating a new database.
To get the root-access of PostgreSQL on Ubuntu or Debian based distribution,
the linux-user have to be changed to `postgres` and access to PostgreSQL-CLI :

```bash
sudo -u postgres psql 
```

After entering PostgreSQL-CLI, database and user can be created :

```SQL
CREATE DATABASE gaimon;
CREATE USER gaimonuser WITH PASSWORD 'MY_SERCRET_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE gaimon to gaimonuser;
```

In the above SQL command, the database with the name `gaimon`, user with
the name `gaimonuser` and password `MY_SECRET_PASSWORD` is created.
Theses information will be used for the configutation of Gaimon.

## Installing Gaimon

To install Gaimon into the OS, the followed command can be executed :

```bash
sudo ./setup.py link
```

From this step, `setup.py` script will check the required configuration,
if not existing, the required information will be requested over the CLI.
Note that host of Database should be `localhost` and port of PostgreSQL `5431`.
For further configuration, the configuration file in `/etc/gaimon/`
can be edited, see [Configuration](configuration/README.md) for more information.

## Up and Running

The final step is to start the Gaimon server :

```bash
sudo gaimon
```

Now the site can be access via Web-Browser under the URL
`http://localhost:8080/backend`. But!, what is the user name
and password of Gaimon. By default, no user is created but
can be created with :

```bash
sudo gaimon-user-create -u root
```

The CLI will ask for the password. The created user will have the
`root permission` and can access everything on the created Web-Application.
We recommend to create only one root user via CLI, the other user
should be created over Web User Interface.

