# PostgreSQL Replication

This directory contains file for deployment of PostgreSQL replication
on Docker. It is recommended to use files in this directory as example
for actual deployment. Items in docker-compose.yml can be combined
with other items in the actual docker-compose.yml to utilised the
network, volumes and other stuffs.

# How to deploy

1. Edit Password.example.json and save as Password.json
2. Run folliwed command in terminal :

```bash
./ReplicationDeployment.py
```

It will generate files and run execute command to start PostgreSQL
primary server with 2 replications.