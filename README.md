# Enstrayed API
This repository contains the code for my personal web API written in JavaScript using the Express framework. 

## Documentation
This file contains documentation relevant for development and deployment, but not necessarily usage. Information for all endpoints is available [on my website](https://music.youtube.com/watch?v=n2LxBXS4jJM&si=ZpzGNBGvQp1cFicW).

## Issues
If you would like to report a bug or security issue, please open a GitHub issue. If you are the operator of a service this application accesses, use the contact information provided during registration with your service to contact me directly.

## Configuration
On startup, this application will look for two files. If either cannot be read, it will exit with an error code.
1. `config.json` contains settings required for operation and API keys used for calling external services.
2. `GITVERSION` contains the commit that was cloned when the container was built. 

<details> <summary>Configuration Example</summary>

* `couchdb.host`: Hostname/IP address and port of a CouchDB server.
* `couchdb.authorization`: Username & password used to access the CouchDB server, in HTTP Basic authentication format, e.g. `username:password`.
* `blog.postsDirectory`: Directory that will be parsed when calling /blogposts. If running in Docker this directory will need to be mounted to the container.
* `blog.postsDirUrl`: Location of the posts directory on the web server.
* `nowplaying.*.target`: Set to the Last.fm/Jellyfin username to query for playback information.

```json
{
    "startup": {
        "apiPort": 8081,
        "routesDir": "./routes"
    },

    "couchdb": {
        "host": "hazeldale:5984",
        "authorization": ""
    },

    "mailjet": {
        "apiKey": "",
        "senderAddress": "apinotifications@enstrayed.com",
        "senderName": "API Notifications",

        "authKeysDoc": "mailjet"
    },

    "blog": {
        "postsDirectory": "C:/Users/natha/Downloads/proto/posts",
        "postsDirUrl": "/posts"
    },

    "nowplaying": {
        "lastfm": {
            "apiKey": "",
            "target": "enstrayed"
        },
        "jellyfin": {
            "apiKey": "",
            "host": "",
            "target": ""
        },
        "cider": {
            "apiKeys": [],
            "hosts": []
        }
    }

}
```

</details>

## Docker
In production, this application is designed to be run in Docker, and the container built by pulling the latest commit from the main branch. As such, deploying this application is just a matter of creating a directory and copying the Dockerfile:

> [!IMPORTANT]
> Please review the Configuration section of this document for important information. By default, the `config.json` file is expected to be mounted into the container at `/app/config.json`. 

```dockerfile
FROM node:20
WORKDIR /app

RUN git clone https://github.com/enstrayed/enstrayedapi .
RUN git config --global --add safe.directory /app 
RUN git show --oneline -s >> GITVERSION
RUN npm install

ENTRYPOINT [ "node", "index.js" ]
```

<details> <summary>Docker Compose File</summary>

```yaml
---
services:
  enstrayedapi:
    build:
      context: .
    image: enstrayedapi
    container_name: enstrayedapi
    restart: unless-stopped
    volumes:
      - ./config.json:/app/config.json
```

</details>

## License
If for whatever reason you want to, you are free to adapt this code for your own projects or as reference. However, this software is provided as-is with no warranty or agreement to support it. 