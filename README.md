# Redis Installition

## if you have not installed WSL. In command prompt

`wls --install`

## Install Ubuntu

ype the command to install Ubuntu on your Windows as the subsystem:

`wsl.exe -–install Ubuntu`

## Run ubuntu

Windows subsystem for linux

## install redis (windows or Linux)

To install Redis on Linux or Windows with Windows Subsystem for Linux, open the terminal (On Windows- The terminal we will use is the terminal of the Ubuntu subsystem for Linux ) and run the following commands:

```bash
curl -fsSL https://packages.redis.io/gpg | sudo gpg --dearmor -o /usr/share/keyrings/redis-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/redis-archive-keyring.gpg] https://packages.redis.io/deb $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/redis.list
sudo apt-get update
sudo apt-get install redis

```

## Run redis server

`redis-server`

The server will wait for connections until we close it.

If the port is blocked (used by a previous instance of the server), you need to end the process running on that port. If necessary, you can solve it with the command:

`sudo fuser -k 6379/tcp`

## Run Redis CLI

Next, run the Redis CLI in the other terminal window:
`redis-cli`

## for redis install

https://redis.io/docs/latest/operate/oss_and_stack/install/install-stack/

## Redis Cloud

https://redis.io/docs/latest/operate/rc/
