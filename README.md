# Gaimon

Gaimon is an open-source MVC Web Framework.

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

Afterwards, configurate files in /etc/gaimon/.

## Build

```bash
./setup.py bdist_wheel
check-wheel-contents dist/
```

## Docker Deployment

Firstly, file gaimon/config/production/Password.example.json
must be edited and saved to gaimon/config/production/Password.json.
Then, run followed command to prepare files :

```bash
gaimon-docker-prepare . production
```

Gaimon requires Xerial. However, Xerial is not published yet.
Hence, Xerial wheel file needs to be manually copied to local directory.

```bash
cp ../Xerial/dist/xerial-0.9-py3-none-any.whl ./dist
```

Note that Xerial must be built before to create Xerial wheel file.

Now, Docker image can be built and services can be started with command :

```bash
sudo docker build -t gaimon .
sudo docker-compose up -d
```

## Note to Docker

Add Docker to your enviroment means that an abstraction layer is added.
We don't recommend to use Docker as a silver bullet, which solves all of
your problems. The reasons are :

1. Additional administrative work to maintain containers.
2. Performance lost by network. Docker has minimal to nothing overhead for
CPU, memory and IO performance. But for network, Docker can has up to 50% of
overhead.

The good reasons for using Docker are :

1. Distribution of software to restricted environment. For this case,
if it is possible, we recommend to distribute wheel-file instead of
Docker, because wheel-file wins in ease of deployment.
2. Deployment in a high-available environment with Kubernetes,
where process monitoring, self heaaling and co can be utilised.

## Install docker on Ubuntu

The complete document can be found [here](https://docs.docker.com/engine/install/ubuntu/).

```bash
sudo apt-get remove docker docker-engine docker.io containerd runc
sudo apt-get update
sudo apt-get install ca-certificates curl gnupg lsb-release
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr share/keyrings/docker-archive-keyring.gpg
sudo echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-compose-plugin
```
