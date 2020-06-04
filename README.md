# Beepus
A discord bot for the CAA discord server

To run as a docker container
```
docker run -d -p 4747:4747/tcp -v /path/to/your/db.sqlite:/app/db.sqlite -v /path/to/your/secrets.json:/app/build/config/secrets.json dusterthefirst/beepus:latest
```